# Nox Chat — Railway

Modern private chat app optimized for **Railway**.

## Features
- Login / Register
- Smooth dark UI
- 1-to-1 chat + photo share
- View Once photos
- Notifications
- Telegram → owner
- Blackbox AI help
- MongoDB (Railway plugin or Atlas)
- Cloudinary images

## Deploy on Railway (recommended)

1. Push this folder to GitHub
2. https://railway.app → **New Project** → **Deploy from GitHub**
3. Select the repo / root = this folder (`nox-railway`)
4. **Add MongoDB** plugin (Railway) → it sets `MONGO_URL` automatically
5. Variables → add:

```
JWT_SECRET=long_random_string
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
TELEGRAM_BOT_TOKEN=...
TELEGRAM_OWNER_ID=...
TELEGRAM_ENABLED=true
BLACKBOX_API_KEY=...
BLACKBOX_ENABLED=true
```

6. Generate domain: Settings → Networking → Public domain
7. Open the URL → Register two users → chat

### Optional: Atlas instead of Railway Mongo
Set:
```
MONGODB_URI=mongodb+srv://.../nox_chat?retryWrites=true&w=majority
```

## Local
```bash
npm install
cp .env.example .env.local
npm run dev
```

## Health
`GET /api/health` — checks which env vars are present
