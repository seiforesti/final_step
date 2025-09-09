# Guide d'Utilisation Overleaf - Journal PFE

## Étapes de Configuration Overleaf

### 1. Création du Projet

1. Allez sur [https://www.overleaf.com](https://www.overleaf.com)
2. Créez un compte ou connectez-vous
3. Cliquez sur "New Project" → "Blank Project"
4. Nommez le projet : "Journal PFE Data Governance"

### 2. Upload des Fichiers

#### Méthode 1 : Upload Direct
1. Cliquez sur l'icône "Upload" dans Overleaf
2. Sélectionnez tous les fichiers `.tex` de ce répertoire
3. Uploadez d'abord `journal_pfe_data_governance.tex`
4. Créez un dossier `sections` dans Overleaf
5. Uploadez tous les fichiers `semaine_XX.tex` dans le dossier `sections`

#### Méthode 2 : Copier-Coller
1. Copiez le contenu de `journal_pfe_data_governance.tex`
2. Collez dans le fichier `main.tex` d'Overleaf
3. Créez chaque fichier `sections/semaine_XX.tex` manuellement
4. Copiez-collez le contenu de chaque semaine

### 3. Structure des Fichiers dans Overleaf

```
Votre Projet Overleaf/
├── main.tex (ou journal_pfe_data_governance.tex)
└── sections/
    ├── semaine_01.tex
    ├── semaine_02.tex
    ├── semaine_03.tex
    ├── ...
    └── semaine_26.tex
```

### 4. Compilation

1. Assurez-vous que le fichier principal est sélectionné
2. Cliquez sur "Recompile"
3. Le PDF se génère automatiquement
4. Vérifiez qu'il n'y a pas d'erreurs de compilation

## Packages LaTeX Requis

Tous ces packages sont disponibles dans Overleaf par défaut :

```latex
\usepackage[utf8]{inputenc}      % Encodage UTF-8
\usepackage[french]{babel}       % Support français
\usepackage{geometry}            % Marges et mise en page
\usepackage{titlesec}           % Formatage des titres
\usepackage{fancyhdr}           % En-têtes et pieds de page
\usepackage{graphicx}           % Images (si nécessaire)
\usepackage{listings}           % Code source
\usepackage{tcolorbox}          % Boîtes colorées
\usepackage{hyperref}           % Liens hypertexte
\usepackage{xcolor}             % Couleurs personnalisées
```

## Personnalisation

### Modifier les Informations Personnelles

Dans `journal_pfe_data_governance.tex`, modifiez :

```latex
\author{VOTRE NOM\\              % ← Remplacez par votre nom
Étudiant en Ingénierie Informatique\\
Entreprise d'accueil: NXCI\\
Lieu: Berges du Lac 1, Tunis\\
Partenariat Canado-Tunisien}
```

### Ajuster les Dates

Si nécessaire, modifiez :
```latex
\date{Période de stage: 17 février 2025 - 17 août 2025}
```

### Personnaliser les Couleurs

```latex
\definecolor{primaryblue}{RGB}{0,102,204}      % Bleu principal
\definecolor{secondarygreen}{RGB}{34,139,34}   % Vert secondaire  
\definecolor{warningorange}{RGB}{255,140,0}    % Orange d'alerte
```

## Vérifications Importantes

### 1. Compilation Sans Erreur
- Vérifiez qu'il n'y a pas d'erreurs LaTeX
- Tous les fichiers `\input{sections/semaine_XX}` doivent être trouvés
- Les packages doivent être correctement chargés

### 2. Structure du Document
- Table des matières générée automatiquement
- Numérotation des pages correcte
- En-têtes et pieds de page affichés

### 3. Contenu
- Toutes les 26 semaines sont présentes
- Les jours fériés sont marqués
- La progression est cohérente

## Dépannage Courant

### Erreur "File not found"
- Vérifiez que tous les fichiers `semaine_XX.tex` sont dans le dossier `sections/`
- Vérifiez l'orthographe des noms de fichiers

### Problème d'encodage
- Assurez-vous d'utiliser l'encodage UTF-8
- Vérifiez les caractères spéciaux français (é, à, ç, etc.)

### Compilation lente
- Normal pour un document de 100+ pages
- Soyez patient lors de la première compilation

## Export Final

### Pour Impression
1. Compilez le document complet
2. Téléchargez le PDF généré
3. Vérifiez la qualité d'impression
4. Format recommandé : A4, recto-verso

### Pour Soumission Électronique
1. Vérifiez que tous les liens fonctionnent
2. Testez la navigation dans le PDF
3. Vérifiez la table des matières
4. Sauvegardez une copie de sauvegarde

## Conseils d'Utilisation

### 1. Sauvegarde Régulière
- Overleaf sauvegarde automatiquement
- Téléchargez régulièrement une copie locale
- Utilisez le versioning d'Overleaf si disponible

### 2. Collaboration
- Partagez le projet avec votre superviseur si nécessaire
- Utilisez les commentaires pour les révisions
- Activez le mode révision pour les modifications

### 3. Optimisation
- Compilez régulièrement pour détecter les erreurs tôt
- Utilisez la prévisualisation pour vérifier le rendu
- Organisez vos fichiers de manière logique

## Support Technique

Si vous rencontrez des problèmes :

1. **Documentation Overleaf** : [https://www.overleaf.com/learn](https://www.overleaf.com/learn)
2. **Support LaTeX** : [https://tex.stackexchange.com](https://tex.stackexchange.com)
3. **Guide français** : Recherchez "LaTeX français" pour les spécificités

Ce guide vous permettra d'utiliser efficacement le journal de bord dans Overleaf pour produire un document professionnel de qualité universitaire.