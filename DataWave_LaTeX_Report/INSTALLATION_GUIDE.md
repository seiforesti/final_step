# 🚀 GUIDE D'INSTALLATION COMPLET - DATAWAVE LATEX REPORT

## Étape par Étape pour Compiler Votre Rapport PFE

---

## ✅ **FICHIERS DÉJÀ CRÉÉS DANS CE DOSSIER**

Vous avez déjà ces fichiers prêts à utiliser :

1. ✅ `global_config.tex` - Configuration complète
2. ✅ `introduction.tex` - Introduction générale (3 pages)
3. ✅ `chap_01.tex` - Chapitre 1 complet (15 pages)
4. ✅ `acronymes.tex` - Liste des abréviations (80+ termes)
5. ✅ `conclusion.tex` - Conclusion générale (3 pages)
6. ✅ `dedicaces.tex` - Page de dédicaces
7. ✅ `remerciement.tex` - Page de remerciements
8. ✅ `biblio.bib` - Bibliographie BibTeX

---

## 📋 **ÉTAPE 1 : COPIER LES FICHIERS DU TEMPLATE ISI**

### **Méthode 1 : PowerShell (Recommandée)**

Ouvrez PowerShell dans ce dossier et exécutez :

```powershell
# Définir les chemins
$sourceTemplate = "c:\Users\seifa\OneDrive\Desktop\final_correction\ISI-LaTeX-Template-master (1)\ISI-LaTeX-Template-master"
$destination = "c:\Users\seifa\OneDrive\Desktop\final_correction\DataWave_LaTeX_Report"

# Copier le dossier tpl/ (ESSENTIEL)
Copy-Item -Path "$sourceTemplate\tpl" -Destination "$destination\" -Recurse -Force

# Copier main.tex
Copy-Item -Path "$sourceTemplate\main.tex" -Destination "$destination\" -Force

# Copier annexes.tex
Copy-Item -Path "$sourceTemplate\annexes.tex" -Destination "$destination\" -Force

# Créer le dossier img/
New-Item -Path "$destination\img" -ItemType Directory -Force

Write-Host "✅ Fichiers copiés avec succès!" -ForegroundColor Green
```

### **Méthode 2 : Manuellement**

1. Copier le dossier `tpl/` complet depuis le template ISI
2. Copier `main.tex` depuis le template ISI
3. Copier `annexes.tex` depuis le template ISI
4. Créer un dossier `img/` pour les images

---

## 📝 **ÉTAPE 2 : PERSONNALISER global_config.tex**

Ouvrir `global_config.tex` et remplacer :

### **Informations Personnelles**
```latex
\author{Votre Prénom NOM}  % ← Remplacer par votre nom
```

### **Encadrants**
```latex
\proFramerName{Monsieur/Madame Prénom NOM}  % ← Encadrant professionnel
\proFramerSpeciality{Ingénieur R\&D / Architecte Logiciel}

\academicFramerName{Monsieur/Madame Prénom NOM}  % ← Encadrant académique
\academicFramerSpeciality{Maître Assistant(e) / Professeur}
```

### **Entreprise**
```latex
\companyName{Nom de l'Entreprise d'Accueil}  % ← Nom de l'entreprise
\collegeYear{2024 - 2025}  % ← Année universitaire

\companyEmail{contact@company.com}
\companyTel{+216 XX XXX XXX}
\companyAddressAR{العنوان بالعربية}
\companyAddressFR{Adresse de l'entreprise, Ville, Tunisie}
```

---

## 📄 **ÉTAPE 3 : COMPLÉTER chap_01.tex**

Ouvrir `chap_01.tex` et remplacer les sections `% TODO:` :

### **Section 1.1 : Présentation de l'Organisme**
```latex
% TODO: Remplacer par les informations réelles de votre entreprise d'accueil
[Nom de l'entreprise] est une entreprise...
```

Remplacer par les vraies informations de votre entreprise.

### **Créer l'Organigramme**
Créer `img/organigramme_entreprise.png` avec l'organigramme réel.

---

## 🎨 **ÉTAPE 4 : CRÉER LES FIGURES DU CHAPITRE 1**

### **Figures à Créer (10 figures)**

Créer ces images et les placer dans le dossier `img/` :

1. **`organigramme_entreprise.png`** - Organigramme de l'entreprise
2. **`defis_gouvernance.png`** - Diagramme des défis de gouvernance
3. **`silos_donnees.png`** - Illustration des silos de données
4. **`frameworks_conformite.png`** - Frameworks réglementaires
5. **`architecture_azure_purview.png`** - Architecture Azure Purview
6. **`limitations_azure_purview.png`** - Limitations Azure Purview
7. **`architecture_databricks.png`** - Architecture Databricks
8. **`positionnement_marche.png`** - Positionnement DataWave
9. **`avantages_radar.png`** - Diagramme radar des avantages

### **Outils Recommandés**
- **Diagrammes** : Lucidchart, Draw.io, Excalidraw
- **Graphiques** : Excel, Python matplotlib
- **Édition** : GIMP, Photoshop

### **Format Recommandé**
- **Format** : PNG ou PDF
- **Résolution** : 300 DPI minimum
- **Taille** : Largeur max 15cm pour le rapport

---

## 💻 **ÉTAPE 5 : INSTALLER LaTeX**

### **Windows**

**Option 1 : MiKTeX (Recommandée)**
1. Télécharger : https://miktex.org/download
2. Installer avec les options par défaut
3. Accepter l'installation automatique des packages

**Option 2 : TeX Live**
1. Télécharger : https://www.tug.org/texlive/
2. Installation complète (~ 7 GB)

### **Éditeur LaTeX Recommandé**

**TeXstudio** (Gratuit et puissant)
1. Télécharger : https://www.texstudio.org/
2. Installer
3. Configurer : Options → Build → Default Compiler → PdfLaTeX

---

## 🔨 **ÉTAPE 6 : COMPILER LE RAPPORT**

### **Méthode 1 : Ligne de Commande**

```bash
cd DataWave_LaTeX_Report

# Compilation complète
pdflatex main.tex
bibtex main
pdflatex main.tex
pdflatex main.tex
```

### **Méthode 2 : TeXstudio**

1. Ouvrir `main.tex` dans TeXstudio
2. Cliquer sur **F5** (ou Outils → Compiler)
3. Cliquer sur **F7** (ou Outils → Bibliographie)
4. Cliquer sur **F5** deux fois de plus

### **Méthode 3 : Overleaf (En Ligne)**

1. Créer un compte sur https://www.overleaf.com/
2. Créer un nouveau projet
3. Uploader tous les fichiers
4. Compiler automatiquement

---

## ⚠️ **ÉTAPE 7 : RÉSOUDRE LES ERREURS COURANTES**

### **Erreur : "File not found: tpl/isipfe.cls"**
**Solution** : Copier le dossier `tpl/` depuis le template ISI

### **Erreur : "Undefined control sequence"**
**Solution** : Vérifier que tous les packages sont installés (MiKTeX le fait automatiquement)

### **Erreur : "Missing $ inserted"**
**Solution** : Vérifier les caractères spéciaux (%, &, _, etc.) - les échapper avec \

### **Erreur : "File 'image.png' not found"**
**Solution** : Vérifier que l'image existe dans le dossier `img/`

---

## 📚 **ÉTAPE 8 : CRÉER LES CHAPITRES 2-4**

### **Chapitre 2 : Analyse et Conception (20 pages)**

Créer `chap_02.tex` :

```latex
\chapter{Analyse et Conception du Système}

\section*{Introduction}
% Introduction du chapitre

\section{Analyse des Besoins}
\subsection{Besoins Fonctionnels}
% Contenu...

\subsection{Besoins Non-Fonctionnels}
% Contenu...

\section{Architecture Globale du Système}
% Contenu...

\section*{Conclusion}
% Conclusion du chapitre
```

Suivre le guide dans `../PFE_Report_Documentation/05_GUIDE_REDACTION_CHAPITRES.md`

### **Chapitre 3 : Réalisation et Implémentation (30 pages)**

Créer `chap_03.tex` avec les 7 modules.

### **Chapitre 4 : Tests, Déploiement et Résultats (17 pages)**

Créer `chap_04.tex` avec les résultats.

---

## ✅ **CHECKLIST DE VÉRIFICATION**

### **Avant la Première Compilation**
- [ ] Dossier `tpl/` copié
- [ ] `main.tex` copié
- [ ] `annexes.tex` copié
- [ ] Dossier `img/` créé
- [ ] `global_config.tex` personnalisé
- [ ] LaTeX installé

### **Avant la Compilation Finale**
- [ ] Toutes les figures créées et dans `img/`
- [ ] Tous les chapitres créés (chap_01 à chap_04)
- [ ] Bibliographie complétée dans `biblio.bib`
- [ ] Dédicaces et remerciements personnalisés
- [ ] Annexes créées
- [ ] Relecture complète effectuée

### **Vérifications du PDF**
- [ ] Table des matières générée correctement
- [ ] Liste des figures générée
- [ ] Liste des tableaux générée
- [ ] Liste des abréviations affichée
- [ ] Toutes les figures apparaissent
- [ ] Bibliographie affichée
- [ ] Pagination correcte
- [ ] Environ 90 pages (hors annexes)

---

## 🎯 **STRUCTURE FINALE DU DOSSIER**

```
DataWave_LaTeX_Report/
├── tpl/                          (Copié du template ISI)
│   ├── isipfe.cls
│   ├── cover_page.tex
│   ├── cover_page_black.tex
│   ├── signatures.tex
│   ├── resume.tex
│   └── new_commands.tex
├── img/                          (Vos images)
│   ├── organigramme_entreprise.png
│   ├── defis_gouvernance.png
│   ├── silos_donnees.png
│   └── ... (toutes les autres figures)
├── main.tex                      (Copié du template ISI)
├── global_config.tex             ✅ Créé
├── introduction.tex              ✅ Créé
├── chap_01.tex                   ✅ Créé
├── chap_02.tex                   ⏳ À créer
├── chap_03.tex                   ⏳ À créer
├── chap_04.tex                   ⏳ À créer
├── conclusion.tex                ✅ Créé
├── dedicaces.tex                 ✅ Créé
├── remerciement.tex              ✅ Créé
├── acronymes.tex                 ✅ Créé
├── annexes.tex                   (Copié du template ISI)
├── biblio.bib                    ✅ Créé
├── README_LATEX.md               ✅ Créé
└── INSTALLATION_GUIDE.md         ✅ Ce fichier
```

---

## 💡 **CONSEILS IMPORTANTS**

### **Compilation**
1. **Compiler régulièrement** : Ne pas attendre la fin
2. **Vérifier les erreurs** : Corriger au fur et à mesure
3. **Sauvegarder souvent** : Utiliser Git si possible

### **Figures**
1. **Qualité** : 300 DPI minimum
2. **Format** : PNG pour images, PDF pour graphiques vectoriels
3. **Taille** : Adapter pour qu'elles soient lisibles

### **Rédaction**
1. **Suivre le guide** : `05_GUIDE_REDACTION_CHAPITRES.md`
2. **Cohérence** : Style uniforme dans tout le rapport
3. **Références** : Toujours référencer les figures et tableaux

---

## 📞 **AIDE ET SUPPORT**

### **Ressources**
- Guide de rédaction : `../PFE_Report_Documentation/05_GUIDE_REDACTION_CHAPITRES.md`
- Liste des figures : `../PFE_Report_Documentation/01_LISTE_DES_FIGURES.md`
- Liste des tableaux : `../PFE_Report_Documentation/02_LISTE_DES_TABLEAUX.md`

### **Documentation LaTeX**
- Overleaf Learn : https://www.overleaf.com/learn
- LaTeX Wikibook : https://en.wikibooks.org/wiki/LaTeX

---

## 🎉 **PRÊT À COMMENCER !**

Suivez ces étapes dans l'ordre et vous aurez un rapport PFE professionnel !

**Prochaine action** : Exécuter le script PowerShell de l'Étape 1

**Bon courage ! 🚀**
