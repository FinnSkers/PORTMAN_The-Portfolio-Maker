@echo off
REM PORTMAN: Start all services in separate windows

REM Start Python CV Parser (Flask, port 6060) using venv python
start "CV Parser" cmd /k "cd /d "%~dp0backend" && .venv\Scripts\python.exe -u deepseek_cv_parser.py"

REM Start Node.js Backend (port 5000)
start "Backend" cmd /k "cd /d "%~dp0backend" && node server.js"

REM Start Next.js Frontend (port 3000)
start "Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

REM Display access URLs
@echo.
@echo =============================
@echo PORTMAN Services Started!
@echo -----------------------------
@echo CV Parser:   http://localhost:6060/health
@echo Backend:     http://localhost:5000/api/health
@echo Frontend:    http://localhost:3000/
@echo =============================
@echo.
@echo Close this window to stop all services (or close each service window individually).
