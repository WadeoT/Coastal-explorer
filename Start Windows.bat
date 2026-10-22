@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel% equ 0 (
    py -3 serve.py
) else (
    python serve.py
)
if errorlevel 1 (
    echo.
    echo Install Python 3 from python.org, then open this file again.
    echo You can also try opening index.html directly in Chrome or Edge.
    pause
)
