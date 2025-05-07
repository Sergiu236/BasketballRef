@echo off
echo Running backend tests...
cd %~dp0
npx jest
pause 