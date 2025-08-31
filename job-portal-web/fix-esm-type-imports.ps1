param(
  [string]$Root = "."
)

$ErrorActionPreference = "Stop"

# === Modules and their type-only exports we want to enforce ===
$ModuleTypeMap = @{
  "@reduxjs/toolkit" = @(
    "PayloadAction","SerializedError","ActionReducerMapBuilder",
    "ThunkAction","ThunkDispatch","AnyAction","EnhancedStore",
    "StoreEnhancer","Middleware","MiddlewareAPI","Dispatch"
  );
  "react-redux" = @("TypedUseSelectorHook");
  "axios" = @("AxiosInstance","AxiosError","AxiosRequestConfig","AxiosResponse","InternalAxiosRequestConfig");
}

function Normalize-Spec([string]$s) {
  return ($s -replace "\s+", " ").Trim()
}

function Dedup-Join([string[]]$arr) {
  return ($arr | Where-Object { $_ -and $_.Trim() -ne "" } | Sort-Object -Unique) -join ", "
}

function Get-ImportMatches([string]$code, [string]$module) {
  # (?s) = singleline so dot matches newline
  $namedOnly   = [regex]::Matches($code, "(?s)import\s*\{([^}]*)\}\s*from\s*(['""])$([regex]::Escape($module))\2\s*;?")
  $defaultPlus = [regex]::Matches($code, "(?s)import\s+([A-Za-z0-9_\$]+)\s*,\s*\{([^}]*)\}\s*from\s*(['""])$([regex]::Escape($module))\3\s*;?")
  return @{
    NamedOnly   = $namedOnly
    DefaultPlus = $defaultPlus
  }
}

function Ensure-TypeOnlyImport([ref]$codeRef, [string]$module, [string[]]$neededTypes) {
  if (-not $neededTypes -or $neededTypes.Count -eq 0) { return }

  $code = $codeRef.Value

  # Find existing "import type { ... } from 'module';"
  $pattern = "(?s)import\s+type\s*\{([^}]*)\}\s*from\s*(['""])$([regex]::Escape($module))\2\s*;?"
  $matches = [regex]::Matches($code, $pattern)

  $namesToAdd = $neededTypes | Sort-Object -Unique

  if ($matches.Count -gt 0) {
    # Merge into the first match (enough for our purposes)
    $m = $matches[0]
    $existingNames = $m.Groups[1].Value -split "," | ForEach-Object { Normalize-Spec $_ } |
      ForEach-Object { ($_ -split "\s+as\s+", 2)[0].Trim() }

    $merged = Dedup-Join ($existingNames + $namesToAdd)
    $newLine = "import type { $merged } from '" + $module + "';"
    $code = $code.Remove($m.Index, $m.Length).Insert($m.Index, $newLine)
  } else {
    $typeLine = "import type { " + (Dedup-Join $namesToAdd) + " } from '" + $module + "';"
    # insert before first import if possible, else at top
    $firstImport = [regex]::Match($code, "(?m)^\s*import\s")
    if ($firstImport.Success) {
      $code = $code.Insert($firstImport.Index, $typeLine + "`r`n")
    } else {
      $code = $typeLine + "`r`n" + $code
    }
  }

  $codeRef.Value = $code
}

function Process-Module([ref]$codeRef, [string]$module, [string[]]$typeNames) {
  $code = $codeRef.Value
  $changed = $false
  $foundTypesInFile = @()

  # Handle named-only imports
  $all = Get-ImportMatches -code $code -module $module

  # Process NamedOnly from bottom up (stable indices)
  for ($i = $all.NamedOnly.Count - 1; $i -ge 0; $i--) {
    $m = $all.NamedOnly[$i]
    $inside = $m.Groups[1].Value
    $items = $inside -split "," | ForEach-Object { Normalize-Spec $_ } | Where-Object { $_ -ne "" }

    if ($items.Count -eq 0) { continue }

    $types   = New-Object System.Collections.Generic.List[string]
    $values  = New-Object System.Collections.Generic.List[string]

    foreach ($spec in $items) {
      $left = ($spec -split "\s+as\s+", 2)[0].Trim()
      if ($typeNames -contains $left) { $types.Add($left) } else { $values.Add($spec) }
    }

    if ($types.Count -gt 0) {
      $foundTypesInFile += $types
      if ($values.Count -gt 0) {
        $replacement = "import { " + (Dedup-Join $values) + " } from '" + $module + "';"
      } else {
        $replacement = ""  # remove the whole statement
      }
      $code = $code.Remove($m.Index, $m.Length).Insert($m.Index, $replacement)
      $changed = $true
    }
  }

  # Refresh matches since indices changed
  $all = Get-ImportMatches -code $code -module $module

  # Process DefaultPlus: import Default, { A, B } from 'module'
  for ($i = $all.DefaultPlus.Count - 1; $i -ge 0; $i--) {
    $m = $all.DefaultPlus[$i]
    $defaultName = $m.Groups[1].Value.Trim()
    $inside = $m.Groups[2].Value
    $quote  = $m.Groups[3].Value
    $items = $inside -split "," | ForEach-Object { Normalize-Spec $_ } | Where-Object { $_ -ne "" }

    if ($items.Count -eq 0) { continue }

    $types  = New-Object System.Collections.Generic.List[string]
    $values = New-Object System.Collections.Generic.List[string]

    foreach ($spec in $items) {
      $left = ($spec -split "\s+as\s+", 2)[0].Trim()
      if ($typeNames -contains $left) { $types.Add($left) } else { $values.Add($spec) }
    }

    if ($types.Count -gt 0) {
      $foundTypesInFile += $types
      if ($values.Count -gt 0) {
        $replacement = "import $defaultName, { " + (Dedup-Join $values) + " } from " + $quote + $module + $quote + ";"
      } else {
        $replacement = "import $defaultName from " + $quote + $module + $quote + ";"
      }
      $code = $code.Remove($m.Index, $m.Length).Insert($m.Index, $replacement)
      $changed = $true
    }
  }

  if ($changed -and $foundTypesInFile.Count -gt 0) {
    $uniqueFound = $foundTypesInFile | Sort-Object -Unique
    Ensure-TypeOnlyImport -codeRef ([ref]$code) -module $module -neededTypes $uniqueFound
  }

  $codeRef.Value = $code
  return $changed
}

$files = Get-ChildItem -Path $Root -Recurse -Include *.ts,*.tsx | Where-Object { -not $_.PSIsContainer }

$updated = 0
foreach ($file in $files) {
  $code = Get-Content -Raw -LiteralPath $file.FullName
  $orig = $code

  foreach ($module in $ModuleTypeMap.Keys) {
    $typeNames = $ModuleTypeMap[$module]
    [void](Process-Module -codeRef ([ref]$code) -module $module -typeNames $typeNames)
  }

  if ($code -ne $orig) {
    Set-Content -LiteralPath $file.FullName -Encoding UTF8 -NoNewline -Value $code
    Write-Host "Fixed imports in $($file.FullName)"
    $updated++
  }
}

Write-Host "`n$updated file(s) updated."
