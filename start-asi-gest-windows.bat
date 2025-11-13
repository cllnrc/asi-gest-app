@echo off
REM ==============================================================================
REM ASI-GEST - Sistema di Gestione Produzione
REM ==============================================================================
REM This script launches both backend (FastAPI) and frontend (React+Vite) servers
REM It automatically installs dependencies if missing
REM Backend: http://localhost:8000 (API + Swagger docs at /docs)
REM Frontend: http://localhost:5173
REM ==============================================================================

cd /d %~dp0

echo.
echo ========================================
echo   ASI-GEST Sistema Gestione
echo   Checking dependencies...
echo ========================================
echo.

REM Check if Python is available
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python not found in PATH
    echo Please install Python 3.9+ and add it to PATH
    echo Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check if Node.js is available
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not found in PATH
    echo Please install Node.js and npm
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is available
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm not found in PATH
    echo Please install Node.js which includes npm
    pause
    exit /b 1
)

echo [CHECK] Python: OK
echo [CHECK] Node.js: OK
echo [CHECK] npm: OK
echo.

REM ==============================================================================
REM Backend Setup
REM ==============================================================================
echo ========================================
echo   Backend Setup
echo ========================================

cd /d %~dp0backend

REM Use separate venv for Windows to avoid conflicts with WSL/Linux venv
set VENV_DIR=venv_windows

REM Check if Windows venv exists
if exist %VENV_DIR%\Scripts\activate.bat (
    echo [OK] Virtual environment exists (Windows)
) else (
    echo [1/2] Creating Python virtual environment for Windows...
    python -m venv %VENV_DIR%
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to create virtual environment
        echo Make sure Python is installed with venv module
        pause
        exit /b 1
    )
    echo [OK] Virtual environment created
)

REM Activate venv and install dependencies
echo [2/2] Installing backend dependencies...
call %VENV_DIR%\Scripts\activate.bat
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to activate virtual environment
    pause
    exit /b 1
)

python -m pip install --upgrade pip -q
python -m pip install -r requirements.txt -q
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
echo [OK] Backend dependencies installed

cd /d %~dp0

REM ==============================================================================
REM Frontend Setup
REM ==============================================================================
echo.
echo ========================================
echo   Frontend Setup
echo ========================================

cd /d %~dp0frontend

REM Check if node_modules exists and verify it's Windows-compatible
if exist node_modules\.bin\vite.cmd (
    echo [OK] Frontend dependencies exist (Windows)
) else (
    if exist node_modules (
        echo [WARNING] Linux node_modules detected
        echo [INFO] Running npm install to fix Windows compatibility...
        echo [INFO] If this fails, manually delete frontend\node_modules and re-run
    )
    echo [1/1] Installing frontend dependencies for Windows...
    echo This may take a few minutes...
    call npm install --force
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ========================================
        echo ERROR: Failed to install frontend dependencies
        echo ========================================
        echo.
        echo Possible solutions:
        echo 1. Close all editors/file explorers in frontend folder
        echo 2. Run this script as Administrator
        echo 3. Manually delete D:\Asi-Gest\asi-gest-app\frontend\node_modules from Windows Explorer
        echo 4. Re-run this script
        echo.
        pause
        exit /b 1
    )
    echo [OK] Frontend dependencies installed
)

cd /d %~dp0

REM ==============================================================================
REM Start Servers
REM ==============================================================================
echo.
echo ========================================
echo   Starting Servers
echo ========================================
echo.

REM Start Backend Server
echo [1/2] Starting Backend API Server...
echo       Location: backend/
echo       URL: http://localhost:8000
echo.
start "ASI-GEST Backend API" cmd /k "cd /d %~dp0backend && call venv_windows\Scripts\activate.bat && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"

REM Wait for backend to initialize
echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

REM Start Frontend Server
echo.
echo [2/2] Starting Frontend Dev Server...
echo       Location: frontend/
echo       URL: http://localhost:5173
echo.
start "ASI-GEST Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

REM Wait for frontend to initialize
echo Waiting for frontend to start...
timeout /t 8 /nobreak >nul

REM Open browser
echo.
echo Opening browser...
echo.
start http://localhost:5173

echo.
echo ========================================
echo   System Started Successfully!
echo ========================================
echo.
echo Backend API:  http://localhost:8000
echo Swagger Docs: http://localhost:8000/docs
echo Frontend:     http://localhost:5173
echo.
echo Two command windows have opened:
echo   1. Backend API (FastAPI + Uvicorn)
echo   2. Frontend (React + Vite)
echo.
echo To stop the system:
echo   - Close both command windows
echo   - Or press Ctrl+C in each window
echo.
echo ========================================
echo.

pause
