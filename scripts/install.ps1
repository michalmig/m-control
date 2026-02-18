# m-control Installation Script for Windows
# This script builds the project and installs it to user's PATH

param(
    [string]$InstallPath = "$env:USERPROFILE\.m-control"
)

Write-Host "=== m-control Installer ===" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Build the project
Write-Host ""
Write-Host "Building project..." -ForegroundColor Yellow
try {
    yarn install
    yarn build
    Write-Host "✓ Build successful" -ForegroundColor Green
} catch {
    Write-Host "✗ Build failed" -ForegroundColor Red
    exit 1
}

# Create installation directory
Write-Host ""
Write-Host "Installing to: $InstallPath" -ForegroundColor Yellow
if (-not (Test-Path $InstallPath)) {
    New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
}

# Copy files
Copy-Item -Path ".\dist\mctl.js" -Destination "$InstallPath\mctl.js" -Force
Copy-Item -Path ".\dist\index.d.ts" -Destination "$InstallPath\index.d.ts" -Force -ErrorAction SilentlyContinue
Copy-Item -Path ".\config\config.template.json" -Destination "$InstallPath\config.template.json" -Force
Copy-Item -Path ".\node_modules" -Destination "$InstallPath\node_modules" -Recurse -Force

Write-Host "✓ Files copied" -ForegroundColor Green

# Create wrapper scripts
$mctlWrapper = @"
@echo off
node "%USERPROFILE%\.m-control\mctl.js" %*
"@

$mmWrapper = @"
@echo off
node "%USERPROFILE%\.m-control\mctl.js" %*
"@

Set-Content -Path "$InstallPath\mctl.cmd" -Value $mctlWrapper -Force
Set-Content -Path "$InstallPath\mm.cmd" -Value $mmWrapper -Force

Write-Host "✓ Command wrappers created (mctl.cmd, mm.cmd)" -ForegroundColor Green

# Add to PATH
Write-Host ""
Write-Host "Adding to PATH..." -ForegroundColor Yellow

$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($currentPath -notlike "*$InstallPath*") {
    [Environment]::SetEnvironmentVariable(
        "PATH",
        "$currentPath;$InstallPath",
        "User"
    )
    Write-Host "✓ Added to PATH" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT: Restart your terminal for PATH changes to take effect!" -ForegroundColor Yellow
} else {
    Write-Host "✓ Already in PATH" -ForegroundColor Green
}

# Initialize config
Write-Host ""
Write-Host "Initializing configuration..." -ForegroundColor Yellow
$configPath = "$InstallPath\config.json"
if (-not (Test-Path $configPath)) {
    Copy-Item -Path "$InstallPath\config.template.json" -Destination $configPath -Force
    Write-Host "✓ Config initialized at: $configPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "Please edit the config file and add your credentials:" -ForegroundColor Cyan
    Write-Host "  $configPath" -ForegroundColor White
} else {
    Write-Host "✓ Config already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== Installation Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Restart your terminal" -ForegroundColor White
Write-Host "  2. Run 'mctl' or 'mm' to start" -ForegroundColor White
Write-Host "  3. Fill in credentials in: $configPath" -ForegroundColor White
Write-Host ""
