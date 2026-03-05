# Comprehensive Project Testing Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   PCOS AI ASSISTANT - COMPREHENSIVE TEST" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Track results
$results = @{
    Passed = 0
    Failed = 0
    Warnings = 0
}

function Test-API {
    param([string]$Name, [string]$Method = "GET", [string]$Uri, [object]$Body = $null)
    
    Write-Host "`n[TEST] $Name"
    try {
        if ($Method -eq "GET") {
            $response = Invoke-WebRequest -Uri $Uri -ErrorAction Stop
        } else {
            $response = Invoke-WebRequest -Uri $Uri -Method $Method -ContentType "application/json" -Body ($Body | ConvertTo-Json -Depth 10) -ErrorAction Stop
        }
        
        if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {
            Write-Host "  ✓ PASSED (HTTP $($response.StatusCode))" -ForegroundColor Green
            $results.Passed++
            return $response
        } else {
            Write-Host "  ✗ FAILED (HTTP $($response.StatusCode))" -ForegroundColor Red
            $results.Failed++
        }
    } catch {
        Write-Host "  ✗ ERROR: $($_.Exception.Message)" -ForegroundColor Red
        $results.Failed++
    }
}

# ===== BACKEND TESTS =====
Write-Host "`n`n=== BACKEND TESTS ===" -ForegroundColor Yellow

Test-API "Health Check" -Uri "http://localhost:5000/health"

Test-API "Analyze Step 1 (Age)" -Method POST -Uri "http://localhost:5000/api/analyze-step" `
    -Body @{step=1; age=28; gender="female"}

Test-API "Analyze Step 2 (Cycle)" -Method POST -Uri "http://localhost:5000/api/analyze-step" `
    -Body @{step=2; cycle_length=35; period_length=5}

Test-API "Full Analysis with Lifestyle Fields" -Method POST -Uri "http://localhost:5000/api/analyze" `
    -Body @{
        age = 28
        cycle_length = 35
        period_length = 5
        symptoms = @("acne", "weight_gain")
        city = "Hyderabad"
        weight = 65
        stress = "high"
        sleep = 6
        exercise = "light"
    }

Test-API "AI Chat Endpoint" -Method POST -Uri "http://localhost:5000/api/ai/chat" `
    -Body @{
        model = "gpt-3.5-turbo"
        messages = @(@{role = "user"; content = "What is PCOS?"})
    }

Test-API "Stats Endpoint" -Uri "http://localhost:5000/api/stats"

# ===== FRONTEND TESTS =====
Write-Host "`n`n=== FRONTEND TESTS ===" -ForegroundColor Yellow

$htmlFiles = @("index.html", "dashboard.html", "form.html", "landing.html", "results.html")
foreach ($file in $htmlFiles) {
    $path = "c:\Users\ranad\OneDrive\Desktop\PSOC\frontend\$file"
    if (Test-Path $path) {
        Write-Host "`n[TEST] Frontend file: $file"
        $content = Get-Content $path -Raw
        
        # Check for data-i18n attributes (language support)
        if ($content -match 'data-i18n') {
            Write-Host "  ✓ i18n support detected" -ForegroundColor Green
            $results.Passed++
        } else {
            Write-Host "  ⚠ No i18n attributes found" -ForegroundColor Yellow
            $results.Warnings++
        }
        
        # Check for theme support
        if ($content -match 'data-theme|theme') {
            Write-Host "  ✓ Theme support detected" -ForegroundColor Green
            $results.Passed++
        }
        
        # Check for broken script references
        if ($content -match '<script[^>]+src="(?!https|http|/)[^"]+\.js"') {
            Write-Host "  ⚠ Potential relative script paths" -ForegroundColor Yellow
            $results.Warnings++
        } else {
            Write-Host "  ✓ No obvious broken script paths" -ForegroundColor Green
            $results.Passed++
        }
    } else {
        Write-Host "`n[TEST] Frontend file: $file - MISSING!" -ForegroundColor Red
        $results.Failed++
    }
}

# ===== CONFIGURATION TESTS =====
Write-Host "`n`n=== CONFIGURATION TESTS ===" -ForegroundColor Yellow

Write-Host "`n[TEST] Config file exists (config.js)"
if (Test-Path "c:\Users\ranad\OneDrive\Desktop\PSOC\frontend\config.js") {
    Write-Host "  ✓ PASSED" -ForegroundColor Green
    $results.Passed++
} else {
    Write-Host "  ✗ FAILED" -ForegroundColor Red
    $results.Failed++
}

Write-Host "`n[TEST] Translations file"
if (Test-Path "c:\Users\ranad\OneDrive\Desktop\PSOC\frontend\translations.js") {
    $transContent = Get-Content "c:\Users\ranad\OneDrive\Desktop\PSOC\frontend\translations.js" -Raw
    if ($transContent -match '"en":|"te":|"hi":') {
        Write-Host "  ✓ Multiple language support found" -ForegroundColor Green
        $results.Passed++
    }
}

Write-Host "`n[TEST] Theme stylesheet"
if (Test-Path "c:\Users\ranad\OneDrive\Desktop\PSOC\frontend\styles\healthcare.css") {
    Write-Host "  ✓ PASSED" -ForegroundColor Green
    $results.Passed++
} else {
    Write-Host "  ✗ FAILED" -ForegroundColor Red
    $results.Failed++
}

# ===== SUMMARY =====
Write-Host "`n`n========================================" -ForegroundColor Cyan
Write-Host "   TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Passed:  $($results.Passed)" -ForegroundColor Green
Write-Host "Failed:  $($results.Failed)" -ForegroundColor Red
Write-Host "Warnings: $($results.Warnings)" -ForegroundColor Yellow

if ($results.Failed -eq 0) {
    Write-Host "`n✓ All critical tests PASSED!" -ForegroundColor Green
} else {
    Write-Host "`n✗ Some tests FAILED" -ForegroundColor Red
}
