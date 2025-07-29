# ============================================================================
# PRISM MongoDB - Schnelle Lösung für Authentifizierungsproblem
# ============================================================================

## 🎯 **Das Problem**
MongoDB läuft bereits mit aktivierter Authentifizierung und verlangt Credentials für alle Befehle.

## ✅ **Sofortige Lösung**

### 1. Docker MongoDB starten (Empfohlen):

```powershell
# MongoDB Container starten
docker run -d --name prism-mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=admin123 mongo:8.0

# Warten bis Container startet (5-10 Sekunden)
Start-Sleep -Seconds 10

# Verbindung testen
docker exec -it prism-mongodb mongosh -u admin -p admin123 --authenticationDatabase admin
```

### 2. .env Datei aktualisieren:

```env
# MongoDB mit Docker
MONGODB_URI=mongodb://admin:admin123@localhost:27017/prism?authSource=admin
MONGODB_DB=prism
```

### 3. PRISM API Server starten:

```powershell
# Im PRISM Verzeichnis
npm run dev:api
```

## 🛠️ **Alternative: Lokale MongoDB ohne Auth**

Wenn Sie die lokale MongoDB-Installation ohne Authentifizierung nutzen möchten:

### 1. MongoDB Service stoppen:
```powershell
# Als Administrator ausführen
net stop MongoDB
```

### 2. MongoDB ohne Auth starten:
```powershell
# Neues Terminal (normal, nicht als Admin)
cd C:\Users\Jakob\Documents\GitHub\second\prism
mkdir -p data\db
mongod --dbpath data\db --noauth --port 27017
```

### 3. .env Datei:
```env
# MongoDB ohne Authentifizierung
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=prism
```

## 🎉 **Bereit zum Testen!**

Nach dem Setup können Sie die Social Features testen:

```bash
# API Server starten
npm run dev:api

# In einem neuen Terminal - API testen
curl http://localhost:3004/health
```

Die Social API Endpoints sind dann verfügbar unter:
- `http://localhost:3004/api/social/*`

## 🔄 **Next Steps**

1. Frontend Apps starten
2. Benutzer registrieren
3. Social Features testen
4. Month 6 Features implementieren
