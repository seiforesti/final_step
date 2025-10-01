# ================================================================
# CRÉER VERSIONS TEXTE SEUL - SANS IMAGES
# ================================================================
# Pour tester si le problème vient des images ou du texte
# ================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VERSIONS TEXTE SEUL - ZÉRO IMAGE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$source = "c:\Users\seifa\OneDrive\Desktop\final_correction\DataWave_Clean_Project"
$targetBase = "c:\Users\seifa\OneDrive\Desktop\final_correction"

# Fonction pour commenter toutes les images dans un fichier .tex
function Remove-ImageReferences {
    param([string]$FilePath)
    
    $content = Get-Content $FilePath -Raw -Encoding UTF8
    
    # Commenter toutes les références d'images
    $content = $content -replace '(\\includegraphics.*?\})', '%$1'
    $content = $content -replace '(\\begin\{figure\})', '%$1'
    $content = $content -replace '(\\end\{figure\})', '%$1'
    $content = $content -replace '(\\caption\{.*?\})', '%$1'
    $content = $content -replace '(\\label\{fig:.*?\})', '%$1'
    
    Set-Content $FilePath -Value $content -Encoding UTF8
}

# Créer 4 parties SANS images
$parts = @(
    @{Name="Part1_TextOnly"; Chapters=@("introduction", "chap_01")},
    @{Name="Part2_TextOnly"; Chapters=@("chap_02")},
    @{Name="Part3_TextOnly"; Chapters=@("chap_03")},
    @{Name="Part4_TextOnly"; Chapters=@("chap_04", "conclusion")}
)

foreach ($part in $parts) {
    Write-Host "Création $($part.Name)..." -ForegroundColor Yellow
    
    $partDir = "$targetBase\$($part.Name)"
    
    if (Test-Path $partDir) {
        Remove-Item $partDir -Recurse -Force
    }
    New-Item -Path $partDir -ItemType Directory -Force | Out-Null
    
    # Copier template
    Copy-Item -Path "$source\tpl" -Destination $partDir -Recurse -Force
    
    # PAS de dossier img/ - on ne copie AUCUNE image
    
    # Copier config
    Copy-Item -Path "$source\global_config.tex" -Destination $partDir -Force
    Copy-Item -Path "$source\acronymes.tex" -Destination $partDir -Force
    Copy-Item -Path "$source\dedicaces.tex" -Destination $partDir -Force
    Copy-Item -Path "$source\remerciement.tex" -Destination $partDir -Force
    Copy-Item -Path "$source\biblio.bib" -Destination $partDir -Force
    Copy-Item -Path "$source\annexes.tex" -Destination $partDir -Force
    
    # Copier chapitres et supprimer références images
    foreach ($chap in $part.Chapters) {
        if (Test-Path "$source\$chap.tex") {
            Copy-Item "$source\$chap.tex" -Destination $partDir -Force
            Remove-ImageReferences -FilePath "$partDir\$chap.tex"
        }
    }
    
    # Créer main.tex simplifié
    $mainContent = @"
\documentclass[]{./tpl/isipfe}
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
        
        \input{acronymes}
        \thispagestyle{frontmatter}
    
    \mainmatter
"@

    foreach ($chap in $part.Chapters) {
        $mainContent += @"

        \input{$chap}
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
    
    # Supprimer références images dans cover_page
    if (Test-Path "$partDir\tpl\cover_page.tex") {
        Remove-ImageReferences -FilePath "$partDir\tpl\cover_page.tex"
    }
    
    # Créer ZIP
    $zipFile = "$targetBase\$($part.Name).zip"
    if (Test-Path $zipFile) {
        Remove-Item $zipFile -Force
    }
    Compress-Archive -Path "$partDir\*" -DestinationPath $zipFile -Force
    
    $zipSize = (Get-Item $zipFile).Length / 1KB
    Write-Host "   OK $($part.Name).zip créé ($([math]::Round($zipSize, 0)) KB)" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  VERSIONS TEXTE SEUL CRÉÉES!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "4 packages SANS IMAGES créés:" -ForegroundColor Cyan
Write-Host "  1. Part1_TextOnly.zip" -ForegroundColor White
Write-Host "  2. Part2_TextOnly.zip" -ForegroundColor White
Write-Host "  3. Part3_TextOnly.zip" -ForegroundColor White
Write-Host "  4. Part4_TextOnly.zip" -ForegroundColor White
Write-Host ""
Write-Host "Ces versions:" -ForegroundColor Yellow
Write-Host "  - ZÉRO image" -ForegroundColor White
Write-Host "  - Texte seulement" -ForegroundColor White
Write-Host "  - Devraient compiler TRÈS rapidement" -ForegroundColor White
Write-Host ""
Write-Host "Testez Part1_TextOnly.zip sur Overleaf!" -ForegroundColor Green
Write-Host "Si ça compile, le problème vient des images." -ForegroundColor Yellow
Write-Host "Si ça timeout encore, le problème vient du texte/structure." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter"
