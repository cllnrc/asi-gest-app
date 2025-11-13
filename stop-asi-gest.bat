@echo off
REM ============================================================================
REM ASI-GEST Shutdown Script
REM © 2025 Enrico Callegaro - Tutti i diritti riservati.
REM ============================================================================

echo.
echo ========================================
echo   ASI-GEST Shutdown Script
echo ========================================
echo.

echo [1/3] Terminazione Backend (porta 8000)...
REM Trova e termina il processo sulla porta 8000
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do (
    echo Terminando processo PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo [2/3] Terminazione Frontend (porta 5173)...
REM Trova e termina il processo sulla porta 5173
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do (
    echo Terminando processo PID: %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo [3/3] Chiusura finestre terminale...
REM Chiude le finestre con titolo specifico
taskkill /FI "WINDOWTITLE eq ASI-GEST Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq ASI-GEST Frontend*" /F >nul 2>&1

echo.
echo ========================================
echo   ASI-GEST Terminato
echo ========================================
echo.
timeout /t 2 /nobreak >nul
