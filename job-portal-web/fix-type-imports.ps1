param(
  [string]$Root = "."
)

$ErrorActionPreference = "Stop"

# Map of module => type names that must be imported as types
$Modules = @{
  "@reduxjs/toolkit" = @("PayloadAction","SerializedError");
  "react-redux"      = @("TypedUseSelectorHook");
  "axios"            = @("AxiosInstance","AxiosError","AxiosRequestConfig","AxiosResponse","InternalAxiosRequestConfig");
}

# Helper: normalize specifier (trim, collapse spaces)
function Normalize-Spec([string]$s) {
  return ($s -replace "\s+", " ").Trim()
}

# Process all TS/TSX files
$files = Get-ChildItem -Path $Root -Recurse -Include *.ts,*.tsx | Where-Object { -not $_.PSIsContainer }
$updated = 0

foreach ($file in $files) {
  $code = Get-Content -Raw -LiteralPath $file.FullName
  $orig = $code
  foreach ($module in $Modules.Keys) {
    $typeNames = $Modules[$module]

    # Find all named-import lines for this module, e.g.: import { A, B } from 'module';
    $pattern = "import\s*\{([^}]*)\}\s*from\s*['""]" + [regex]::Escape($module) + "['""]\s*;?"
    $matches = [regex]::Matches($code, $pattern)

    # We replace from the end to keep indices valid
    for ($i = $matches.Count - 1; $i -ge 0; $i--) {
      $m = $matches[$i]
      $inside = $m.Groups[1].Value
      $specs = $inside -split "," | ForEach-Object { Normalize-Spec $_ } | Where-Object { $_ -ne "" }

      if ($specs.Count -eq 0) { continue }

      $typesFound  = New-Object System.Collections.Generic.List[string]
      $valuesFound = New-Object System.Collections.Generic.List[string]

      foreach ($s in $specs) {
        # handle "Foo as Bar" by checking the original left identifier only
        $left = ($s -split "\s+as\s+", 2)[0].Trim()
        if ($typeNames -contains $left) {
          $typesFound.Add($s)
        } else {
          $valuesFound.Add($s)
        }
      }

      if ($typesFound.Count -gt 0) {
        # 1) Build replacement for the current line (values only; or remove if none)
        $newNamed = ""
        if ($valuesFound.Count -gt 0) {
          $newNamed = "import { " + (($valuesFound | Sort-Object -Unique) -join ", ") + " } from '$module';"
        }

        # Replace the exact span
        $code = $code.Remove($m.Index, $m.Length).Insert($m.Index, $newNamed)

        # 2) Ensure a single type-only import for all found types (dedup + strip "as ...")
        $typeList = $typesFound |
          ForEach-Object { ($_ -split "\s+as\s+", 2)[0].Trim() } |
          Sort-Object -Unique

        if ($typeList.Count -gt 0) {
          $typeOnlyLine = "import type { " + ($typeList -join ", ") + " } from '$module';"

          # Check if we already have a type-only import that contains ALL required names
          $existingTypeImportPattern = "import\s+type\s*\{([^}]*)\}\s*from\s*['""]" + [regex]::Escape($module) + "['""]\s*;?"
          $existingMatch = [regex]::Matches($code, $existingTypeImportPattern)

          $hasAll = $false
          foreach ($em in $existingMatch) {
            $existingNames = ($em.Groups[1].Value -split "," | ForEach-Object { Normalize-Spec $_ }) |
              ForEach-Object { ($_ -split "\s+as\s+", 2)[0].Trim() }
            if (@($typeList | Where-Object { $existingNames -contains $_ }).Count -eq $typeList.Count) {
              $hasAll = $true
              break
            }
          }

          if (-not $hasAll) {
            # Insert the type-only import before first import or at top
            $firstImportIdx = $code.IndexOf("import ")
            if ($firstImportIdx -ge 0) {
              $code = $code.Insert($firstImportIdx, "$typeOnlyLine`r`n")
            } else {
              $code = "$typeOnlyLine`r`n$code"
            }
          }
        }
      }
    }
  }

  if ($code -ne $orig) {
    Set-Content -LiteralPath $file.FullName -Encoding UTF8 -NoNewline -Value $code
    Write-Host "Updated $($file.FullName)"
    $updated++
  }
}

Write-Host "`n$updated file(s) updated. If Vite is running, restart it."
