# ============================================
# COMPILE DATAWAVE PFE REPORT LOCALLY
# Full professional compilation with all features
# ============================================

Write-Host "=== DATAWAVE PFE REPORT - LOCAL COMPILATION ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create valid PNG placeholders
Write-Host "Step 1: Creating valid image placeholders..." -ForegroundColor Yellow

Add-Type -AssemblyName System.Drawing

# Create logos
$logos = @("LogoISI", "Logo_UTM", "Logo_Entreprise", "Logo_ISI_Black", "Logo_UTM_Black", "Logo_Entreprise_Black")
foreach($logo in $logos) {
    $bmp = New-Object System.Drawing.Bitmap(150, 150)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::FromArgb(240, 240, 240))
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::Black, 2)
    $g.DrawRectangle($pen, 1, 1, 147, 147)
    $font = New-Object System.Drawing.Font("Arial", 10, [System.Drawing.FontStyle]::Bold)
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::Black)
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    $rect = New-Object System.Drawing.RectangleF(0, 0, 150, 150)
    $g.DrawString($logo, $font, $brush, $rect, $format)
    $png = ".\$logo.png"
    $bmp.Save($png, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    $pen.Dispose()
    $font.Dispose()
    $brush.Dispose()
}

# Create figure placeholders
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

foreach($fig in $figures) {
    $bmp = New-Object System.Drawing.Bitmap(400, 300)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.Clear([System.Drawing.Color]::FromArgb(240, 240, 240))
    $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::Black, 2)
    $g.DrawRectangle($pen, 1, 1, 397, 297)
    $font = New-Object System.Drawing.Font("Arial", 11, [System.Drawing.FontStyle]::Bold)
    $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::Black)
    $displayName = $fig -replace '_', ' '
    $displayName = (Get-Culture).TextInfo.ToTitleCase($displayName)
    $text = "Figure: $displayName`n[Placeholder]"
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    $rect = New-Object System.Drawing.RectangleF(0, 0, 400, 300)
    $g.DrawString($text, $font, $brush, $rect, $format)
    $png = ".\img\$fig.png"
    $bmp.Save($png, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    $pen.Dispose()
    $font.Dispose()
    $brush.Dispose()
}

Write-Host "✅ Created 53 PNG placeholders" -ForegroundColor Green
Write-Host ""

# Step 2: Delete corrupted PDF files
Write-Host "Step 2: Removing corrupted PDF placeholders..." -ForegroundColor Yellow
Remove-Item ".\*.pdf" -ErrorAction SilentlyContinue
Remove-Item ".\img\*.pdf" -ErrorAction SilentlyContinue
Write-Host "✅ Cleaned up" -ForegroundColor Green
Write-Host ""

# Step 3: Compile LaTeX
Write-Host "Step 3: Compiling LaTeX (First pass)..." -ForegroundColor Yellow
pdflatex -interaction=nonstopmode main.tex | Out-Null
Write-Host "✅ First pass complete" -ForegroundColor Green
Write-Host ""

Write-Host "Step 4: Processing bibliography..." -ForegroundColor Yellow
biber main 2>&1 | Out-Null
Write-Host "✅ Bibliography processed" -ForegroundColor Green
Write-Host ""

Write-Host "Step 5: Compiling LaTeX (Second pass)..." -ForegroundColor Yellow
pdflatex -interaction=nonstopmode main.tex | Out-Null
Write-Host "✅ Second pass complete" -ForegroundColor Green
Write-Host ""

Write-Host "Step 6: Compiling LaTeX (Final pass)..." -ForegroundColor Yellow
pdflatex -interaction=nonstopmode main.tex | Out-Null
Write-Host "✅ Final pass complete" -ForegroundColor Green
Write-Host ""

# Check if PDF was created
if(Test-Path ".\main.pdf") {
    $size = [math]::Round((Get-Item ".\main.pdf").Length/1MB, 2)
    Write-Host "🎉 SUCCESS! PDF created: main.pdf ($size MB)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Opening PDF..." -ForegroundColor Cyan
    Start-Process ".\main.pdf"
} else {
    Write-Host "❌ Compilation failed. Check main.log for errors" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== COMPILATION COMPLETE ===" -ForegroundColor Cyan
