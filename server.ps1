$port = 8080
$url = "http://localhost:$port"
Write-Host "Starting web server at $url" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Start-Sleep -Seconds 2
Start-Process $url
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("$url/")
$listener.Start()
while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    $path = $request.Url.LocalPath
    if ($path -eq "/") { $path = "/index.html" }
    $filePath = Join-Path $PWD $path.TrimStart('/')
    if (Test-Path $filePath) {
        $content = [System.IO.File]::ReadAllBytes($filePath)
        $ext = [System.IO.Path]::GetExtension($filePath)
        $mimeTypes = @{
            ".html" = "text/html"
            ".css" = "text/css"
            ".js" = "application/javascript"
            ".json" = "application/json"
            ".svg" = "image/svg+xml"
            ".png" = "image/png"
            ".jpg" = "image/jpeg"
        }
        $response.ContentType = if ($mimeTypes[$ext]) { $mimeTypes[$ext] } else { "application/octet-stream" }
        $response.ContentLength64 = $content.Length
        $response.OutputStream.Write($content, 0, $content.Length)
    } else {
        $response.StatusCode = 404
        $buffer = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
        $response.OutputStream.Write($buffer, 0, $buffer.Length)
    }
    $response.Close()
}
$listener.Stop()
