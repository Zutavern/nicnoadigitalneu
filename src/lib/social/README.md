# Social Media Integration

Diese Dokumentation beschreibt die Social Media Integration für NICNOA.

## Unterstützte Plattformen

| Plattform | Status | OAuth | Posting |
|-----------|--------|-------|---------|
| Instagram | ✅ | ✅ | ✅ |
| Facebook | ✅ | ✅ | ✅ |
| LinkedIn | 🔜 | - | - |
| X/Twitter | 🔜 | - | - |
| TikTok | 🔜 | - | - |
| YouTube | 🔜 | - | - |

## Erforderliche Environment Variables

```env
# Facebook/Instagram (Facebook Developer Portal)
FACEBOOK_APP_ID="your_facebook_app_id"
FACEBOOK_APP_SECRET="your_facebook_app_secret"

# Instagram (optional, verwendet Facebook Credentials wenn nicht gesetzt)
INSTAGRAM_APP_ID="your_instagram_app_id"
INSTAGRAM_APP_SECRET="your_instagram_app_secret"

# Token-Verschlüsselung (optional, verwendet NEXTAUTH_SECRET als Fallback)
SOCIAL_ENCRYPTION_SECRET="your_encryption_secret"

# Cron-Job Authentifizierung (optional)
CRON_SECRET="your_cron_secret"
```

## Facebook/Instagram App einrichten

### 1. Facebook App erstellen
1. Gehe zu [Facebook Developer Portal](https://developers.facebook.com/apps)
2. Klicke auf "App erstellen"
3. Wähle "Business" als App-Typ
4. Fülle die App-Details aus

### 2. Berechtigungen hinzufügen
Füge folgende Produkte/Berechtigungen hinzu:
- **Facebook Login**
- **Instagram Basic Display**
- **Instagram Graph API**

### 3. OAuth Redirect URI konfigurieren
Füge folgende URIs zu den "Valid OAuth Redirect URIs" hinzu:
```
https://your-domain.com/api/social/oauth/callback
```

### 4. Erforderliche Scopes
- `instagram_basic`
- `instagram_content_publish`
- `instagram_manage_comments`
- `instagram_manage_insights`
- `pages_show_list`
- `pages_read_engagement`
- `pages_manage_posts`
- `business_management`

## API Routes

### OAuth
- `GET /api/social/oauth/[platform]` - Startet OAuth-Flow
- `GET /api/social/oauth/callback` - OAuth Callback

### Accounts
- `GET /api/social/accounts` - Alle verbundenen Accounts
- `DELETE /api/social/accounts/[id]` - Account trennen
- `POST /api/social/accounts/[id]/refresh` - Account synchronisieren

### Posts
- `GET /api/social/posts` - Alle Posts
- `POST /api/social/posts` - Post erstellen
- `PUT /api/social/posts/[id]` - Post aktualisieren
- `DELETE /api/social/posts/[id]` - Post löschen
- `POST /api/social/posts/[id]/publish` - Post veröffentlichen

### Cron
- `GET /api/cron/publish-scheduled-posts` - Geplante Posts veröffentlichen

## Architektur

```
src/lib/social/
├── index.ts          # Exports
├── types.ts          # TypeScript Types
├── crypto.ts         # Token-Verschlüsselung
├── README.md         # Diese Dokumentation
└── providers/
    ├── instagram.ts  # Instagram Provider
    └── facebook.ts   # Facebook Provider
```

## Token-Sicherheit

- Alle OAuth Tokens werden mit AES-256-GCM verschlüsselt
- Tokens werden niemals im Klartext gespeichert
- Token-Refresh erfolgt automatisch vor Ablauf

## Cron-Job einrichten

### Vercel Cron
In `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/publish-scheduled-posts?secret=YOUR_SECRET",
    "schedule": "*/5 * * * *"
  }]
}
```

### Externe Dienste
- [cron-job.org](https://cron-job.org)
- [UptimeRobot](https://uptimerobot.com)

URL: `https://your-domain.com/api/cron/publish-scheduled-posts?secret=YOUR_SECRET`

