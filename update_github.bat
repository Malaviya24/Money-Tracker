@echo off
echo ==========================================
echo      Updating GitHub Repository
echo ==========================================

echo [1/4] Moving logo to public folder...
if exist logo.png (
    move logo.png public\logo.png
    echo Logo moved successfully.
) else (
    echo Logo.png not found in root (maybe already moved?)
)

echo [2/4] Adding changes...
git add .

echo [3/4] Committing changes...
git commit -m "Update favicon and project settings"

echo [4/4] Pushing to GitHub...
git push

echo.
echo ==========================================
echo      Update Complete!
echo ==========================================
pause
