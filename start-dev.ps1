Write-Host "Starting RecapHorizon development server on port 3000..." -ForegroundColor Green
Write-Host ""
Write-Host "Ensuring port 3000 is available..." -ForegroundColor Yellow
Write-Host ""

# Check if port 3000 is already in LISTEN state and attempt to free it
$connections = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($connections) {
    Write-Host "Port 3000 is currently in use. Attempting to terminate owning processes..." -ForegroundColor Yellow
    $pids = $connections | Select-Object -ExpandProperty OwningProcess | Sort-Object -Unique
    foreach ($procId in $pids) {
        try {
            $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
            if ($proc) {
                Write-Host " - Killing $($proc.ProcessName) (PID: $procId)" -ForegroundColor Yellow
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            }
        } catch {
            Write-Host "Warning: Could not terminate PID $procId" -ForegroundColor Yellow
        }
    }

    Start-Sleep -Seconds 1
    $stillInUse = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
    if ($stillInUse) {
        Write-Host "Error: Could not free port 3000. Please close the application using that port and re-run." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Port 3000 is available. Starting development server..." -ForegroundColor Green
Write-Host ""
npx vite --port 3000
