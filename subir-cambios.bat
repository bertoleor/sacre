@echo off
echo ========================================
echo Subiendo cambios a GitHub
echo ========================================
echo.

echo 1. Agregando archivos modificados...
git add .

echo.
echo 2. Creando commit...
git commit -m "Fix: Arreglar conflicto de ESLint para Vercel"

echo.
echo 3. Subiendo a GitHub...
git push

echo.
echo ========================================
echo Listo! Vercel detectara el cambio automaticamente
echo ========================================
pause
