@echo off
echo ==========================================
echo      Pushing Vercel Fix
echo ==========================================

echo [1/3] Adding changes...
git add .

echo [2/3] Committing...
git commit -m "Add vercel.json to fix 404 errors"

echo [3/3] Pushing to GitHub...
git push

echo.
echo ==========================================
echo      Done! Vercel will redeploy automatically.
echo ==========================================
pause
