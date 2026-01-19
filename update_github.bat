@echo off
echo ==========================================
echo      Pushing Auth Fix
echo ==========================================

echo [1/3] Adding changes...
git add .

echo [2/3] Committing...
git commit -m "Fix authentication error in Create Space"

echo [3/3] Pushing to GitHub...
git push

echo.
echo ==========================================
echo      Done! Vercel will redeploy automatically.
echo ==========================================
pause
