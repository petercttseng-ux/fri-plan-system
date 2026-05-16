@echo off
echo.
echo ====================================================
echo  GitHub Deployment Script for FRI Plan System
echo ====================================================
echo.
echo Step 1: Go to https://github.com/new and create a new repository
echo         Name: fri-plan-system
echo         Visibility: Public
echo         Do NOT check "Initialize with README"
echo.
set /p GITHUB_USER="Step 2: Enter your GitHub Username: "
echo.
echo Target URL: https://github.com/%GITHUB_USER%/fri-plan-system.git
echo.
cd /d "d:\Dropbox\?¬å?è³‡æ?_ä¸»ç?\03ä¸»ç?å®¤\02.Gemini\FRIproject01\fri-plan-system"
git remote remove origin 2>nul
git remote add origin https://github.com/%GITHUB_USER%/fri-plan-system.git
git branch -M main
git push -u origin main
echo.
echo ====================================================
echo  Deployment complete! 
echo  Please enable GitHub Pages at:
echo  https://github.com/%GITHUB_USER%/fri-plan-system/settings/pages
echo  Settings ^> Pages ^> Branch: main ^> / (root) ^> Save
echo.
echo  Your system will be available at:
echo  https://%GITHUB_USER%.github.io/fri-plan-system/
echo ====================================================
pause
