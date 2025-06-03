# PORTMAN: The Portfolio Maker - Automated Startup Guide

## 🚀 Quick Start Options

### Option 1: Super Quick Start (Recommended)
Double-click `START_PORTMAN.bat` in the project root directory.

### Option 2: PowerShell Quick Start
```powershell
cd "c:\FinnSkers\PORTMAN_The Portfolio Maker"
.\quick_start.ps1
```

### Option 3: Full Featured Start
```powershell
cd "c:\FinnSkers\PORTMAN_The Portfolio Maker"
.\start_portman.ps1
```

## 🛑 Stopping Services

### Option 1: Quick Stop
Double-click `STOP_PORTMAN.bat` in the project root directory.

### Option 2: PowerShell Stop
```powershell
cd "c:\FinnSkers\PORTMAN_The Portfolio Maker"
.\stop_portman.ps1
```

### Option 3: Manual Stop
```powershell
Get-Job | Stop-Job; Get-Job | Remove-Job
```

## 📋 Prerequisites

Before running PORTMAN, ensure you have:

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **Python** (v3.8 or higher) - [Download](https://python.org/)
3. **Ollama** (optional, for enhanced CV extraction) - [Download](https://ollama.ai/)

## 🔧 Services Overview

| Service | Port | Purpose | URL |
|---------|------|---------|-----|
| Frontend | 3000 | Next.js Web App | http://localhost:3000 |
| Backend | 5000 | Express.js API | http://localhost:5000 |
| CV Parser | 6000 | Python AI Service | http://localhost:6000 |

## 📖 Startup Script Options

### `start_portman.ps1` Parameters:

```powershell
# Skip dependency installation
.\start_portman.ps1 -SkipDependencies

# Skip Ollama setup (faster startup)
.\start_portman.ps1 -SkipOllama

# Start only backend services
.\start_portman.ps1 -BackendOnly

# Start only frontend
.\start_portman.ps1 -FrontendOnly

# Custom ports
.\start_portman.ps1 -BackendPort 5001 -FrontendPort 3001 -CVParserPort 6001
```

## 🔍 Health Checks

After startup, the scripts automatically check:
- ✅ CV Parser health: http://localhost:6000/health
- ✅ Backend health: http://localhost:5000/health  
- ✅ Frontend accessibility: http://localhost:3000

## 🧪 Testing

### Test CV Extraction
Open the test UI: `tests/cv_extraction_ui.html`

### Run Backend Tests
```powershell
cd backend
npm test
```

### Test Full Workflow
```powershell
cd tests
python cv_extraction_test.py
```

## 📊 Monitoring

### Check Service Status
```powershell
Get-Job | Format-Table Name, State, Id
```

### View Service Logs
```powershell
# Backend logs
Receive-Job -Name "Backend" -Keep

# Frontend logs  
Receive-Job -Name "Frontend" -Keep

# CV Parser logs
Receive-Job -Name "CVParser" -Keep
```

## 🎯 URLs After Startup

- **Main App**: http://localhost:3000
- **API Docs**: http://localhost:5000/health
- **CV Test UI**: file:///c:/FinnSkers/PORTMAN_The%20Portfolio%20Maker/tests/cv_extraction_ui.html

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill process by PID
taskkill /PID <PID> /F
```

### Dependencies Issues
```powershell
# Reinstall backend dependencies
cd backend
npm install

# Reinstall frontend dependencies  
cd frontend
npm install

# Reinstall Python dependencies
pip install flask requests python-dotenv cors
```

### Ollama Issues
```powershell
# Check Ollama status
ollama list

# Restart Ollama
taskkill /F /IM ollama.exe
ollama serve

# Pull Llama2 model
ollama pull llama2
```

### Service Won't Start
1. Check if ports are free
2. Verify Node.js and Python are installed
3. Run with `-SkipDependencies` flag
4. Check logs with `Receive-Job -Name "ServiceName"`

## 🚀 Development Workflow

### Daily Development
1. Run `START_PORTMAN.bat`
2. Develop and test
3. Run `STOP_PORTMAN.bat` when done

### First Time Setup
1. Run `.\start_portman.ps1` (installs dependencies)
2. Test with sample CVs
3. Customize as needed

### Production Deployment
1. Run `npm run build` in frontend
2. Set environment variables
3. Use PM2 or similar for process management

## 📝 Script Files Overview

| File | Purpose |
|------|---------|
| `START_PORTMAN.bat` | One-click startup |
| `STOP_PORTMAN.bat` | One-click shutdown |
| `quick_start.ps1` | Simple PowerShell startup |
| `start_portman.ps1` | Full-featured startup with options |
| `stop_portman.ps1` | Clean shutdown script |

## 💡 Tips

- Use `quick_start.ps1` for daily development
- Use `start_portman.ps1` for first setup or when changing dependencies
- Always run `stop_portman.ps1` before shutting down to clean up properly
- The CV test UI works offline and doesn't need the servers running
- Services start in background jobs - use `Get-Job` to monitor them

## 🎉 Success Indicators

When everything is working, you should see:
- ✅ 3 services running (Frontend, Backend, CV Parser)
- ✅ Browser opens to http://localhost:3000
- ✅ All health checks pass
- ✅ No error messages in startup logs

Happy coding with PORTMAN! 🚀
