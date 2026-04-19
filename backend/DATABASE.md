# PostgreSQL setup for Shaw’s Delivery

## Does the app create tables automatically?

**Yes.** When you run the Node server (`npm run dev` or `npm start` in the `backend` folder), it runs `server/db/init.js`, which executes `CREATE TABLE IF NOT EXISTS …` for `customers`, `riders`, and `orders`, then creates indexes and seeds the demo rider (`rider@shaw.com` / `rider123`) if that email is not already present.

You do **not** have to run SQL in pgAdmin first, as long as:

- PostgreSQL is running.
- Your `DATABASE_URL` in `backend/server/.env` points at a database you can access.
- The server user can create tables in that database (normal for a database you own).

**PostgreSQL version:** use **13 or newer** so `gen_random_uuid()` works in column defaults without extra extensions.

## Connection string

In `backend/server/.env`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/boknoy_db
PORT=5050
```

The API defaults to **port 5050** so it does not collide with other tools that often use **5000**. The Vite dev server proxies `/api` to `http://127.0.0.1:5050`, and `frontend/.env.development` sets `VITE_API_URL` to the same URL.

Create the empty database once (any tool you like), for example:

```bash
psql -U postgres -c "CREATE DATABASE boknoy_db;"
```

## Optional: create tables manually in pgAdmin

If you prefer to run DDL yourself (or to inspect/repair schema):

1. Open **pgAdmin** and connect to your server.
2. Select your database (e.g. `boknoy_db`).
3. **Tools → Query Tool**.
4. Open or paste the contents of `backend/server/schema.sql`.
5. Execute (**F5**).

The server will still run `CREATE TABLE IF NOT EXISTS` on startup; manual runs are safe and idempotent.

## API surface (used by the React app)

| Area | Base path |
|------|-----------|
| Customer register / login / profile | `/api/customers` |
| Rider register / login / profile | `/api/riders` |
| Orders (create, list, accept, complete, …) | `/api/orders` |
| Admin lists (customers, delivery rows) | `/api/admin` |

Passwords are stored with **bcrypt** hashes, not plain text.

## Frontend API URL

In **development**, the Vite dev server proxies `/api` to `http://localhost:5000` (see `frontend/vite.config.js`). The app then calls **`/api/...` on the same port as the UI** (e.g. `http://localhost:5173/api/...`), which avoids CORS issues and 404s from accidentally hitting the wrong host.

Optional: set `VITE_API_URL` only if you want the browser to talk **directly** to the API (e.g. `http://localhost:5000`). Do **not** set `VITE_API_URL=` to an empty value.

Restart `npm run dev` after changing env vars.

Quick API check: open `http://127.0.0.1:5050/api/health` (use your `PORT` if different). You should see `{"ok":true,"service":"shaws-delivery-api"}`. If you get HTML such as `Cannot GET /api/health`, another program is using that port or the wrong server is running.

## Admin “Riders” screen

The **Admin → Riders** module may still use the older browser `localStorage` demo list for its rich directory UI. **Rider accounts** created via **Rider sign up** and the seeded **demo rider** are stored in PostgreSQL and are used for login and deliveries. Aligning the admin riders grid fully with the database can be a follow-up task (extra columns / admin APIs).
