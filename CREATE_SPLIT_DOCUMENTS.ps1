# Split DataWave document into 4 parts for Overleaf free plan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SPLITTING DOCUMENT INTO 4 PARTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$sourceDir = "c:\Users\seifa\OneDrive\Desktop\final_correction\DataWave_Overleaf_Package"
$targetBase = "c:\Users\seifa\OneDrive\Desktop\final_correction"

# Create 4 separate project folders
$projects = @(
    @{Name="Part1_Intro_Chap1"; Chapters=@("introduction", "chap_01")},
    @{Name="Part2_Chap2"; Chapters=@("chap_02")},
    @{Name="Part3_Chap3"; Chapters=@("chap_03")},
    @{Name="Part4_Chap4_Conclusion"; Chapters=@("chap_04", "conclusion")}
)

foreach ($project in $projects) {
    Write-Host "Creating $($project.Name)..." -ForegroundColor Yellow
    
    $projectDir = "$targetBase\$($project.Name)"
    
    # Create project directory
    if (Test-Path $projectDir) {
        Remove-Item -Path $projectDir -Recurse -Force
    }
    New-Item -Path $projectDir -ItemType Directory -Force | Out-Null
    
    # Copy template folder
    Copy-Item -Path "$sourceDir\tpl" -Destination $projectDir -Recurse -Force
    
    # Copy img folder
    Copy-Item -Path "$sourceDir\img" -Destination $projectDir -Recurse -Force
    
    # Copy logos
    Copy-Item -Path "$sourceDir\Logo*.png" -Destination $projectDir -Force -ErrorAction SilentlyContinue
    
    # Copy config files
    Copy-Item -Path "$sourceDir\global_config.tex" -Destination $projectDir -Force
    Copy-Item -Path "$sourceDir\acronymes.tex" -Destination $projectDir -Force
    Copy-Item -Path "$sourceDir\dedicaces.tex" -Destination $projectDir -Force
    Copy-Item -Path "$sourceDir\remerciement.tex" -Destination $projectDir -Force
    Copy-Item -Path "$sourceDir\biblio.bib" -Destination $projectDir -Force
    Copy-Item -Path "$sourceDir\annexes.tex" -Destination $projectDir -Force
    
    # Copy chapter files
    foreach ($chapter in $project.Chapters) {
        Copy-Item -Path "$sourceDir\$chapter.tex" -Destination $projectDir -Force
    }
    
    # Create custom main.tex for this part
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

    # Add chapters for this part
    foreach ($chapter in $project.Chapters) {
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

    Set-Content -Path "$projectDir\main.tex" -Value $mainContent -Encoding UTF8
    
    # Create README for this part
    $readmeContent = @"
# $($project.Name)

This is part of the DataWave PFE report split for Overleaf free plan.

## Chapters Included:
$($project.Chapters -join ", ")

## Upload to Overleaf:
1. Compress this folder to ZIP
2. Upload to Overleaf
3. Compile successfully

## After All Parts:
Combine all PDFs using a PDF merger tool.
"@
    
    Set-Content -Path "$projectDir\README.md" -Value $readmeContent -Encoding UTF8
    
    # Create ZIP file
    $zipFile = "$targetBase\$($project.Name).zip"
    if (Test-Path $zipFile) {
        Remove-Item $zipFile -Force
    }
    Compress-Archive -Path "$projectDir\*" -DestinationPath $zipFile -Force
    
    Write-Host "   OK Created $($project.Name).zip" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  4 PARTS CREATED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Created ZIP files:" -ForegroundColor Cyan
Write-Host "  1. Part1_Intro_Chap1.zip (Intro + Chapter 1)" -ForegroundColor White
Write-Host "  2. Part2_Chap2.zip (Chapter 2)" -ForegroundColor White
Write-Host "  3. Part3_Chap3.zip (Chapter 3)" -ForegroundColor White
Write-Host "  4. Part4_Chap4_Conclusion.zip (Chapter 4 + Conclusion)" -ForegroundColor White
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Upload each ZIP to Overleaf (4 separate projects)" -ForegroundColor White
Write-Host "  2. Compile each part" -ForegroundColor White
Write-Host "  3. Download PDFs" -ForegroundColor White
Write-Host "  4. Combine PDFs using online tool" -ForegroundColor White
Write-Host ""
Write-Host "Press Enter to exit..." -ForegroundColor Gray
Read-Host
