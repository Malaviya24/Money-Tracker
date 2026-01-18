@echo off
echo ==========================================
echo      Setting up GitHub Repository
echo ==========================================

echo [1/6] Initializing Git...
git init

echo [2/6] Adding all files (secrets are ignored)...
git add .

echo [3/6] Committing changes...
git commit -m "Initial commit"

echo [4/6] Setting main branch...
git branch -M main

echo [5/6] Configuring remote 'origin'...
:: Remove origin if it exists to prevent errors
git remote remove origin 2>nul
git remote add origin https://github.com/Malaviya24/Money-Tracker.git

echo [6/6] Pushing to GitHub...
echo.
echo NOTE: A browser window or login prompt may appear. 
echo Please sign in to authorize the push.
echo.
git push -u origin main

echo.
echo ==========================================
echo      Setup Complete!
echo ==========================================
pause
