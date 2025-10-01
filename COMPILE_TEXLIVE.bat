@echo off
echo ========================================
echo COMPILATION RAPPORT PFE AVEC TEXLIVE 2025
echo ========================================
echo.

REM Ajouter TeXLive au PATH
set PATH=C:\texlive\2025\bin\windows;%PATH%

REM Vérifier que pdflatex est accessible
where pdflatex >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERREUR: pdflatex non trouve dans le PATH
    echo Verifiez que TeXLive est installe dans C:\texlive\2025
    pause
    exit /b 1
)

echo TeXLive 2025 detecte!
echo.

cd "ISI-LaTeX-Template-master (1)\ISI-LaTeX-Template-master (1)\ISI-LaTeX-Template-master"

echo [1/4] Premiere compilation pdflatex...
pdflatex -interaction=nonstopmode main.tex

echo.
echo [2/4] Compilation bibtex...
bibtex main

echo.
echo [3/4] Deuxieme compilation pdflatex...
pdflatex -interaction=nonstopmode main.tex

echo.
echo [4/4] Troisieme compilation pdflatex (references finales)...
pdflatex -interaction=nonstopmode main.tex

echo.
echo ========================================
if exist main.pdf (
    echo SUCCES! PDF genere: main.pdf
    echo Taille du fichier:
    dir main.pdf | find "main.pdf"
    echo.
    echo Ouverture du PDF...
    start main.pdf
) else (
    echo ERREUR: Le PDF n'a pas ete genere
    echo Consultez main.log pour plus de details
)
echo ========================================
pause
