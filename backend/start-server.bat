@echo off
echo Starting backend server...
cd %~dp0
npx ts-node src/index.ts
pause 