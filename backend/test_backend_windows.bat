@echo off
REM Script di test per diagnosticare problemi backend Windows
cd /d %~dp0

echo.
echo ========================================
echo   TEST BACKEND ASI-GEST
echo ========================================
echo.

REM Activate venv
if exist venv_windows\Scripts\activate.bat (
    echo Attivazione virtual environment...
    call venv_windows\Scripts\activate.bat
) else (
    echo ERRORE: venv_windows non trovato
    echo Esegui prima: start-asi-gest-windows.bat
    pause
    exit /b 1
)

echo.
echo Esecuzione test diagnostici...
echo.

python test_backend_windows.py

echo.
echo ========================================
pause
