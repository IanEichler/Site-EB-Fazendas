@echo off
cd /d "%~dp0"
start "EB Fazendas" http://localhost:3000
node server.mjs
pause
