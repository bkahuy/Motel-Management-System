# PowerShell script to run React Frontend
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Starting Motel Management Frontend..." -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot\frontend"
npm run dev
