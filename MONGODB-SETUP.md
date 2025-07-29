# ============================================================================
# PRISM Platform - Quick Start Guide
# MongoDB Setup and Configuration
# ============================================================================

## 🔍 MongoDB Berechtigung - Problem und Lösung

Das Problem "command hostInfo requires authentication" tritt auf, weil MongoDB standardmäßig Authentifizierung für administrative Befehle verlangt.

### 🎯 **Einfachste Lösung: Docker verwenden**

```bash
# 1. Docker Desktop installieren (falls nicht vorhanden)
# Download von: https://www.docker.com/products/docker-desktop

# 2. MongoDB mit Docker starten
docker run -d --name prism-mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=prismAdmin -e MONGO_INITDB_ROOT_PASSWORD=prismDev2025 mongo:8.0

# 3. MongoDB Shell verbinden
docker exec -it prism-mongodb mongosh -u prismAdmin -p prismDev2025 --authenticationDatabase admin
```

### 🛠️ **Alternative: Lokale MongoDB Installation**

#### Windows:
```powershell
# 1. MongoDB installieren
winget install MongoDB.Server

# 2. MongoDB Service starten (als Administrator)
net start MongoDB

# 3. MongoDB Shell ohne Auth starten
mongosh mongodb://localhost:27017
```

#### macOS:
```bash
# 1. MongoDB installieren
brew install mongodb-community

# 2. MongoDB Service starten
brew services start mongodb-community

# 3. MongoDB Shell verbinden
mongosh mongodb://localhost:27017
```

### ⚙️ **PRISM Konfiguration**

#### 1. Umgebungsvariablen setzen (.env):
```env
# Entwicklung (ohne Authentifizierung)
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=prism

# Produktion (mit Authentifizierung)
MONGODB_URI=mongodb://prismApp:prismApp2025@localhost:27017/prism?authSource=prism
```

#### 2. Database Setup Script ausführen:
```bash
# Im PRISM Root-Verzeichnis
node scripts/setup-mongodb.js
```

### 🔐 **Benutzer und Berechtigungen**

Nach der MongoDB-Installation werden folgende Benutzer erstellt:

#### Admin User:
- **Username:** `prismAdmin`
- **Password:** `prismDev2025`
- **Berechtigungen:** Vollzugriff auf alle Datenbanken

#### Application User:
- **Username:** `prismApp`
- **Password:** `prismApp2025`
- **Berechtigungen:** Lese/Schreibzugriff auf `prism` Datenbank

### 🚀 **PRISM Server starten**

```bash
# 1. Dependencies installieren
npm install

# 2. MongoDB starten (siehe oben)

# 3. API Server starten
npm run dev:api

# 4. Frontend Apps starten (optional)
npm run dev:consumer    # Consumer App (Port 3000)
npm run dev:creator     # Creator Studio (Port 3001)
npm run dev:admin       # Admin Dashboard (Port 3002)
```

### 📊 **Verfügbare API Endpoints**

Nach dem Start sind folgende Social Features verfügbar:

#### Kommentare:
- `POST /api/social/comments` - Kommentar hinzufügen
- `GET /api/social/comments/:contentId` - Kommentare abrufen
- `PUT /api/social/comments/:commentId` - Kommentar bearbeiten
- `DELETE /api/social/comments/:commentId` - Kommentar löschen

#### Likes:
- `POST /api/social/likes` - Like/Unlike togglen
- `GET /api/social/likes/:contentId` - Likes abrufen

#### Direct Messages:
- `POST /api/social/messages` - Nachricht senden
- `GET /api/social/conversations` - Unterhaltungen abrufen
- `GET /api/social/conversations/:id/messages` - Nachrichten abrufen

#### Social Graph:
- `POST /api/social/follow` - Benutzer folgen/entfolgen
- `GET /api/social/relationships` - Beziehungen abrufen
- `GET /api/social/recommendations` - Benutzerempfehlungen

#### Creator-Fan Interaktionen:
- `POST /api/social/tips` - Trinkgeld senden
- `POST /api/social/personal-messages` - Persönliche Nachricht kaufen
- `POST /api/social/video-calls` - Video-Call planen
- `POST /api/social/custom-requests` - Custom Content Request
- `POST /api/social/fan-clubs/:creatorId/join` - Fan Club beitreten

### 🔍 **Troubleshooting**

#### "hostInfo requires authentication":
- MongoDB läuft mit aktivierter Authentifizierung
- Verwenden Sie die korrekten Credentials (siehe oben)
- Oder starten Sie MongoDB ohne `--auth` für Development

#### "Command not found: mongosh":
- MongoDB ist nicht im PATH
- Pfad hinzufügen: `C:\Program Files\MongoDB\Server\8.0\bin\`
- Oder Docker-Alternative verwenden

#### "Access denied" beim Service-Start:
- Terminal als Administrator ausführen
- Oder Docker-Alternative verwenden

### 🎯 **Empfohlenes Setup für Development**

1. **Docker verwenden** (einfachste Option)
2. MongoDB mit vorkonfigurierten Benutzern
3. PRISM API Server mit Social Features
4. Frontend Apps nach Bedarf

### 📞 **Support**

Bei Problemen:
1. MongoDB Logs prüfen: `data/mongodb.log`
2. PRISM API Logs prüfen
3. Browser Developer Tools für Frontend-Fehler
