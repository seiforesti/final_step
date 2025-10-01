# ============================================
# CREATE MINIMAL PDF PLACEHOLDERS - ULTRA LIGHTWEIGHT
# Creates tiny PDF files (~1-2 KB each) to avoid Overleaf timeout
# ============================================

Write-Host "=== Creating Ultra-Lightweight PDF Placeholders ===" -ForegroundColor Cyan
Write-Host ""

# List of all figures
$figures = @(
    "allocation_dynamique", "analytics_patterns", "architecture_azure_purview",
    "architecture_databricks", "architecture_compliance", "architecture_kubernetes",
    "architecture_microservices", "architecture_rbac", "architecture_workflow",
    "avantages_radar", "benchmark_performance", "bibliotheque_patterns",
    "comparaison_radar", "config_avancee_regle", "config_postgresql",
    "config_regle_pii", "connecteurs_specialises", "creation_regle_scan",
    "dashboard_conformite", "dashboard_grafana", "dashboard_monitoring",
    "defis_gouvernance", "diagramme_etats_regles", "edge_computing_architecture",
    "evolution_precision", "frameworks_conformite", "gestion_issues",
    "heritage_hierarchique", "interface_gestion_sources", "interface_regles_classification",
    "limitations_azure_purview", "modules_interactions", "orchestration_distribuee",
    "organigramme_entreprise", "performance_scanning", "pipeline_classification",
    "positionnement_marche", "processus_evaluation", "progression_scans",
    "rapport_audit_gdpr", "resultats_classification", "scalabilite_horizontale",
    "scoring_confiance", "silos_donnees", "systeme_alerting",
    "test_connexion", "visualisation_lineage"
)

# Create img directory
$imgDir = ".\img"
if (-not (Test-Path $imgDir)) {
    New-Item -ItemType Directory -Path $imgDir | Out-Null
    Write-Host "✅ Created img/ directory" -ForegroundColor Green
}

Write-Host "Creating $($figures.Count) minimal PDF placeholders..." -ForegroundColor Yellow
Write-Host ""

$totalSize = 0
foreach ($figName in $figures) {
    $pdfPath = Join-Path $imgDir "$figName.pdf"
    
    # Format figure name for display
    $displayName = $figName -replace '_', ' '
    $displayName = (Get-Culture).TextInfo.ToTitleCase($displayName)
    
    # Create minimal PDF content (PDF 1.4 format)
    # This is a valid minimal PDF that LaTeX can process
    $pdfContent = @"
%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 400 300]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj
4 0 obj
<<
/Length 150
>>
stream
BT
/F1 12 Tf
50 150 Td
(Figure: $displayName) Tj
0 -20 Td
([Placeholder]) Tj
ET
endstream
endobj
5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000000472 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
549
%%EOF
"@
    
    # Write PDF file
    [System.IO.File]::WriteAllText($pdfPath, $pdfContent, [System.Text.Encoding]::ASCII)
    
    $fileSize = (Get-Item $pdfPath).Length
    $totalSize += $fileSize
}

Write-Host ""
Write-Host "✅ Created $($figures.Count) minimal PDF placeholders" -ForegroundColor Green
Write-Host "📊 Total size: $([math]::Round($totalSize/1KB, 1)) KB (ultra-lightweight!)" -ForegroundColor Green
Write-Host "📊 Average per file: $([math]::Round(($totalSize/$figures.Count)/1KB, 2)) KB" -ForegroundColor Green
Write-Host ""
Write-Host "📝 ADVANTAGES:" -ForegroundColor Yellow
Write-Host "  ✅ Each PDF is only ~1 KB (minimal PDF structure)" -ForegroundColor White
Write-Host "  ✅ Total ~50 KB for all 47 figures" -ForegroundColor White
Write-Host "  ✅ Won't cause Overleaf timeout (free plan)" -ForegroundColor White
Write-Host "  ✅ Valid PDF format - LaTeX will compile successfully" -ForegroundColor White
Write-Host "  ✅ Easy to replace: just upload new PDF with same filename" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Ready for Overleaf upload!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Upload entire ISI-LaTeX-Template-master folder to Overleaf" -ForegroundColor White
Write-Host "  2. Set main.tex as main document" -ForegroundColor White
Write-Host "  3. Compile (should take 30-60 seconds)" -ForegroundColor White
Write-Host "  4. Replace placeholders with real figures one by one" -ForegroundColor White
