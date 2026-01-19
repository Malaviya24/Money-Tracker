@echo off
echo ==========================================
echo      Pushing New Project Config
echo ==========================================

echo [1/3] Adding changes...
git add .

echo [2/3] Committing...
git commit -m "Update Supabase configuration for new project"

echo [3/3] Pushing to GitHub...
git push

echo.
echo ==========================================
echo      Done! Remember to update Vercel env vars!
echo ==========================================
pause
