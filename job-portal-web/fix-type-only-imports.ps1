param(
  [string]$Root = "."
)

$ErrorActionPreference = "Stop"

# Map of module -> set of names that must be imported as types
$TypeOnlyMap = @{
  "@reduxjs/toolkit" = @(
    "PayloadAction","SerializedError","ThunkAction","ThunkDispatch","Reducer","Action","AnyAction","Middleware","Store","CombinedState"
  );
  "react-redux" = @("TypedUseSelectorHook");
  "axios" = @("AxiosInstance","AxiosError","AxiosRequestConfig","AxiosResponse","InternalAxiosRequestConfig");
}

function Normalize-Names([string]$csv) {
  return ($csv -split "," | ForEach-Object { ($_ -replace "\s+", " ").Trim() } | Where-Object { $_ }) | ForEach-Object {
    # strip alias "X as Y" -> take original name before 'as'
    ($_ -split "\s+as\s+",2)[0].Trim()
  }
}

function Merge-TypeImport {
  param(
    [string]$Code,
    [string]$Module,
    [string[]]$NewNames
  )
  $namesToAdd = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
  $NewNames | ForEach-Object { [void]$namesToAdd.Add($_) }

  $rx = [regex]("(?ms)^import\s+type\s*\{\s*([^}]+?)\s*\}\s*from\s*['""]" + [regex]::Escape($Module) + "['""]\s*;")
  $m = $rx.Match($Code)
  if ($m.Success) {
    $existing = Normalize-Names $m.Groups[1].Value
    $existingSet = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::Ordinal)
    $existing | ForEach-Object { [void]$existingSet.Add($_) }

    foreach ($n in $namesToAdd) { [void]$existingSet.Add($n) }
    $merged = ($existingSet.ToArray() | Sort-Object) -join ", "
    return ($Code.Substring(0, $m.Index) + "import type { $merged } from `"$Module`";" + $Code.Substring($m.Index + $m.Length))
  } else {
    # Insert at top
    return "import type { $((@($namesToAdd.ToArray() | Sort-Object)) -join ', ') } from `"$Module`";`r`n" + $Code
  }
}

$files = Get-ChildItem -Path $Root -Recurse -Include *.ts,*.tsx | Where-Object { -not $_.PSIsContainer }

foreach ($f in $files) {
  $code = Get-Content -Raw -LiteralPath $f.FullName
  $original = $code

  foreach ($module in $TypeOnlyMap.Keys) {
    $typeNames = $TypeOnlyMap[$module]

    # Find value imports: import { ... } from 'module';
    $rx = [regex]("(?ms)import\s+(?!type\b)\{\s*([^}]+?)\s*\}\s*from\s*['""]" + [regex]::Escape($module) + "['""]\s*;")
    $typesCollected = New-Object System.Collections.Generic.HashSet[string]

    $code = [regex]::Replace($code, $rx, {
      param($m)
      $list = Normalize-Names $m.Groups[1].Value

      $valueSyms = New-Object System.Collections.Generic.List[string]
      foreach ($s in $list) {
        if ($typeNames -contains $s) { [void]$typesCollected.Add($s) }
        else { [void]$valueSyms.Add($s) }
      }

      if ($valueSyms.Count -gt 0) {
        "import { $($valueSyms -join ', ') } from `"$module`";"
      } else {
        # remove the entire import
        ""
      }
    })

    if ($typesCollected.Count -gt 0) {
      $code = Merge-TypeImport -Code $code -Module $module -NewNames $typesCollected.ToArray()
    }
  }

  if ($code -ne $original) {
    Set-Content -Encoding UTF8 -NoNewline -LiteralPath $f.FullName -Value $code
    Write-Host "Fixed type-only imports in $($f.FullName)"
  }
}
