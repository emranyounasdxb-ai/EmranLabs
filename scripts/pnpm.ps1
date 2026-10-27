# Preserve CLI flags such as node -e without PowerShell common-parameter binding.
$PnpmArguments = $args

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$projectCorepack = Join-Path $projectRoot 'node_modules/corepack/dist/corepack.js'
if (-not (Test-Path -LiteralPath $projectCorepack)) {
    throw 'Install dependencies first with Corepack 0.36.0 and pnpm 12.15.0. See README.md.'
}

Push-Location $projectRoot
try {
    & node $projectCorepack pnpm @PnpmArguments
    $commandExitCode = $LASTEXITCODE
} finally {
    Pop-Location
}
exit $commandExitCode
