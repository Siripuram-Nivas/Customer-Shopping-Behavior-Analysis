$port = 8501
$url = "http://localhost:$port"
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$python = "$PSScriptRoot\.venv\Scripts\python.exe"

if (-not (Test-Path $python)) {
    $python = "python"
}

Write-Host "Starting Streamlit server..." -ForegroundColor Cyan
$process = Start-Process -FilePath $python -ArgumentList "-m streamlit run `"$PSScriptRoot\app.py`" --server.port $port --server.headless true" -PassThru

# Wait for Streamlit server to become available
$ready = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Milliseconds 400
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $tcp.Connect("127.0.0.1", $port)
        if ($tcp.Connected) {
            $tcp.Close()
            $ready = $true
            break
        }
    } catch {}
}

if (-not $ready) {
    Write-Warning "Streamlit server took longer than expected to start."
}

Write-Host "Launching application in Chrome window mode..." -ForegroundColor Green
if (Test-Path $chrome) {
    Start-Process $chrome -ArgumentList "--app=$url"
} else {
    Start-Process $url
}

$process.WaitForExit()
