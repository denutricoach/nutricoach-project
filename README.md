# NutriCoach - Gemoderniseerde Versie

Dit project bevat de gemoderniseerde NutriCoach applicatie, bestaande uit een Node.js/Express backend en een React frontend.

## Projectstructuur

- **`backend/`**: Bevat de Node.js/Express server en MongoDB modellen.
- **`frontend/`**: Bevat de React applicatie.
- **`render.yaml`**: Configuratiebestand voor Render Blueprints (automatische deployment).
- **`.gitignore`**: Git-configuratiebestand.

## Lokale Installatie en Start

### 1. Backend

```bash
cd backend
npm install
# Maak een .env bestand aan (zie render.yaml voor benodigde variabelen)
npm run dev # Start de server met nodemon
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev # Start de React ontwikkelserver
```

## Deployment naar Render via VS Code

Dit project is geconfigureerd voor eenvoudige deployment naar Render met behulp van Render Blueprints.

1.  **Installeer de Render VS Code Extensie**: Zoek naar "Render" in de VS Code Extensions Marketplace en installeer de officiële extensie.
2.  **Verbind met Render**: Volg de instructies in de extensie om in te loggen op uw Render-account.
3.  **Deploy via Blueprint**:
    *   Open het **`render.yaml`** bestand in VS Code.
    *   Klik op de knop **"Deploy to Render"** of gebruik de Render extensie om een nieuwe Blueprint te maken op basis van dit bestand.
    *   Render zal automatisch de twee services (backend en frontend) aanmaken en deployen.
4.  **Stel Omgevingsvariabelen in**:
    *   Ga naar het Render Dashboard.
    *   Navigeer naar de instellingen van de **`nutricouch-backend`** service.
    *   Voeg de volgende omgevingsvariabelen toe (zoals aangegeven in `render.yaml`):
        *   `MONGO_URI` (Uw MongoDB connection string)
        *   `JWT_SECRET` (Een lange, willekeurige string)
        *   `SESSION_SECRET` (Een lange, willekeurige string)
        *   `EMAIL_USER` (Gebruikersnaam voor uw e-mailservice, bv. SendGrid of Gmail)
        *   `EMAIL_PASS` (Wachtwoord/API-sleutel voor uw e-mailservice)
        *   `GOOGLE_CLIENT_ID` (Uw Google OAuth Client ID)
        *   `GOOGLE_CLIENT_SECRET` (Uw Google OAuth Client Secret)
        *   `CLIENT_URL` (De URL van uw gedeployde frontend service, bv. `https://nutricouch-frontend-xxxx.onrender.com`)
        *   `SERVER_URL` (De URL van uw gedeployde backend service, bv. `https://nutricouch-backend-xxxx.onrender.com`)
    *   Navigeer naar de instellingen van de **`nutricouch-frontend`** service.
    *   Voeg de volgende omgevingsvariabele toe:
        *   `REACT_APP_API_URL` (De URL van uw gedeployde backend service, bv. `https://nutricouch-backend-xxxx.onrender.com`)
5.  **Herstart Services**: Nadat u de omgevingsvariabelen heeft ingesteld, herstart u de services in Render om de wijzigingen toe te passen.

De applicatie is nu volledig operationeel en klaar voor gebruik!
