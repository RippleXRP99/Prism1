@echo off
echo ============================================================================
echo PRISM Platform - MongoDB Setup and Startup
echo ============================================================================

echo.
echo 🔧 Setting up MongoDB for PRISM development...

REM Check if MongoDB is installed
where mongod >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ MongoDB is not installed or not in PATH
    echo.
    echo 📥 Installing MongoDB via winget...
    winget install MongoDB.Server
    
    echo.
    echo ⚠️  MongoDB installation completed. You may need to restart your terminal
    echo    or add MongoDB to your PATH manually.
    echo.
    echo 📍 MongoDB is typically installed to:
    echo    C:\Program Files\MongoDB\Server\8.0\bin\
    echo.
    echo 🔄 Please restart this script after ensuring MongoDB is in your PATH.
    pause
    exit /b 1
)

echo ✅ MongoDB found in PATH

REM Create data directory if it doesn't exist
if not exist "data\db" (
    echo 📁 Creating MongoDB data directory...
    mkdir data\db
)

echo.
echo 🚀 Starting MongoDB server...
echo 📍 Data directory: %CD%\data\db
echo 🌐 Connection: mongodb://localhost:27017
echo.

REM Start MongoDB without authentication for development
mongod --dbpath "data\db" --port 27017 --bind_ip 127.0.0.1 --logpath "data\mongodb.log" --logappend

echo.
echo ⚠️  MongoDB server stopped
pause
