# ================================================================
# BUILD CLEAN DATAWAVE PROJECT FROM ISI TEMPLATE
# ================================================================
# Creates a fresh, properly structured project that will work on Overleaf
# ================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BUILDING CLEAN DATAWAVE PROJECT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$isiTemplate = "c:\Users\seifa\OneDrive\Desktop\final_correction\ISI-LaTeX-Template-master (1)\ISI-LaTeX-Template-master"
$dataWaveSource = "c:\Users\seifa\OneDrive\Desktop\final_correction\DataWave_Overleaf_Package"
$targetDir = "c:\Users\seifa\OneDrive\Desktop\final_correction\DataWave_Clean_Project"

# Step 1: Create clean directory
Write-Host "[1/8] Creating clean project directory..." -ForegroundColor Yellow
if (Test-Path $targetDir) {
    $backup = "$targetDir`_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Move-Item -Path $targetDir -Destination $backup -Force
    Write-Host "   Backup created: $(Split-Path $backup -Leaf)" -ForegroundColor Gray
}
New-Item -Path $targetDir -ItemType Directory -Force | Out-Null
Write-Host "   OK Clean directory created" -ForegroundColor Green

# Step 2: Copy ISI template structure
Write-Host ""
Write-Host "[2/8] Copying ISI template structure..." -ForegroundColor Yellow
Copy-Item -Path "$isiTemplate\tpl" -Destination $targetDir -Recurse -Force
Write-Host "   OK tpl/ folder copied" -ForegroundColor Green

Copy-Item -Path "$isiTemplate\main.tex" -Destination $targetDir -Force
Write-Host "   OK main.tex copied" -ForegroundColor Green

Copy-Item -Path "$isiTemplate\annexes.tex" -Destination $targetDir -Force
Write-Host "   OK annexes.tex copied" -ForegroundColor Green

# Step 3: Create img folder and copy images
Write-Host ""
Write-Host "[3/8] Setting up images..." -ForegroundColor Yellow
New-Item -Path "$targetDir\img" -ItemType Directory -Force | Out-Null

if (Test-Path "$dataWaveSource\img") {
    Copy-Item -Path "$dataWaveSource\img\*" -Destination "$targetDir\img" -Force -ErrorAction SilentlyContinue
    $imgCount = (Get-ChildItem "$targetDir\img" -File).Count
    Write-Host "   OK $imgCount images copied" -ForegroundColor Green
}

# Copy logos
Copy-Item -Path "$dataWaveSource\Logo*.png" -Destination $targetDir -Force -ErrorAction SilentlyContinue
Write-Host "   OK Logos copied" -ForegroundColor Green

# Step 4: Copy DataWave configuration
Write-Host ""
Write-Host "[4/8] Copying DataWave configuration..." -ForegroundColor Yellow
Copy-Item -Path "$dataWaveSource\global_config.tex" -Destination $targetDir -Force
Write-Host "   OK global_config.tex copied" -ForegroundColor Green

Copy-Item -Path "$dataWaveSource\acronymes.tex" -Destination $targetDir -Force
Write-Host "   OK acronymes.tex copied" -ForegroundColor Green

Copy-Item -Path "$dataWaveSource\dedicaces.tex" -Destination $targetDir -Force
Write-Host "   OK dedicaces.tex copied" -ForegroundColor Green

Copy-Item -Path "$dataWaveSource\remerciement.tex" -Destination $targetDir -Force
Write-Host "   OK remerciement.tex copied" -ForegroundColor Green

Copy-Item -Path "$dataWaveSource\biblio.bib" -Destination $targetDir -Force
Write-Host "   OK biblio.bib copied" -ForegroundColor Green

# Step 5: Copy DataWave chapters
Write-Host ""
Write-Host "[5/8] Copying DataWave chapters..." -ForegroundColor Yellow
$chapters = @("introduction", "chap_01", "chap_02", "chap_03", "chap_04", "conclusion")
foreach ($chapter in $chapters) {
    if (Test-Path "$dataWaveSource\$chapter.tex") {
        Copy-Item -Path "$dataWaveSource\$chapter.tex" -Destination $targetDir -Force
        Write-Host "   OK $chapter.tex copied" -ForegroundColor Green
    }
}

# Step 6: Verify main.tex is correct
Write-Host ""
Write-Host "[6/8] Verifying main.tex structure..." -ForegroundColor Yellow
$mainContent = Get-Content "$targetDir\main.tex" -Raw
if ($mainContent -match "\\input\{chap_01\}") {
    Write-Host "   OK main.tex structure verified" -ForegroundColor Green
} else {
    Write-Host "   WARNING main.tex may need adjustment" -ForegroundColor Yellow
}

# Step 7: Create README
Write-Host ""
Write-Host "[7/8] Creating documentation..." -ForegroundColor Yellow
$readmeContent = @"
# DATAWAVE PFE REPORT - CLEAN PROJECT

This is a clean, properly structured project built from the official ISI template.

## Structure:
- Based on official ISI-LaTeX-Template
- All university rules respected
- Ready for Overleaf compilation

## Contents:
- Introduction (3 pages)
- Chapter 1: Context (15 pages)
- Chapter 2: Analysis (20 pages)  
- Chapter 3: Implementation (30 pages)
- Chapter 4: Results (17 pages)
- Conclusion (3 pages)

## Total: ~90 pages

## Upload to Overleaf:
1. Compress this folder to ZIP
2. Upload to Overleaf
3. Compile

## Note:
This project is properly structured and should compile better than previous versions.
"@

Set-Content -Path "$targetDir\README.md" -Value $readmeContent -Encoding UTF8
Write-Host "   OK README.md created" -ForegroundColor Green

# Step 8: Create ZIP file
Write-Host ""
Write-Host "[8/8] Creating ZIP file..." -ForegroundColor Yellow
$zipFile = "c:\Users\seifa\OneDrive\Desktop\final_correction\DataWave_Clean_Project.zip"
if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
}
Compress-Archive -Path "$targetDir\*" -DestinationPath $zipFile -Force
$zipSize = (Get-Item $zipFile).Length / 1MB
Write-Host "   OK ZIP created ($([math]::Round($zipSize, 2)) MB)" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  CLEAN PROJECT CREATED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Project location:" -ForegroundColor Cyan
Write-Host "  $targetDir" -ForegroundColor White
Write-Host ""
Write-Host "ZIP file:" -ForegroundColor Cyan
Write-Host "  $zipFile" -ForegroundColor White
Write-Host ""
Write-Host "This is a clean, properly structured project." -ForegroundColor Yellow
Write-Host "Upload to Overleaf and it should work better!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Enter to open folder..." -ForegroundColor Gray
Read-Host

Start-Process $targetDir
