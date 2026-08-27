# PowerShell script to run Spring Boot Backend
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.12.101-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;C:\Users\buikh\.maven\apache-maven-3.9.8\bin;$env:PATH"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Starting Motel Management Backend API..." -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot\backend"

if (Test-Path ".\mvnw.cmd") {
    .\mvnw.cmd spring-boot:run
} else {
    mvn spring-boot:run
}
