@echo off
cd /d "%~dp0.."
python tools\refresh_prices.py
echo.
pause
