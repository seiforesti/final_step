# ⚡ QUICK START - DATAWAVE LATEX REPORT
## Démarrage Rapide en 5 Minutes

---

## 🎯 **OBJECTIF**

Compiler votre premier PDF du rapport DataWave en moins de 5 minutes !

---

## 📋 **PRÉREQUIS**

- ✅ Fichiers LaTeX déjà créés dans ce dossier
- ⏳ Template ISI à copier
- ⏳ LaTeX à installer

---

## 🚀 **ÉTAPE 1 : COPIER LES FICHIERS (2 minutes)**

### **Ouvrir PowerShell dans ce dossier**

Clic droit dans le dossier → "Ouvrir dans le Terminal" ou "PowerShell"

### **Exécuter cette commande**

```powershell
# Copier en une seule commande
$src = "c:\Users\seifa\OneDrive\Desktop\final_correction\ISI-LaTeX-Template-master (1)\ISI-LaTeX-Template-master"
Copy-Item "$src\tpl" -Destination "." -Recurse -Force
Copy-Item "$src\main.tex" -Destination "." -Force
Copy-Item "$src\annexes.tex" -Destination "." -Force
New-Item -Path "img" -ItemType Directory -Force
Write-Host "✅ TERMINÉ !" -ForegroundColor Green
```

---

## 💻 **ÉTAPE 2 : INSTALLER LaTeX (1 minute)**

### **Télécharger MiKTeX**

https://miktex.org/download

### **Installer**
- Cliquer sur "Next" partout
- Accepter l'installation automatique des packages

---

## 🔨 **ÉTAPE 3 : COMPILER (1 minute)**

### **Méthode Simple : TeXstudio**

1. Télécharger TeXstudio : https://www.texstudio.org/
2. Ouvrir `main.tex`
3. Appuyer sur **F5** (Compiler)
4. Attendre...
5. **PDF généré !** 🎉

### **Méthode Ligne de Commande**

```bash
cd DataWave_LaTeX_Report
pdflatex main.tex
bibtex main
pdflatex main.tex
pdflatex main.tex
```

---

## ✅ **ÉTAPE 4 : VÉRIFIER LE PDF**

Ouvrir `main.pdf` et vérifier :
- ✅ Page de garde
- ✅ Table des matières
- ✅ Introduction générale
- ✅ Chapitre 1
- ✅ Conclusion générale

---

## 🎨 **ÉTAPE 5 : PERSONNALISER (1 minute)**

### **Modifier global_config.tex**

```latex
\author{VOTRE NOM}  % ← Changer ici
\companyName{VOTRE ENTREPRISE}  % ← Changer ici
```

### **Recompiler**

Appuyer sur **F5** dans TeXstudio

---

## 🎉 **FÉLICITATIONS !**

Vous avez compilé votre premier PDF du rapport DataWave !

---

## 📝 **PROCHAINES ÉTAPES**

### **Aujourd'hui**
1. ✅ Personnaliser `global_config.tex`
2. ✅ Compléter les infos de l'entreprise dans `chap_01.tex`
3. ✅ Créer l'organigramme de l'entreprise

### **Cette Semaine**
1. Créer les 10 figures du Chapitre 1
2. Compléter les tableaux du Chapitre 1
3. Relire et corriger le Chapitre 1

### **Ce Mois**
1. Créer `chap_02.tex` (Analyse et Conception)
2. Créer `chap_03.tex` (Réalisation)
3. Créer `chap_04.tex` (Tests et Résultats)

---

## 💡 **CONSEILS RAPIDES**

### **Erreurs de Compilation ?**
- Vérifier que le dossier `tpl/` existe
- Vérifier que MiKTeX est installé
- Compiler 2-3 fois (normal pour LaTeX)

### **Images Manquantes ?**
- Créer le dossier `img/`
- Mettre vos images dedans
- Format : PNG ou PDF

### **Besoin d'Aide ?**
- Lire `INSTALLATION_GUIDE.md` pour plus de détails
- Lire `README_LATEX.md` pour le guide complet
- Consulter `../PFE_Report_Documentation/` pour la documentation

---

## 📚 **DOCUMENTATION COMPLÈTE**

Pour aller plus loin :

1. **`INSTALLATION_GUIDE.md`** - Guide détaillé étape par étape
2. **`README_LATEX.md`** - Guide complet d'utilisation
3. **`../PFE_Report_Documentation/`** - Toute la documentation du projet

---

## 🎯 **RÉSUMÉ EN 5 ÉTAPES**

1. ⚡ Copier les fichiers du template (PowerShell)
2. 💻 Installer MiKTeX
3. 🔨 Compiler avec TeXstudio (F5)
4. ✅ Vérifier le PDF
5. 🎨 Personnaliser et recompiler

---

**Temps total : 5 minutes**

**Résultat : Votre premier PDF du rapport DataWave ! 🎉**

---

**Bon courage ! 🚀**
