# 🔧 Instrucțiuni pentru Actualizarea Deployment-ului pe Render

## Problema Identificată
Eroarea `403 (Forbidden)` cu mesajul `"Invalid or expired token"` la activarea 2FA se datorează faptului că variabilele de mediu pentru JWT nu sunt configurate pe Render, ceea ce face ca backend-ul să folosească valori default nesigure.

## 🚀 Soluția - Pași de Urmat

### 1. **Actualizează Codul (DEJA FĂCUT)**
✅ Am actualizat `frontend/src/services/twoFactorService.ts` să folosească `authenticatedFetch` pentru refresh automat de token
✅ Am actualizat `render.yaml` cu toate variabilele de mediu necesare

### 2. **Redeploy pe Render**

#### Opțiunea A: Prin Git Push (Recomandat)
```bash
git add .
git commit -m "Fix 2FA authentication - add JWT environment variables"
git push origin main
```

#### Opțiunea B: Manual prin Render Dashboard
1. Mergi la [Render Dashboard](https://dashboard.render.com)
2. Selectează serviciul `basketball-ref-api`
3. Mergi la tab-ul "Environment"
4. Adaugă următoarele variabile:

```
JWT_SECRET=<generează o valoare sigură de 64+ caractere>
JWT_REFRESH_SECRET=<generează o altă valoare sigură de 64+ caractere>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_TIME=15
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
SESSION_CLEANUP_INTERVAL=3600000
MAX_SESSIONS_PER_USER=5
PORT=3001
```

### 3. **Generează Chei JWT Sigure**
Pentru `JWT_SECRET` și `JWT_REFRESH_SECRET`, folosește:

```bash
# În terminal/PowerShell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Sau online: https://generate-secret.vercel.app/64

### 4. **Verifică Deployment-ul**
După redeploy:
1. Verifică că serviciul pornește fără erori în Render logs
2. Testează login-ul pe aplicație
3. Testează activarea 2FA

## 🔍 Ce S-a Schimbat

### Frontend (`twoFactorService.ts`)
- Înlocuit `fetch` direct cu `authenticatedFetch`
- Eliminat verificările manuale de token
- Adăugat refresh automat de token când expiră

### Deployment (`render.yaml`)
- Adăugat toate variabilele de mediu JWT
- Configurat generarea automată de secrete
- Adăugat configurări de securitate

## 🚨 Important
- După redeploy, utilizatorii existenți vor trebui să se logheze din nou
- Token-urile existente vor fi invalidate
- Aceasta este normal și necesar pentru securitate

## 🧪 Testare
După deployment:
1. Loghează-te în aplicație
2. Mergi la Settings
3. Încearcă să activezi 2FA
4. Verifică că nu mai apare eroarea 403

## 📞 Dacă Problema Persistă
1. Verifică Render logs pentru erori
2. Confirmă că toate variabilele de mediu sunt setate
3. Verifică că database-ul este conectat
4. Testează endpoint-ul `/api/health` 