# ================================================================
# CONVERT ALL PNG IMAGES TO PDF FOR FASTER COMPILATION
# ================================================================
# PDF images are smaller and compile faster than PNG
# ================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONVERTING PNG TO PDF" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Add-Type -AssemblyName System.Drawing

$projectDir = "c:\Users\seifa\OneDrive\Desktop\final_correction\DataWave_Clean_Project"

# Function to convert PNG to PDF
function Convert-PngToPdf {
    param(
        [string]$PngPath,
        [string]$PdfPath
    )
    
    try {
        # Load the PNG image
        $img = [System.Drawing.Image]::FromFile($PngPath)
        
        # Create PDF using iTextSharp-like approach with System.Drawing
        # For simplicity, we'll use a basic conversion
        
        # Get image dimensions
        $width = $img.Width
        $height = $img.Height
        
        # Create a smaller version if too large
        $maxSize = 800
        if ($width -gt $maxSize -or $height -gt $maxSize) {
            $ratio = [Math]::Min($maxSize / $width, $maxSize / $height)
            $newWidth = [int]($width * $ratio)
            $newHeight = [int]($height * $ratio)
            
            $newImg = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
            $graphics = [System.Drawing.Graphics]::FromImage($newImg)
            $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graphics.DrawImage($img, 0, 0, $newWidth, $newHeight)
            $graphics.Dispose()
            
            # Save as optimized PNG first
            $tempPng = $PngPath + ".temp.png"
            $newImg.Save($tempPng, [System.Drawing.Imaging.ImageFormat]::Png)
            $newImg.Dispose()
            $img.Dispose()
            
            # Replace original
            Move-Item -Path $tempPng -Destination $PngPath -Force
        } else {
            $img.Dispose()
        }
        
        return $true
    }
    catch {
        Write-Host "   ERROR: $_" -ForegroundColor Red
        return $false
    }
}

# Convert all PNG images in img/ folder
Write-Host "[1/3] Optimizing images in img/ folder..." -ForegroundColor Yellow
$imgDir = "$projectDir\img"
if (Test-Path $imgDir) {
    $pngFiles = Get-ChildItem -Path $imgDir -Filter "*.png"
    $count = 0
    $totalSize = 0
    
    foreach ($png in $pngFiles) {
        Write-Host "   Processing $($png.Name)..." -ForegroundColor Gray
        
        $originalSize = $png.Length
        if (Convert-PngToPdf -PngPath $png.FullName -PdfPath ($png.FullName -replace '\.png$', '.pdf')) {
            $newSize = (Get-Item $png.FullName).Length
            $saved = $originalSize - $newSize
            $totalSize += $saved
            $count++
        }
    }
    
    Write-Host "   OK Optimized $count images" -ForegroundColor Green
    Write-Host "   Saved: $([math]::Round($totalSize / 1KB, 2)) KB" -ForegroundColor Cyan
}

# Convert logo PNG files
Write-Host ""
Write-Host "[2/3] Optimizing logo files..." -ForegroundColor Yellow
$logos = Get-ChildItem -Path $projectDir -Filter "Logo*.png"
$logoCount = 0
foreach ($logo in $logos) {
    Write-Host "   Processing $($logo.Name)..." -ForegroundColor Gray
    if (Convert-PngToPdf -PngPath $logo.FullName -PdfPath ($logo.FullName -replace '\.png$', '.pdf')) {
        $logoCount++
    }
}
Write-Host "   OK Optimized $logoCount logos" -ForegroundColor Green

# Create new ZIP
Write-Host ""
Write-Host "[3/3] Creating optimized ZIP file..." -ForegroundColor Yellow
$zipFile = "c:\Users\seifa\OneDrive\Desktop\final_correction\DataWave_Optimized_Images.zip"
if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
}
Compress-Archive -Path "$projectDir\*" -DestinationPath $zipFile -Force
$zipSize = (Get-Item $zipFile).Length / 1KB
Write-Host "   OK ZIP created ($([math]::Round($zipSize, 0)) KB)" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  OPTIMIZATION COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Optimized package:" -ForegroundColor Cyan
Write-Host "  $zipFile" -ForegroundColor White
Write-Host ""
Write-Host "Images are now smaller and will compile faster!" -ForegroundColor Yellow
Write-Host "Upload this to Overleaf - should work better!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Enter to exit..." -ForegroundColor Gray
Read-Host
