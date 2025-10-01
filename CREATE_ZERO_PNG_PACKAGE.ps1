# ================================================================
# CRÉER PACKAGE SANS AUCUN PNG - 100% PDF
# ================================================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PACKAGE 100% PDF - ZÉRO PNG" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$source = "c:\Users\seifa\OneDrive\Desktop\final_correction\DataWave_Clean_Project"
$target = "c:\Users\seifa\OneDrive\Desktop\final_correction\DataWave_ZERO_PNG"

# Supprimer et recréer
if (Test-Path $target) {
    Remove-Item $target -Recurse -Force
}
New-Item -Path $target -ItemType Directory -Force | Out-Null

Write-Host "[1/4] Copie de la structure..." -ForegroundColor Yellow
Copy-Item -Path "$source\*" -Destination $target -Recurse -Force -Exclude "*.png"
Write-Host "   OK Structure copiée (PNG exclus)" -ForegroundColor Green

Write-Host ""
Write-Host "[2/4] Suppression de TOUS les PNG..." -ForegroundColor Yellow
$pngFiles = Get-ChildItem -Path $target -Filter "*.png" -Recurse
foreach ($png in $pngFiles) {
    Remove-Item $png.FullName -Force
    Write-Host "   Supprimé: $($png.Name)" -ForegroundColor Gray
}
Write-Host "   OK $($pngFiles.Count) PNG supprimés" -ForegroundColor Green

Write-Host ""
Write-Host "[3/4] Création des PDF placeholders..." -ForegroundColor Yellow

# Fonction PDF minimale
function Create-TinyPdf {
    param([string]$Path)
    $pdf = "%PDF-1.4`n1 0 obj`n<< /Type /Catalog /Pages 2 0 R >>`nendobj`n2 0 obj`n<< /Type /Pages /Kids [3 0 R] /Count 1 >>`nendobj`n3 0 obj`n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 50 50] >>`nendobj`nxref`n0 4`n0000000000 65535 f`n0000000009 00000 n`n0000000058 00000 n`n0000000115 00000 n`ntrailer`n<< /Size 4 /Root 1 0 R >>`nstartxref`n188`n%%EOF"
    [System.IO.File]::WriteAllText($Path, $pdf)
}

# Créer PDFs dans img/
$imgDir = "$target\img"
if (Test-Path $imgDir) {
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
    
    foreach ($fig in $figures) {
        Create-TinyPdf -Path "$imgDir\$fig.pdf"
    }
    Write-Host "   OK 47 PDFs créés dans img/" -ForegroundColor Green
}

# Créer logos PDF
$logos = @("LogoISI", "Logo_UTM", "Logo_Entreprise", "Logo_ISI_Black", "Logo_UTM_Black", "Logo_Entreprise_Black")
foreach ($logo in $logos) {
    Create-TinyPdf -Path "$target\$logo.pdf"
}
Write-Host "   OK 6 logos PDF créés" -ForegroundColor Green

Write-Host ""
Write-Host "[4/4] Mise à jour des .tex pour PDF..." -ForegroundColor Yellow
$texFiles = Get-ChildItem -Path $target -Filter "*.tex" -Recurse
foreach ($tex in $texFiles) {
    $content = Get-Content $tex.FullName -Raw -Encoding UTF8
    $content = $content -replace '\.png', '.pdf'
    Set-Content $tex.FullName -Value $content -Encoding UTF8
}
Write-Host "   OK Tous les .tex mis à jour" -ForegroundColor Green

Write-Host ""
Write-Host "Vérification finale..." -ForegroundColor Yellow
$pngCheck = Get-ChildItem -Path $target -Filter "*.png" -Recurse
if ($pngCheck.Count -eq 0) {
    Write-Host "   ✓ ZÉRO PNG dans le package!" -ForegroundColor Green
} else {
    Write-Host "   ✗ $($pngCheck.Count) PNG trouvés!" -ForegroundColor Red
}

Write-Host ""
Write-Host "Création du ZIP..." -ForegroundColor Yellow
$zipFile = "c:\Users\seifa\OneDrive\Desktop\final_correction\DataWave_ZERO_PNG.zip"
if (Test-Path $zipFile) {
    Remove-Item $zipFile -Force
}
Compress-Archive -Path "$target\*" -DestinationPath $zipFile -Force
$zipSize = (Get-Item $zipFile).Length / 1KB

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  PACKAGE 100% PDF CRÉÉ!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Fichier: DataWave_ZERO_PNG.zip" -ForegroundColor Cyan
Write-Host "Taille: $([math]::Round($zipSize, 0)) KB" -ForegroundColor White
Write-Host ""
Write-Host "Garanties:" -ForegroundColor Yellow
Write-Host "  ✓ ZÉRO fichier PNG" -ForegroundColor White
Write-Host "  ✓ 100% fichiers PDF" -ForegroundColor White
Write-Host "  ✓ Tous les .tex utilisent .pdf" -ForegroundColor White
Write-Host ""
Write-Host "UPLOAD CE PACKAGE SUR OVERLEAF!" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter"
