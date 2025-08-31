param(
  [Parameter(Position=0)]
  [string]$Path = ".",

  [string[]]$ExcludeDirs = @(".git","node_modules","dist","build",".husky",".vscode"),

  # Optional output file to save the list
  [string]$OutFile
)

$ErrorActionPreference = "Stop"

# Normalize root path
$root = (Resolve-Path -LiteralPath $Path).Path

function Get-RelativePath {
  param(
    [string]$Base,
    [string]$Target
  )
  $baseFixed = ($Base.TrimEnd('\','/') + [IO.Path]::DirectorySeparatorChar)
  $baseUri = [Uri]$baseFixed
  $tUri    = [Uri]$Target
  $rel     = $baseUri.MakeRelativeUri($tUri).ToString()
  return [Uri]::UnescapeDataString($rel)
}

# Build exclusion regex (matches dir names as path segments, case-insensitive)
$excludePattern = $null
if ($ExcludeDirs -and $ExcludeDirs.Count -gt 0) {
  $escaped = $ExcludeDirs | ForEach-Object { [regex]::Escape($_) }
  # (?i) = ignore case; match at start or after a slash/backslash and before next slash/backslash or end
  $excludePattern = '(?i)(^|[\\/])(' + ($escaped -join '|') + ')([\\/]|$)'
}

# Get all files, filter to 0 bytes, exclude directories by pattern
$files = Get-ChildItem -LiteralPath $root -File -Recurse -Force -ErrorAction SilentlyContinue |
  Where-Object {
    $_.Length -eq 0 -and
    ( -not $excludePattern -or $_.FullName -notmatch $excludePattern )
  } |
  Sort-Object FullName

# Convert to relative paths
$rel = $files | ForEach-Object { Get-RelativePath -Base $root -Target $_.FullName }

Write-Host "Found $($rel.Count) empty file(s) under '$root'." -ForegroundColor Cyan
$rel | ForEach-Object { $_ }

# Optionally save to a file
if ($OutFile) {
  $rel | Set-Content -Path $OutFile -Encoding UTF8
  Write-Host "List saved to $OutFile" -ForegroundColor Green
}

# Pretty, grouped view
if ($rel.Count -gt 0) {
  Write-Host "`nGrouped by folder:" -ForegroundColor Cyan
  $rel |
    Group-Object { Split-Path $_ -Parent } |
    Sort-Object Name |
    ForEach-Object {
      $folder = if ($_.Name) { $_.Name } else { "(project root)" }
      Write-Host $folder -ForegroundColor Yellow
      $_.Group | ForEach-Object {
        Write-Host ("  +- " + (Split-Path $_ -Leaf))
      }
    }
}
