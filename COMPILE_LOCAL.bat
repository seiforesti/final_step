@echo off
echo ========================================
echo COMPILATION LOCALE RAPPORT PFE DATAWAVE
echo ========================================
echo.

cd "ISI-LaTeX-Template-master (1)\ISI-LaTeX-Template-master (1)\ISI-LaTeX-Template-master"

echo [1/4] Premiere compilation pdflatex...
pdflatex -interaction=nonstopmode main.tex

echo.
echo [2/4] Generation bibliographie...
bibtex main

echo.
echo [3/4] Deuxieme compilation pdflatex...
pdflatex -interaction=nonstopmode main.tex

echo.
echo [4/4] Troisieme compilation pdflatex (finalisation)...
pdflatex -interaction=nonstopmode main.tex

echo.
echo ========================================
echo COMPILATION TERMINEE!
echo ========================================
echo.
echo PDF genere: main.pdf
echo.
echo Ouverture du PDF...
start main.pdf

pause
