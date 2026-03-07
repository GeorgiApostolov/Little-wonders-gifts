# cPanel Node.js Setup (Little Wonders Backend)

Use these values in cPanel Node.js App:

- Node.js version: `20.20.0`
- Application mode: `Production`
- Application root: `littlewondersgifts.com/backend`
- Application URL: `https://www.littlewondersgifts.com/backend`
- Application startup file: `server.js`

## Files needed in backend root

- `server.js`
- `package.json`

## Install and start (inside cPanel)

1. Open Node.js App in cPanel.
2. Add environment variable:
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - Example format: `mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority`
   - Optional: `MONGODB_DB=littlewondersgifts`
   - Optional: `SERVICES_COLLECTION=services`
3. Click `Run NPM Install` (or run `npm install` in the app root terminal).
4. Click `Restart` (or `Start App`).

## Test

- Open `https://www.littlewondersgifts.com/backend`
- You should see `Connected`, `Node.js backend is running`, and MongoDB status.
- Optional health check: `https://www.littlewondersgifts.com/backend/health`
- Services API: `https://www.littlewondersgifts.com/backend/services`
