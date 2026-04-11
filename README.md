# Toy Mafia Inventory — Next.js + Neon

Inventory management system converted from PHP/MySQL to Next.js + PostgreSQL (Neon), ready for Vercel deployment.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React, CSS Modules
- **Backend**: Next.js API Routes
- **Database**: Neon (PostgreSQL serverless)
- **Deployment**: Vercel

---

## 1. Set Up Neon Database

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project (e.g. `toymafia`)
3. In the Neon dashboard, open the **SQL Editor**
4. Paste and run the contents of `schema.sql` to create the `tbl_items` table
5. Go to **Connection Details** and copy the **Connection string**

---

## 2. Local Development

```bash
# Install dependencies
npm install

# Create your local env file
cp .env.local.example .env.local
# Edit .env.local and paste your Neon connection string as DATABASE_URL

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 3. Deploy to Vercel

```bash
# Install Vercel CLI (if not already)
npm i -g vercel

# Deploy
vercel
```

When prompted, **add the environment variable**:
- `DATABASE_URL` → paste your Neon connection string

Or set it manually in **Vercel Dashboard → Project → Settings → Environment Variables**.

---

## Project Structure

```
toymafia/
├── app/
│   ├── api/
│   │   └── items/
│   │       ├── route.js          # GET all, POST new
│   │       └── [id]/route.js     # PUT edit, DELETE
│   ├── components/
│   │   ├── ItemModal.js          # Add/Edit modal
│   │   ├── DeleteModal.js        # Delete confirmation
│   │   └── Modal.module.css
│   ├── lib/
│   │   └── db.js                 # Neon DB connection
│   ├── globals.css
│   ├── layout.js
│   ├── page.js                   # Main inventory page
│   └── page.module.css
├── schema.sql                    # Run this in Neon SQL Editor
├── .env.local.example
└── package.json
```

## API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/items` | Fetch items (supports `search`, `order_column`, `order_dir`, `start`, `length`) |
| POST | `/api/items` | Create a new item |
| PUT | `/api/items/:id` | Update an item |
| DELETE | `/api/items/:id` | Delete an item |
