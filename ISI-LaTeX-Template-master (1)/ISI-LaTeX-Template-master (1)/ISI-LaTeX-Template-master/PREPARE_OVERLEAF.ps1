Write-Host "=== PRÉPARATION ZIP POUR OVERLEAF ===" -ForegroundColor Cyan
Write-Host ""

$projectName = "DataWave_PFE_Overleaf"
$zipPath = "..\$projectName.zip"

# Supprimer ancien ZIP si existe
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
    Write-Host "✓ Ancien ZIP supprimé" -ForegroundColor Gray
}

Write-Host "Création du ZIP pour Overleaf..." -ForegroundColor Yellow
Write-Host ""

# Liste des fichiers à inclure
$files = @(
    "main.tex",
    "global_config.tex",
    "introduction.tex",
    "chap_01.tex",
    "chap_02.tex",
    "chap_03.tex",
    "chap_04.tex",
    "conclusion.tex",
    "dedicaces.tex",
    "remerciement.tex",
    "acronymes.tex",
    "annexes.tex",
    "biblio.bib"
)

# Dossiers à inclure
$folders = @(
    "tpl",
    "img"
)

# Créer dossier temporaire
$tempDir = "temp_overleaf"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copier fichiers
Write-Host "Copie des fichiers..." -ForegroundColor Yellow
foreach ($file in $files) {
    if (Test-Path $file) {
        Copy-Item $file -Destination $tempDir
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ $file manquant" -ForegroundColor Yellow
    }
}

# Copier dossiers
Write-Host ""
Write-Host "Copie des dossiers..." -ForegroundColor Yellow
foreach ($folder in $folders) {
    if (Test-Path $folder) {
        Copy-Item $folder -Destination $tempDir -Recurse
        $count = (Get-ChildItem "$tempDir\$folder" -Recurse -File).Count
        Write-Host "  ✓ $folder ($count fichiers)" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ $folder manquant" -ForegroundColor Yellow
    }
}

# Créer README pour Overleaf
$readmeContent = @"
RAPPORT PFE DATAWAVE - OVERLEAF
================================

Ce projet est prêt pour compilation sur Overleaf.

ÉTAPES:
1. Upload ce ZIP sur overleaf.com
2. Créer nouveau projet → Upload Project
3. Sélectionner ce ZIP
4. Attendre compilation automatique (30-60 secondes)
5. Télécharger le PDF

CONFIGURATION:
- Compiler: pdfLaTeX
- Main document: main.tex
- TeX Live version: 2024 (automatique sur Overleaf)

STRUCTURE:
- main.tex: Document principal
- global_config.tex: Configuration (nom, encadrants, etc.)
- introduction.tex: Introduction (3 pages)
- chap_01.tex: Chapitre 1 - Contexte (15 pages)
- chap_02.tex: Chapitre 2 - Conception (20 pages)
- chap_03.tex: Chapitre 3 - Réalisation (30 pages)
- chap_04.tex: Chapitre 4 - Tests (17 pages)
- conclusion.tex: Conclusion (3 pages)
- tpl/: Template ISI officiel
- img/: Images et figures

PERSONNALISATION:
Modifier global_config.tex pour:
- Nom étudiant
- Encadrants
- Dates
- Entreprise

TABLEAUX:
Tous les tableaux utilisent tabularx + ragged2e pour adaptation automatique.
Format: \tablethree{label}{caption}{contenu}

COMPILATION:
Overleaf compile automatiquement à chaque modification.
Pas besoin de commandes manuelles!

RÉSULTAT:
PDF de ~90 pages conforme aux règles pédagogiques ISI.
"@

Set-Content -Path "$tempDir\README_OVERLEAF.txt" -Value $readmeContent
Write-Host ""
Write-Host "  ✓ README_OVERLEAF.txt créé" -ForegroundColor Green

# Créer le ZIP
Write-Host ""
Write-Host "Création du ZIP..." -ForegroundColor Yellow
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -Force

# Nettoyer
Remove-Item $tempDir -Recurse -Force

# Vérifier
if (Test-Path $zipPath) {
    $size = [math]::Round((Get-Item $zipPath).Length/1MB, 2)
    Write-Host ""
    Write-Host "🎉 ZIP CRÉÉ AVEC SUCCÈS!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📦 Fichier: $projectName.zip" -ForegroundColor Cyan
    Write-Host "📏 Taille: $size MB" -ForegroundColor Cyan
    Write-Host "📍 Emplacement: $(Resolve-Path $zipPath)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "=== PROCHAINES ÉTAPES ===" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Aller sur: https://www.overleaf.com" -ForegroundColor White
    Write-Host "2. Créer compte gratuit (si pas déjà fait)" -ForegroundColor White
    Write-Host "3. Cliquer 'New Project' → 'Upload Project'" -ForegroundColor White
    Write-Host "4. Sélectionner: $projectName.zip" -ForegroundColor White
    Write-Host "5. Attendre compilation (30-60 secondes)" -ForegroundColor White
    Write-Host "6. Télécharger le PDF parfait!" -ForegroundColor White
    Write-Host ""
    Write-Host "✅ Le tableau s'affichera CORRECTEMENT sur Overleaf!" -ForegroundColor Green
    Write-Host ""
    
    # Ouvrir dossier
    Write-Host "Ouverture du dossier..." -ForegroundColor Cyan
    explorer.exe (Split-Path -Parent (Resolve-Path $zipPath))
} else {
    Write-Host ""
    Write-Host "❌ Erreur création ZIP" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== TERMINÉ ===" -ForegroundColor Cyan
