# GUIDE INSTALLATION TEXLIVE + COMPILATION LOCALE

## ÉTAPE 1: TÉLÉCHARGER TEXLIVE

### Option A: Installation Réseau (RECOMMANDÉ)
1. Aller sur: https://www.tug.org/texlive/acquire-netinstall.html
2. Télécharger **install-tl-windows.exe** (petit fichier ~30 MB)
3. Double-cliquer sur le fichier téléchargé

### Option B: Installation ISO (Plus rapide si connexion lente)
1. Aller sur: https://www.tug.org/texlive/acquire-iso.html
2. Télécharger **texlive2024.iso** (~4.5 GB)
3. Monter l'ISO et lancer install-tl-windows.bat

---

## ÉTAPE 2: INSTALLER TEXLIVE

### Installation:
1. **Lancer install-tl-windows.exe**
2. Cliquer **"Install"** (installation complète)
3. **Attendre 30-60 minutes** (télécharge ~7 GB de packages)
4. Ne pas fermer la fenêtre pendant l'installation!

### Vérification:
Après installation, ouvrir PowerShell et taper:
```powershell
pdflatex --version
```

Si ça affiche la version → **Installation réussie!** ✅

---

## ÉTAPE 3: PRÉPARER LE PROJET

Le projet est déjà prêt dans:
```
c:\Users\seifa\OneDrive\Desktop\final_correction\ISI-LaTeX-Template-master (1)\ISI-LaTeX-Template-master (1)\ISI-LaTeX-Template-master\
```

### Fichiers présents:
- ✅ main.tex (fichier principal)
- ✅ tpl/ (template ISI)
- ✅ Tous les chapitres (.tex)
- ✅ Configuration (global_config.tex, etc.)
- ✅ Bibliographie (biblio.bib)

---

## ÉTAPE 4: COMPILER LE RAPPORT

### Méthode 1: Double-cliquer sur COMPILE_LOCAL.bat
Le fichier `COMPILE_LOCAL.bat` est dans:
```
c:\Users\seifa\OneDrive\Desktop\final_correction\
```

**Double-cliquer dessus** → Compilation automatique!

### Méthode 2: Ligne de commande
Ouvrir PowerShell dans le dossier du projet:
```powershell
cd "c:\Users\seifa\OneDrive\Desktop\final_correction\ISI-LaTeX-Template-master (1)\ISI-LaTeX-Template-master (1)\ISI-LaTeX-Template-master"

# Compilation complète (4 passes)
pdflatex -interaction=nonstopmode main.tex
bibtex main
pdflatex -interaction=nonstopmode main.tex
pdflatex -interaction=nonstopmode main.tex
```

---

## ÉTAPE 5: RÉSULTAT

Après compilation, tu auras:
- ✅ **main.pdf** (90 pages complètes!)
- ✅ Table des matières
- ✅ Liste des figures
- ✅ Bibliographie
- ✅ Index

Le PDF s'ouvrira automatiquement!

---

## TEMPS ESTIMÉ

- **Téléchargement TeXLive**: 10-30 minutes (selon connexion)
- **Installation TeXLive**: 30-60 minutes
- **Compilation rapport**: 2-5 minutes (première fois)
- **Compilations suivantes**: 30-60 secondes

---

## AVANTAGES COMPILATION LOCALE

✅ **Pas de timeout** - compile même 1000 pages!
✅ **Pas de limite** - toutes les images, tous les packages
✅ **Plus rapide** - pas de queue d'attente
✅ **Offline** - pas besoin d'internet
✅ **Contrôle total** - tu vois tous les logs

---

## DÉPANNAGE

### Si "pdflatex not found":
1. Redémarrer l'ordinateur après installation
2. Vérifier que TeXLive est dans le PATH:
   - Chercher: `C:\texlive\2024\bin\windows\`
   - Ajouter au PATH si nécessaire

### Si erreurs de compilation:
1. Regarder les logs dans le terminal
2. Les erreurs sont affichées clairement
3. Corriger et recompiler

---

## PROCHAINES ÉTAPES

1. **Installer TeXLive** (en cours...)
2. **Attendre la fin de l'installation**
3. **Double-cliquer sur COMPILE_LOCAL.bat**
4. **Profiter de ton PDF de 90 pages!** 🎉

**FINI LES PROBLÈMES OVERLEAF!** 🚀
