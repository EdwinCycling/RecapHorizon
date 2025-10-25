Write-Host "Starting RecapHorizon development server on port 3001..." -ForegroundColor Green
Write-Host ""
Write-Host "If port 3001 is already in use, please close the application using that port first." -ForegroundColor Yellow
Write-Host ""

# Check if port 3001 is already in use
$portInUse = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "ERROR: Port 3001 is already in use!" -ForegroundColor Red
    Write-Host "Please close the application using port 3001 first." -ForegroundColor Red
    Write-Host ""
    Write-Host "Applications using port 3001:" -ForegroundColor Yellow
    $portInUse | ForEach-Object {
        $process = Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "  - $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Yellow
        }
    }
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Port 3001 is available. Starting development server..." -ForegroundColor Green
Write-Host ""
npm run dev
