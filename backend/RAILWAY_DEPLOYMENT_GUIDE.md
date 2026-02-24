# Railway Deployment Guide (Backend)

This guide walks you through deploying your Node.js backend to [Railway](https://railway.app/).

## Prerequisites
1. A GitHub account.
2. A Railway account (linked to your GitHub).
3. Ensure your project is pushed to a GitHub repository.

---

## Step 1: Prepare Your Code for Production

Before pushing your code to Railway, we need to make sure your `package.json` is optimized for a production environment. Currently, your `start` script uses `nodemon`, which is only suitable for development.

1. **Update `package.json` scripts:**
   Open your `backend/package.json` and modify the `"scripts"` section to look like this:
   ```json
   "scripts": {
     "start": "node index.js",
     "dev": "nodemon index.js",
     "build": "npm run db:generate",
     "db:generate": "drizzle-kit generate",
     "db:migrate": "drizzle-kit migrate"
   }
   ```
   *Explanation: Railway will automatically look for the `start` script to run your server, and `node index.js` is the standard production way. We also moved `nodemon` to a `dev` script for your local use.*

2. **Commit and Push:**
   Commit these changes and push your code to your GitHub repository.

---

## Step 2: Create a New Project on Railway

1. Go to your [Railway Dashboard](https://railway.app/dashboard).
2. Click on **New Project**.
3. Select **Deploy from GitHub repo**.
4. Choose the repository that contains your project.
5. If your backend is in a subfolder (e.g., `backend/`), Railway might automatically detect it, but it's best to configure the **Root Directory** manually in the next steps. For now, just click **Deploy Now** (it might fail initially, but we will fix the configuration).

---

## Step 3: Configure the Railway Service

1. Click on the newly created deployment card (it usually takes the name of your repo).
2. Go to the **Settings** tab.
3. Under **Service**, locate the **Root Directory** field and set it to `/backend` (if your backend is completely contained in the `backend` folder).
4. Under **Build**, ensure the **Builder** is set to `Nixpacks` (default).
5. (Optional but recommended) In the **Build Command** field, you can add `npm run db:generate` to ensure Drizzle constructs your types before your server starts.

---

## Step 4: Add Environment Variables

Railway provides a secure way to manage your `.env` variables. Your application needs several variables to function properly in production.

1. Go to the **Variables** tab of your service.
2. Click **New Variable** and add all the variables from your local `.env` file **EXCEPT** `PORT` and `HOST` (Railway handles these automatically).

Add the following exact values (or your production equivalents):
- `DATABASE_URL`: Add your Neon connection string here.
- `NODE_ENV`: `production`
- `ARCJET_MODE`: `live` (or `production`)
- `ARCJET_ENV`: `production`
- `ARCJET_KEY`: Add your Arcjet key.

*Note: You do not need to add `PORT` or `HOST`, as your `index.js` is already configured dynamically (`process.env.PORT || 8000` and `process.env.HOST || '0.0.0.0'`), which is perfectly compatible with Railway.*

---

## Step 5: Database Migrations (Important)

If you haven't run your database migrations on your Neon production database yet, you will need to do so. You have two options:

**Option A: Run migrations locally against the Neon database**
1. Ensure your local `.env` `DATABASE_URL` points to Neon.
2. Run `npm run db:migrate` locally.

**Option B: Use Railway's Release Command (Recommended)**
1. Go to **Settings** -> **Deploy** in your Railway service.
2. Under **Release Command**, type: `npm run db:migrate`
   *This ensures that every time you deploy anew, Railway updates the database schema before starting the live traffic.*

---

## Step 6: Generate Domain

By default, Railway doesn't expose your app to the public web.
1. Go to the **Settings** tab.
2. Under the **Public Networking** section, click **Generate Domain**.
3. Railway will give you a live URL (e.g., `your-app-production.up.railway.app`).

---

## Step 7: Verify the Deployment

1. Wait for the green **Active** status under the **Deployments** tab.
2. Click on the generated Public URL. You should see `Hello from Express!`
3. Your WebSocket server will be accessible at: `wss://<your-generated-domain>/ws`

Congratulations, your backend is fully deployed!
