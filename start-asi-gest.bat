@echo off
REM ============================================================================
REM ASI-GEST Startup Script
REM © 2025 Enrico Callegaro - Tutti i diritti riservati.
REM ============================================================================

echo.
echo ========================================
echo   ASI-GEST Startup Script
echo ========================================
echo.

REM Imposta il path della directory di lavoro
REM Modifica questa riga se la directory è diversa
SET "PROJECT_DIR=%~dp0"

echo [1/5] Verificando path progetto...
echo Path: %PROJECT_DIR%
cd /d "%PROJECT_DIR%"
if errorlevel 1 (
    echo ERRORE: Impossibile accedere alla directory del progetto
    pause
    exit /b 1
)

echo [2/5] Avvio Backend Python (FastAPI)...
echo.
REM Avvia il backend tramite WSL in una nuova finestra
start "ASI-GEST Backend" wsl -e bash -c "cd /home/user/asi-gest-app/backend && source venv/bin/activate && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

REM Attendi 3 secondi per far partire il backend
timeout /t 3 /nobreak >nul

echo [3/5] Avvio Frontend React (Vite)...
echo.
REM Avvia il frontend in una nuova finestra
start "ASI-GEST Frontend" cmd /c "cd /d "%PROJECT_DIR%frontend" && npm run dev"

REM Attendi 5 secondi per far partire il frontend
echo [4/5] Attendo avvio servizi (5 secondi)...
timeout /t 5 /nobreak >nul

echo [5/5] Apertura browser...
echo.
REM Apri il browser sulla porta del frontend
start "" "http://localhost:5173"

echo.
echo ========================================
echo   ASI-GEST Avviato con successo!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
echo NOTA: Le finestre di Backend e Frontend rimarranno aperte.
echo       Chiudi quelle finestre per terminare i servizi.
echo.
pause
