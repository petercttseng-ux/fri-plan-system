@echo off
echo.
echo ====================================================
echo  GitHub Deployment Script for FRI Plan System
echo ====================================================
echo.
set /p GITHUB_USER="Enter your GitHub Username: "
echo.
cd /d "%~dp0"
git remote remove origin 2>nul
git remote add origin https://github.com/%GITHUB_USER%/fri-plan-system.git
git branch -M main
git add .
git commit -m "Auto update plans data"
git push -u origin main
echo.
echo ====================================================
echo  Deployment complete! 
pause
