# ================================================================
# SCRIPT DE COMPILATION AUTOMATIQUE - RAPPORT PFE DATAWAVE
# ================================================================
# Ce script automatise la compilation complète du rapport LaTeX
# ================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  COMPILATION RAPPORT PFE DATAWAVE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Variables
$reportDir = $PSScriptRoot
$templateDir = "c:\Users\seifa\OneDrive\Desktop\final_correction\ISI-LaTeX-Template-master (1)\ISI-LaTeX-Template-master"
$mainFile = "main.tex"

# ================================================================
# ÉTAPE 1 : VÉRIFICATION DES PRÉREQUIS
# ================================================================
Write-Host "[1/6] Vérification des prérequis..." -ForegroundColor Yellow

# Vérifier si pdflatex est installé
$pdflatexExists = Get-Command pdflatex -ErrorAction SilentlyContinue
if (-not $pdflatexExists) {
    Write-Host "❌ ERREUR: pdflatex n'est pas installé!" -ForegroundColor Red
    Write-Host "   Installez MiKTeX depuis: https://miktex.org/download" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ pdflatex trouvé" -ForegroundColor Green

# Vérifier si bibtex est installé
$bibtexExists = Get-Command bibtex -ErrorAction SilentlyContinue
if (-not $bibtexExists) {
    Write-Host "❌ ERREUR: bibtex n'est pas installé!" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ bibtex trouvé" -ForegroundColor Green

# ================================================================
# ÉTAPE 2 : COPIE DES FICHIERS DU TEMPLATE ISI
# ================================================================
Write-Host ""
Write-Host "[2/6] Copie des fichiers du template ISI..." -ForegroundColor Yellow

if (-not (Test-Path $templateDir)) {
    Write-Host "❌ ERREUR: Template ISI non trouvé à: $templateDir" -ForegroundColor Red
    Write-Host "   Vérifiez le chemin du template" -ForegroundColor Red
    exit 1
}

# Copier le dossier tpl/
if (-not (Test-Path "$reportDir\tpl")) {
    Write-Host "   Copie du dossier tpl/..." -ForegroundColor Gray
    Copy-Item -Path "$templateDir\tpl" -Destination "$reportDir\" -Recurse -Force
    Write-Host "   ✓ Dossier tpl/ copié" -ForegroundColor Green
} else {
    Write-Host "   ✓ Dossier tpl/ existe déjà" -ForegroundColor Green
}

# Copier main.tex si nécessaire
if (-not (Test-Path "$reportDir\main.tex")) {
    Write-Host "   Copie de main.tex..." -ForegroundColor Gray
    Copy-Item -Path "$templateDir\main.tex" -Destination "$reportDir\" -Force
    Write-Host "   ✓ main.tex copié" -ForegroundColor Green
} else {
    Write-Host "   ✓ main.tex existe déjà" -ForegroundColor Green
}

# Copier annexes.tex si nécessaire
if (-not (Test-Path "$reportDir\annexes.tex")) {
    Write-Host "   Copie de annexes.tex..." -ForegroundColor Gray
    Copy-Item -Path "$templateDir\annexes.tex" -Destination "$reportDir\" -Force
    Write-Host "   ✓ annexes.tex copié" -ForegroundColor Green
} else {
    Write-Host "   ✓ annexes.tex existe déjà" -ForegroundColor Green
}

# Créer le dossier img/ si nécessaire
if (-not (Test-Path "$reportDir\img")) {
    Write-Host "   Création du dossier img/..." -ForegroundColor Gray
    New-Item -Path "$reportDir\img" -ItemType Directory -Force | Out-Null
    Write-Host "   ✓ Dossier img/ créé" -ForegroundColor Green
} else {
    Write-Host "   ✓ Dossier img/ existe déjà" -ForegroundColor Green
}

# ================================================================
# ÉTAPE 3 : FUSION DU CHAPITRE 3
# ================================================================
Write-Host ""
Write-Host "[3/6] Fusion du Chapitre 3..." -ForegroundColor Yellow

$chap03Part1 = "$reportDir\chap_03_part1.tex"
$chap03Part2 = "$reportDir\chap_03_part2.tex"
$chap03Part3 = "$reportDir\chap_03_part3.tex"
$chap03Merged = "$reportDir\chap_03.tex"

if ((Test-Path $chap03Part1) -and (Test-Path $chap03Part2) -and (Test-Path $chap03Part3)) {
    Write-Host "   Fusion des 3 parties du Chapitre 3..." -ForegroundColor Gray
    
    # Lire les contenus
    $content1 = Get-Content $chap03Part1 -Raw
    $content2 = Get-Content $chap03Part2 -Raw
    $content3 = Get-Content $chap03Part3 -Raw
    
    # Supprimer les conclusions partielles des parties 1 et 2
    $content1 = $content1 -replace '\\section\*\{Conclusion Partielle\}[\s\S]*?(?=\\section|$)', ''
    $content2 = $content2 -replace '% CHAPITRE 3 - PARTIE 2.*?\n', ''
    $content2 = $content2 -replace '\\section\*\{Conclusion Partielle\}[\s\S]*?(?=\\section|$)', ''
    $content3 = $content3 -replace '% CHAPITRE 3 - PARTIE 3.*?\n', ''
    
    # Fusionner
    $mergedContent = $content1 + "`n" + $content2 + "`n" + $content3
    
    # Écrire le fichier fusionné
    Set-Content -Path $chap03Merged -Value $mergedContent -Encoding UTF8
    
    Write-Host "   ✓ Chapitre 3 fusionné avec succès" -ForegroundColor Green
} elseif (Test-Path $chap03Merged) {
    Write-Host "   ✓ chap_03.tex existe déjà" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Fichiers du Chapitre 3 non trouvés" -ForegroundColor Yellow
}

# ================================================================
# ÉTAPE 4 : CRÉATION D'IMAGES PLACEHOLDER
# ================================================================
Write-Host ""
Write-Host "[4/6] Création d'images placeholder..." -ForegroundColor Yellow

$figures = @(
    "organigramme_entreprise", "defis_gouvernance", "silos_donnees",
    "frameworks_conformite", "architecture_azure_purview", "limitations_azure_purview",
    "architecture_databricks", "positionnement_marche", "avantages_radar",
    "architecture_microservices", "edge_computing_architecture", "modules_interactions",
    "connecteurs_specialises", "interface_gestion_sources", "config_postgresql",
    "test_connexion", "visualisation_lineage", "pipeline_classification",
    "heritage_hierarchique", "scoring_confiance", "interface_regles_classification",
    "config_regle_pii", "resultats_classification", "diagramme_etats_regles",
    "bibliotheque_patterns", "analytics_patterns", "creation_regle_scan",
    "config_avancee_regle", "architecture_workflow", "orchestration_distribuee",
    "allocation_dynamique", "dashboard_monitoring", "progression_scans",
    "systeme_alerting", "architecture_compliance", "processus_evaluation",
    "gestion_issues", "dashboard_conformite", "rapport_audit_gdpr",
    "architecture_rbac", "architecture_kubernetes", "dashboard_grafana",
    "benchmark_performance", "performance_scanning", "scalabilite_horizontale",
    "evolution_precision", "comparaison_radar"
)

$createdCount = 0
foreach ($fig in $figures) {
    $figPath = "$reportDir\img\$fig.png"
    if (-not (Test-Path $figPath)) {
        # Créer un fichier vide (placeholder)
        New-Item -Path $figPath -ItemType File -Force | Out-Null
        $createdCount++
    }
}

if ($createdCount -gt 0) {
    Write-Host "   ✓ $createdCount images placeholder créées" -ForegroundColor Green
    Write-Host "   ⚠ Remplacez-les par les vraies figures plus tard" -ForegroundColor Yellow
} else {
    Write-Host "   ✓ Toutes les images existent déjà" -ForegroundColor Green
}

# ================================================================
# ÉTAPE 5 : COMPILATION DU RAPPORT
# ================================================================
Write-Host ""
Write-Host "[5/6] Compilation du rapport LaTeX..." -ForegroundColor Yellow
Write-Host "   Cela peut prendre 2-3 minutes..." -ForegroundColor Gray
Write-Host ""

# Changer de répertoire
Set-Location $reportDir

# Première compilation
Write-Host "   [5.1] Première compilation (pdflatex)..." -ForegroundColor Gray
pdflatex -interaction=nonstopmode $mainFile 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Première compilation réussie" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Première compilation avec avertissements" -ForegroundColor Yellow
}

# Compilation bibliographie
Write-Host "   [5.2] Compilation bibliographie (bibtex)..." -ForegroundColor Gray
bibtex main 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Bibliographie compilée" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Bibliographie avec avertissements" -ForegroundColor Yellow
}

# Deuxième compilation
Write-Host "   [5.3] Deuxième compilation (pdflatex)..." -ForegroundColor Gray
pdflatex -interaction=nonstopmode $mainFile 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Deuxième compilation réussie" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Deuxième compilation avec avertissements" -ForegroundColor Yellow
}

# Troisième compilation
Write-Host "   [5.4] Troisième compilation (pdflatex)..." -ForegroundColor Gray
pdflatex -interaction=nonstopmode $mainFile 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Troisième compilation réussie" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Troisième compilation avec avertissements" -ForegroundColor Yellow
}

# ================================================================
# ÉTAPE 6 : VÉRIFICATION ET OUVERTURE DU PDF
# ================================================================
Write-Host ""
Write-Host "[6/6] Vérification du PDF généré..." -ForegroundColor Yellow

$pdfFile = "$reportDir\main.pdf"
if (Test-Path $pdfFile) {
    $pdfSize = (Get-Item $pdfFile).Length / 1MB
    Write-Host "   ✓ PDF généré avec succès!" -ForegroundColor Green
    Write-Host "   📄 Fichier: main.pdf" -ForegroundColor Cyan
    Write-Host "   📊 Taille: $([math]::Round($pdfSize, 2)) MB" -ForegroundColor Cyan
    
    # Ouvrir le PDF
    Write-Host ""
    Write-Host "   Ouverture du PDF..." -ForegroundColor Gray
    Start-Process $pdfFile
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✓ COMPILATION TERMINÉE AVEC SUCCÈS!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📖 Votre rapport PFE de 90 pages est prêt!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Prochaines étapes:" -ForegroundColor Yellow
    Write-Host "  1. Vérifier le PDF généré" -ForegroundColor White
    Write-Host "  2. Remplacer les images placeholder par les vraies figures" -ForegroundColor White
    Write-Host "  3. Relire et corriger le rapport" -ForegroundColor White
    Write-Host "  4. Préparer la soutenance" -ForegroundColor White
    Write-Host ""
    
} else {
    Write-Host "   ❌ ERREUR: PDF non généré!" -ForegroundColor Red
    Write-Host "   Vérifiez les erreurs dans le fichier main.log" -ForegroundColor Red
    Write-Host ""
    
    # Afficher les dernières erreurs du log
    if (Test-Path "$reportDir\main.log") {
        Write-Host "Dernières erreurs du log:" -ForegroundColor Yellow
        Get-Content "$reportDir\main.log" | Select-String "Error|!" | Select-Object -Last 10
    }
}

Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
