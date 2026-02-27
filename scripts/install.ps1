# m-control Installation Script for Windows
# Can be run from anywhere:
#   .\scripts\install.ps1          (from repo root)
#   pwsh ".\install.ps1"           (from scripts\ dir)

param(
    [string]$InstallPath = "$env:USERPROFILE\.m-control"
)

# $PSScriptRoot = directory of this script (scripts\)
# Split-Path -Parent gives us the repo root
$RepoRoot = Split-Path -Parent $PSScriptRoot

Write-Host "=== m-control Installer ===" -ForegroundColor Cyan
Write-Host "Repo root: $RepoRoot"
Write-Host ""

try {
    $nodeVersion = node --version
    Write-Host "OK Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "FAIL Node.js not found. Install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

try {
    $yarnVersion = yarn --version
    Write-Host "OK yarn detected: $yarnVersion" -ForegroundColor Green
} catch {
    Write-Host "FAIL yarn not found. Install via: npm install -g yarn" -ForegroundColor Red
    exit 1
}

Push-Location $RepoRoot

try {
    Write-Host ""
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    yarn install
    if ($LASTEXITCODE -ne 0) { throw "yarn install failed" }
    Write-Host "OK Dependencies installed" -ForegroundColor Green

    Write-Host ""
    Write-Host "Building project..." -ForegroundColor Yellow
    yarn build
    if ($LASTEXITCODE -ne 0) { throw "yarn build failed" }
    Write-Host "OK Build successful" -ForegroundColor Green

    $mctlBundle        = Join-Path $RepoRoot "apps\mctl\dist\bundle\index.js"
    $configTemplateSrc = Join-Path $RepoRoot "config\config.template.json"

    if (-not (Test-Path $mctlBundle)) {
        throw "Bundle not found: $mctlBundle"
    }

    Write-Host ""
    Write-Host "Installing to: $InstallPath" -ForegroundColor Yellow
    if (-not (Test-Path $InstallPath)) {
        New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
    }

    # Copy single-file bundle and config template
    Copy-Item -Path $mctlBundle        -Destination "$InstallPath\mctl.js"               -Force
    Copy-Item -Path $configTemplateSrc -Destination "$InstallPath\config.template.json"  -Force
    Write-Host "OK Files copied" -ForegroundColor Green

    # Wrappers point to mctl.js (ncc bundle — no node_modules required)
    $mctlWrapper = "@echo off`r`nnode `"%USERPROFILE%\.m-control\mctl.js`" %*"
    $mmWrapper   = "@echo off`r`nnode `"%USERPROFILE%\.m-control\mctl.js`" %*"
    Set-Content -Path "$InstallPath\mctl.cmd" -Value $mctlWrapper -Force
    Set-Content -Path "$InstallPath\mm.cmd"   -Value $mmWrapper   -Force
    Write-Host "OK Command wrappers created (mctl.cmd, mm.cmd)" -ForegroundColor Green

    Write-Host ""
    Write-Host "Adding to PATH..." -ForegroundColor Yellow
    $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    if ($currentPath -notlike "*$InstallPath*") {
        [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$InstallPath", "User")
        Write-Host "OK Added to PATH" -ForegroundColor Green
        Write-Host "IMPORTANT: Restart your terminal for PATH changes to take effect!" -ForegroundColor Yellow
    } else {
        Write-Host "OK Already in PATH" -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "Initializing configuration..." -ForegroundColor Yellow
    $configPath = "$env:USERPROFILE\.m-control\config.json"
    if (-not (Test-Path $configPath)) {
        Copy-Item -Path "$InstallPath\config.template.json" -Destination $configPath -Force
        Write-Host "OK Config initialized at: $configPath" -ForegroundColor Green
        Write-Host "Edit the config file to add your credentials:" -ForegroundColor Cyan
        Write-Host "  $configPath" -ForegroundColor White
    } else {
        Write-Host "OK Config already exists, skipping" -ForegroundColor Green
    }

    Write-Host ""
    Write-Host "=== Installation Complete! ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Restart your terminal"
    Write-Host "  2. Run 'mctl --help' to verify"
    Write-Host "  3. Fill in credentials in: $configPath"
    Write-Host ""

} catch {
    Write-Host ""
    Write-Host "FAIL $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}
