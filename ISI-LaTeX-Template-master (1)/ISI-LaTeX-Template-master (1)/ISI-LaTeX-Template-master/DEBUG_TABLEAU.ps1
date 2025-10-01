Write-Host "=== DIAGNOSTIC COMPLET DU TABLEAU ===" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier les packages installés
Write-Host "1. Vérification packages LaTeX..." -ForegroundColor Yellow
$packages = @("tabularx", "booktabs", "ragged2e", "array")
foreach ($pkg in $packages) {
    $result = kpsewhich "$pkg.sty" 2>&1
    if ($result) {
        Write-Host "  ✓ $pkg installé" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $pkg MANQUANT!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "2. Vérification geometry (marges)..." -ForegroundColor Yellow
Get-Content "tpl\isipfe.cls" | Select-String -Pattern "geometry" | ForEach-Object {
    Write-Host "  $_" -ForegroundColor Gray
}

Write-Host ""
Write-Host "3. Vérification textwidth..." -ForegroundColor Yellow
Write-Host "  Créer fichier test..." -ForegroundColor Gray

$testContent = @"
\documentclass[12pt,a4paper]{article}
\usepackage[a4paper,top=2.5cm,bottom=2.5cm,left=2.5cm,right=2.5cm]{geometry}
\usepackage{tabularx}
\usepackage{booktabs}
\usepackage{ragged2e}
\begin{document}
\noindent Textwidth: \the\textwidth

\noindent Linewidth: \the\linewidth

\begin{table}[h]
\centering
\begin{tabularx}{\textwidth}{>{\RaggedRight\arraybackslash}X>{\RaggedRight\arraybackslash}X>{\RaggedRight\arraybackslash}X}
\toprule
\textbf{Col1} & \textbf{Col2} & \textbf{Col3} \\
\midrule
Test long texte qui devrait s'adapter & Autre texte long & Encore du texte \\
\bottomrule
\end{tabularx}
\end{table}
\end{document}
"@

Set-Content -Path "test_tableau.tex" -Value $testContent

Write-Host ""
Write-Host "4. Compilation test..." -ForegroundColor Yellow
pdflatex -interaction=nonstopmode test_tableau.tex | Out-Null

if (Test-Path "test_tableau.pdf") {
    Write-Host "  ✓ Test compilé avec succès!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Ouvrir test_tableau.pdf pour voir si tableau fonctionne..." -ForegroundColor Cyan
    Start-Process "test_tableau.pdf"
    Start-Sleep -Seconds 2
} else {
    Write-Host "  ✗ Échec compilation test" -ForegroundColor Red
    if (Test-Path "test_tableau.log") {
        Write-Host ""
        Write-Host "Erreurs dans test_tableau.log:" -ForegroundColor Red
        Get-Content "test_tableau.log" | Select-String -Pattern "Error|Warning" | Select-Object -First 10
    }
}

Write-Host ""
Write-Host "5. Compilation rapport principal..." -ForegroundColor Yellow
pdflatex -interaction=nonstopmode main.tex | Out-Null
pdflatex -interaction=nonstopmode main.tex | Out-Null

if (Test-Path "main.pdf") {
    Write-Host "  ✓ Rapport compilé!" -ForegroundColor Green
    
    # Extraire info du log
    if (Test-Path "main.log") {
        Write-Host ""
        Write-Host "6. Analyse du log..." -ForegroundColor Yellow
        
        $overfull = Get-Content "main.log" | Select-String -Pattern "Overfull.*hbox"
        if ($overfull) {
            Write-Host "  ⚠ Débordements détectés:" -ForegroundColor Yellow
            $overfull | Select-Object -First 5 | ForEach-Object {
                Write-Host "    $_" -ForegroundColor Gray
            }
        } else {
            Write-Host "  ✓ Pas de débordement détecté" -ForegroundColor Green
        }
        
        $textwidth = Get-Content "main.log" | Select-String -Pattern "textwidth"
        if ($textwidth) {
            Write-Host ""
            Write-Host "  Textwidth utilisé:" -ForegroundColor Gray
            $textwidth | Select-Object -First 3 | ForEach-Object {
                Write-Host "    $_" -ForegroundColor Gray
            }
        }
    }
    
    Write-Host ""
    Write-Host "Opening main.pdf..." -ForegroundColor Cyan
    Start-Process "main.pdf"
} else {
    Write-Host "  ✗ Échec compilation rapport" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== DIAGNOSTIC TERMINÉ ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Si le tableau est encore coupé, le problème vient de:" -ForegroundColor Yellow
Write-Host "  1. Package ragged2e non installé correctement" -ForegroundColor Gray
Write-Host "  2. Conflit entre geometry et anciens réglages" -ForegroundColor Gray
Write-Host "  3. MiKTeX cache corrompu" -ForegroundColor Gray
Write-Host ""
Write-Host "SOLUTION: Utiliser Overleaf (compile correctement à 100%)" -ForegroundColor Green
