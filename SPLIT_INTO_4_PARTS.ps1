# ================================================================
# SPLIT DATAWAVE INTO 4 PARTS FOR OVERLEAF FREE PLAN
# ================================================================
# Each part will compile successfully on free plan
# ================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SPLITTING INTO 4 PARTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$sourceDir = "c:\Users\seifa\OneDrive\Desktop\final_correction\DataWave_Clean_Project"
$targetBase = "c:\Users\seifa\OneDrive\Desktop\final_correction"

# Define 4 parts
$parts = @(
    @{
        Name = "DataWave_Part1_Intro_Chap1"
        Title = "Part 1: Introduction + Chapitre 1"
        Chapters = @("introduction", "chap_01")
        Pages = "~18 pages"
    },
    @{
        Name = "DataWave_Part2_Chap2"
        Title = "Part 2: Chapitre 2"
        Chapters = @("chap_02")
        Pages = "~20 pages"
    },
    @{
        Name = "DataWave_Part3_Chap3"
        Title = "Part 3: Chapitre 3"
        Chapters = @("chap_03")
        Pages = "~30 pages"
    },
    @{
        Name = "DataWave_Part4_Chap4_Conclusion"
        Title = "Part 4: Chapitre 4 + Conclusion"
        Chapters = @("chap_04", "conclusion")
        Pages = "~20 pages"
    }
)

foreach ($part in $parts) {
    Write-Host "Creating $($part.Name)..." -ForegroundColor Yellow
    
    $partDir = "$targetBase\$($part.Name)"
    
    # Remove if exists
    if (Test-Path $partDir) {
        Remove-Item -Path $partDir -Recurse -Force
    }
    New-Item -Path $partDir -ItemType Directory -Force | Out-Null
    
    # Copy template
    Copy-Item -Path "$sourceDir\tpl" -Destination $partDir -Recurse -Force
    
    # Copy images
    Copy-Item -Path "$sourceDir\img" -Destination $partDir -Recurse -Force
    
    # Copy logos
    Copy-Item -Path "$sourceDir\Logo*.png" -Destination $partDir -Force -ErrorAction SilentlyContinue
    
    # Copy config files
    Copy-Item -Path "$sourceDir\global_config.tex" -Destination $partDir -Force
    Copy-Item -Path "$sourceDir\acronymes.tex" -Destination $partDir -Force
    Copy-Item -Path "$sourceDir\dedicaces.tex" -Destination $partDir -Force
    Copy-Item -Path "$sourceDir\remerciement.tex" -Destination $partDir -Force
    Copy-Item -Path "$sourceDir\biblio.bib" -Destination $partDir -Force
    Copy-Item -Path "$sourceDir\annexes.tex" -Destination $partDir -Force
    
    # Copy chapters for this part
    foreach ($chapter in $part.Chapters) {
        Copy-Item -Path "$sourceDir\$chapter.tex" -Destination $partDir -Force
    }
    
    # Create main.tex for this part
    $mainContent = @"
\documentclass[]{./tpl/isipfe}
\graphicspath{{./img/}}
\input{./tpl/new_commands}
\makeindex

\begin{document}
    \input{global_config}
    
    \frontmatter
        \input{tpl/cover_page}
        \input{tpl/signatures}
        
        \setcounter{page}{1}
        \input{dedicaces}
        \thispagestyle{frontmatter}
        \input{remerciement}
        \thispagestyle{frontmatter}
        
        \setcounter{secnumdepth}{3}
        \setcounter{tocdepth}{2}
        \dominitoc
        \tableofcontents
        \adjustmtc
        \thispagestyle{frontmatter}
        
        \listoffigures
        \thispagestyle{frontmatter}
        \listoftables
        \thispagestyle{frontmatter}
        
        \input{acronymes}
        \thispagestyle{frontmatter}
    
    \mainmatter
"@

    foreach ($chapter in $part.Chapters) {
        $mainContent += @"

        \input{$chapter}
        \clearpage
"@
    }

    $mainContent += @"
        
        \printbibliography[heading=bibintoc]
        
        \input{annexes}
        \clearpage

    \backmatter
        \input{./tpl/resume}
    
\end{document}
"@

    Set-Content -Path "$partDir\main.tex" -Value $mainContent -Encoding UTF8
    
    # Create README
    $readmeContent = @"
# $($part.Title)

**Pages**: $($part.Pages)

## Chapters:
$($part.Chapters -join "`n")

## Upload to Overleaf:
1. Compress this folder to ZIP
2. Upload to Overleaf as separate project
3. Compile successfully

## After compiling all 4 parts:
Download all PDFs and combine them using:
- https://www.ilovepdf.com/merge_pdf (free)
- Or any PDF merger tool
"@
    
    Set-Content -Path "$partDir\README.md" -Value $readmeContent -Encoding UTF8
    
    # Create ZIP
    $zipFile = "$targetBase\$($part.Name).zip"
    if (Test-Path $zipFile) {
        Remove-Item $zipFile -Force
    }
    Compress-Archive -Path "$partDir\*" -DestinationPath $zipFile -Force
    
    $zipSize = (Get-Item $zipFile).Length / 1KB
    Write-Host "   OK Created $($part.Name).zip ($([math]::Round($zipSize, 0)) KB)" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  4 PARTS CREATED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Created 4 ZIP files:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. DataWave_Part1_Intro_Chap1.zip" -ForegroundColor White
Write-Host "     - Introduction + Chapter 1 (~18 pages)" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. DataWave_Part2_Chap2.zip" -ForegroundColor White
Write-Host "     - Chapter 2 (~20 pages)" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. DataWave_Part3_Chap3.zip" -ForegroundColor White
Write-Host "     - Chapter 3 (~30 pages)" -ForegroundColor Gray
Write-Host ""
Write-Host "  4. DataWave_Part4_Chap4_Conclusion.zip" -ForegroundColor White
Write-Host "     - Chapter 4 + Conclusion (~20 pages)" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "  NEXT STEPS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Upload each ZIP to Overleaf (4 separate projects)" -ForegroundColor White
Write-Host "2. Compile each part (should work on free plan)" -ForegroundColor White
Write-Host "3. Download all 4 PDFs" -ForegroundColor White
Write-Host "4. Combine PDFs using: https://www.ilovepdf.com/merge_pdf" -ForegroundColor White
Write-Host ""
Write-Host "Each part is small enough to compile on free plan!" -ForegroundColor Green
Write-Host ""
Write-Host "Press Enter to exit..." -ForegroundColor Gray
Read-Host
