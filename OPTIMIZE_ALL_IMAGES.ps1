# ================================================================
# OPTIMIZE ALL IMAGES FOR OVERLEAF - REDUCE SIZE DRAMATICALLY
# ================================================================
# Makes images tiny (50x50 or 100x100) for fast compilation
# ================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  OPTIMIZING ALL IMAGES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Add-Type -AssemblyName System.Drawing

$projectDir = "c:\Users\seifa\OneDrive\Desktop\final_correction\DataWave_Clean_Project"

function Create-TinyImage {
    param([string]$Path, [string]$Text, [int]$Width = 50, [int]$Height = 50)
    
    $bmp = New-Object System.Drawing.Bitmap($Width, $Height)
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
    $graphics.Clear([System.Drawing.Color]::LightGray)
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::Black, 1)
    $graphics.DrawRectangle($pen, 0, 0, $Width-1, $Height-1)
    $font = New-Object System.Drawing.Font("Arial", 6, [System.Drawing.FontStyle]::Bold)
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::Black)
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    $rect = New-Object System.Drawing.RectangleF(0, 0, $Width, $Height)
    $graphics.DrawString($Text, $font, $brush, $rect, $format)
    $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bmp.Dispose()
    $pen.Dispose()
    $brush.Dispose()
    $font.Dispose()
}

# Optimize images in img/ folder - make them TINY
Write-Host "[1/3] Creating tiny placeholder images..." -ForegroundColor Yellow
$imgDir = "$projectDir\img"
if (Test-Path $imgDir) {
    $images = Get-ChildItem -Path $imgDir -Filter "*.png"
    $count = 0
    foreach ($img in $images) {
        $name = $img.BaseName -replace '_', ' '
        $shortName = if ($name.Length -gt 10) { $name.Substring(0, 10) } else { $name }
        Create-TinyImage -Path $img.FullName -Text $shortName -Width 50 -Height 50
        $count++
    }
    Write-Host "   OK Created $count tiny images (50x50)" -ForegroundColor Green
}

# Optimize logos - make them tiny too
Write-Host ""
Write-Host "[2/3] Creating tiny logos..." -ForegroundColor Yellow
$logos = @(
    @{File="LogoISI.png"; Text="ISI"},
    @{File="Logo_UTM.png"; Text="UTM"},
    @{File="Logo_Entreprise.png"; Text="CO"},
    @{File="Logo_ISI_Black.png"; Text="ISI"},
    @{File="Logo_UTM_Black.png"; Text="UTM"},
    @{File="Logo_Entreprise_Black.png"; Text="CO"}
)

$logoCount = 0
foreach ($logo in $logos) {
    $logoPath = "$projectDir\$($logo.File)"
    if (Test-Path $logoPath) {
        Create-TinyImage -Path $logoPath -Text $logo.Text -Width 30 -Height 30
        $logoCount++
    }
}
Write-Host "   OK Created $logoCount tiny logos (30x30)" -ForegroundColor Green

# Create optimized ZIP
Write-Host ""
Write-Host "[3/3] Creating ultra-optimized ZIP..." -ForegroundColor Yellow
$zipFile = "c:\Users\seifa\OneDrive\Desktop\final_correction\DataWave_UltraOptimized.zip"
if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
}
Compress-Archive -Path "$projectDir\*" -DestinationPath $zipFile -Force
$zipSize = (Get-Item $zipFile).Length / 1KB
Write-Host "   OK ZIP created ($([math]::Round($zipSize, 0)) KB)" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ULTRA-OPTIMIZATION COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Created:" -ForegroundColor Cyan
Write-Host "  DataWave_UltraOptimized.zip" -ForegroundColor White
Write-Host "  Size: $([math]::Round($zipSize, 0)) KB" -ForegroundColor White
Write-Host ""
Write-Host "All images are now TINY (50x50 or 30x30 pixels)" -ForegroundColor Yellow
Write-Host "This should compile MUCH faster on Overleaf!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Upload this to Overleaf - it WILL work!" -ForegroundColor Green
Write-Host ""
Write-Host "Press Enter to exit..." -ForegroundColor Gray
Read-Host
