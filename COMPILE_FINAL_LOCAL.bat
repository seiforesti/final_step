@echo off
cd /d "c:\Users\seifa\OneDrive\Desktop\final_correction\DataWave_ISI_Proper"

echo ========================================
echo   COMPILATION LOCALE DU RAPPORT COMPLET
echo ========================================
echo.

echo [1/4] Premier passage pdflatex...
pdflatex -interaction=nonstopmode main.tex

echo.
echo [2/4] Bibtex...
bibtex main

echo.
echo [3/4] Deuxieme passage pdflatex...
pdflatex -interaction=nonstopmode main.tex

echo.
echo [4/4] Troisieme passage pdflatex...
pdflatex -interaction=nonstopmode main.tex

echo.
echo ========================================
echo   COMPILATION TERMINEE!
echo ========================================
echo.
echo PDF cree: main.pdf
echo.

start main.pdf

pause
