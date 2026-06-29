# Whitestone Farm Manager — File Structure Audit
_Generated: 2026-06-29_

---

## Active Server

The real application lives in **`backend/`**, started via `backend/app.js` on port `5500`.

### Active Backend Routes (`backend/routes/`)

All 13 routes below are mounted and in use:

| Route File | API Prefix |
|---|---|
| `backend/routes/auth.js` | `/api/auth` |
| `backend/routes/employees.js` | `/api/employees` |
| `backend/routes/stock.js` | `/api/stock` |
| `backend/routes/feed.js` | `/api/feed` |
| `backend/routes/coops.js` | `/api/coops` |
| `backend/routes/eggs.js` | `/api/eggs` |
| `backend/routes/sales.js` | `/api/sales` |
| `backend/routes/chickens.js` | `/api/chickens` |
| `backend/routes/customers.js` | `/api/customers` |
| `backend/routes/batches.js` | `/api/batches` |
| `backend/routes/pricing.js` | `/api/pricing` |
| `backend/routes/security.js` | `/api/security` |
| `backend/routes/equipment.js` | `/api/equipment` |

### Active Backend Infrastructure

| File | Purpose |
|---|---|
| `backend/app.js` | Main server entry point |
| `backend/config/database.js` | SQLite database connection |
| `backend/middleware/auth.js` | JWT auth middleware |
| `backend/swagger-config.js` | Swagger/OpenAPI config |
| `backend/database.db` | Live database |
| `backend/package.json` | Backend dependencies |
| `backend/.env` | Backend environment variables |

---

## Active Frontend

### HTML Pages (root level)

| File | Page |
|---|---|
| `index.html` | App entry / landing |
| `login.html` | Login |
| `register.html` | Register |
| `reset-password.html` | Password reset |
| `dashboard.html` | Dashboard |
| `employees.html` | Employees |
| `batches.html` | Batches |
| `chickens.html` | Chickens |
| `coops.html` | Coops |
| `customers.html` | Customers |
| `eggs.html` | Eggs |
| `equipment.html` | Equipment |
| `feed.html` | Feed |
| `pricing.html` | Pricing |
| `sales.html` | Sales |
| `security.html` | Security |
| `stock.html` | Stock |

### Frontend Scripts & Styles

| File | Purpose |
|---|---|
| `public/js/*.js` | All page-specific JS modules (15 files) |
| `css/style.css` | Main stylesheet |
| `public/css/style.css` | Public stylesheet |

### API / Tooling

| File | Purpose |
|---|---|
| `postman/Whitestone-API-Collection-Full.json` | Full API test collection |
| `postman/Whitestone-API-Environment.json` | Postman environment |
| `.env` | Root environment variables |
| `.gitignore` | Git ignore rules |

---

## Clutter — Safe to Delete

### Backup Folder (entire directory)

| Path | Reason |
|---|---|
| `BACKUP_20260627_004012/` | Full project snapshot from 2026-06-27. Completely superseded by git history. |

### Root-Level Duplicate Server Files

These duplicate the real backend but are **not the active server**:

| File | Reason |
|---|---|
| `app.js` | Root-level copy of backend server — not used |
| `server.js` | Another root-level server entry point — not used |
| `api.js` | Old API client/utility — superseded |
| `config/database.js` | Duplicate of `backend/config/database.js` |
| `data/database.js` | Another database config duplicate |
| `database.db` | Duplicate database — real one is `backend/database.db` |
| `package-lock.json` (root) | Lock file for the unused root `package.json` |

### Root-Level Duplicate `routes/` Folder

The entire `routes/` folder at the **project root** is dead. The active server only loads from `backend/routes/`. These are old copies:

| File |
|---|
| `routes/auth.js` |
| `routes/batches.js` |
| `routes/chickens.js` |
| `routes/coops.js` |
| `routes/customers.js` |
| `routes/eggs.js` |
| `routes/employees.js` |
| `routes/equipment.js` |
| `routes/feed.js` |
| `routes/pricing.js` |
| `routes/sales.js` |
| `routes/security.js` |
| `routes/stock.js` |
| `routes/stock.js.backup` |

### Backup & Broken HTML Files

| File | Reason |
|---|---|
| `stock.html.backup` | Old backup |
| `stock.html.backup2` | Old backup |
| `stock.html.broken` | Broken/abandoned version |
| `stock.html.old` | Old version |
| `index.html.stock-backup` | Old index backup |
| `test-css.html` | Throwaway test file |

### HTML Files Misplaced in Backend Folder

| File | Reason |
|---|---|
| `backend/batches.html` | HTML has no business being in the backend folder |
| `backend/stock-new.html` | Abandoned test page |

### Abandoned React Migration (`src/` and root JSX files)

It looks like a React rewrite was started for the stock module but never wired up. None of these files are imported or bundled:

| File |
|---|
| `src/components/AddProductModal.jsx` |
| `src/components/ConfirmModal.jsx` |
| `src/components/Modals.css` |
| `src/components/RecentStockMovements.jsx` |
| `src/components/StockAdjustmentModal.jsx` |
| `src/components/StockManagement.jsx` |
| `src/services/api.js` |
| `src/services/mockStockData.js` |
| `src/store/index.js` |
| `src/store/stockSlice.js` |
| `AddProductModal.jsx` (root) | Duplicate of src/ version |
| `ConfirmModal.jsx` (root) | Duplicate of src/ version |
| `Modals.css` (root) | Duplicate of src/ version |
| `RecentStockMovements.jsx` (root) | Duplicate of src/ version |
| `StockAdjustmentModal.jsx` (root) | Duplicate of src/ version |
| `StockManagement.jsx` (root) | Duplicate of src/ version |

### Unmounted Backend Routes

These files exist in `backend/routes/` but are **not registered** in `backend/app.js`:

| File | Reason |
|---|---|
| `backend/routes/products.js` | Never mounted — may be unfinished |
| `backend/routes/product-variants.js` | Never mounted — may be unfinished |

### One-Off Migration & Utility Scripts

These were likely run once during setup and are now dead weight:

| File |
|---|
| `add-batches.js` |
| `add-batches.sql` |
| `add-sample-movements.js` |
| `backend/add-batches.js` |
| `backend/add-movements.sql` |
| `backend/add-stock-movements.js` |
| `backend/create-tables.js` |
| `backend/fix-tables.js` |
| `backend/setup-stock-movements.js` |
| `backend/index.js` |
| `backend/server.js` |
| `check_databases.js` |
| `currency.js` |
| `setup-backend.ps1` |

### Abandoned API Layer

| File | Reason |
|---|---|
| `backend/api/auth.js` | Old API layer — app uses `routes/`, not `api/` |
| `backend/api/sales.js` | Same — old, unused |
| `backend/data/sales.json` | Seeding/test data, not in use |

### Duplicate / Stale Postman Collection

| File | Reason |
|---|---|
| `postman/Whitestone-API-Collection.json` | Superseded by `Whitestone-API-Collection-Full.json` |
| `postman/Whitestone-API-Environment-Production.json` | Check if this differs meaningfully from the active one |

### Stale Frontend JS

| File | Reason |
|---|---|
| `js/sales.js` | Single file in `js/` folder — all other scripts live in `public/js/`. Likely a leftover. |
| `public/dashboard.html` | HTML in `public/` — real dashboard is `dashboard.html` at root |
| `public/sales.html` | HTML in `public/` — real sales page is `sales.html` at root |

---

## Summary

| Category | Count |
|---|---|
| Active backend route files | 13 |
| Active frontend HTML pages | 17 |
| Active frontend JS modules | 15 |
| **Clutter files / folders to delete** | **~70+** |

The biggest wins by cleanup effort:
1. Delete `BACKUP_20260627_004012/` — single folder, removes ~35 files instantly
2. Delete root `routes/` folder — 14 dead route duplicates
3. Delete root `app.js`, `server.js`, `api.js`, `config/`, `data/`, `database.db` — dead root server layer
4. Delete `src/` + 6 root-level `.jsx`/`.css` files — abandoned React attempt
5. Delete `.html.backup`, `.broken`, `.old`, `.backup2` files — 5 stale HTML variants
