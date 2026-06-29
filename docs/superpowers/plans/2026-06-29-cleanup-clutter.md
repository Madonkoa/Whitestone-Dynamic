# Project Clutter Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove ~70+ dead/clutter files identified in FILE-AUDIT.md, reducing project size and improving maintainability while preserving all active application code.

**Architecture:** Execute deletions in order of maximum impact (largest folders/most redundancy first). **Each task includes THREE verification stages:** (1) Pre-deletion test (backend starts + endpoints tested), (2) File deletion, (3) Post-deletion test (backend still runs + endpoints still accessible). Only proceed after both verification stages pass. **NO git commits will be made during execution** — all deletions are staged for review.

**Tech Stack:** Whitestone Farm Manager (Node.js/Express backend + vanilla HTML/JS frontend)

## Global Constraints

- Do NOT delete any files in `backend/routes/` except `products.js` and `product-variants.js` (unmounted only)
- Do NOT delete `backend/app.js`, `backend/config/database.js`, `backend/database.db`, or any mounted backend routes
- Do NOT delete any `.html` files from root except `.backup`, `.broken`, `.old`, `.backup2` variants
- Do NOT delete active frontend JS in `public/js/` 
- Preserve `postman/Whitestone-API-Collection-Full.json` and `postman/Whitestone-API-Environment.json` (the active collection and environment)
- Backend must run cleanly on `http://localhost:5500` after cleanup
- **CRITICAL:** Do not stage or commit any deletions until user explicitly approves all verification tests
- Backend server will remain running during all verification steps

---

## Task 1: Delete BACKUP folder (~35 files instantly)

**Files:**
- Delete: `BACKUP_20260627_004012/` (entire directory)

**Interfaces:**
- Consumes: Nothing (isolated backup, zero dependencies)
- Produces: Disk space, cleaner project root

### ✓ PRE-DELETION VERIFICATION

- [ ] **Step 1: Confirm BACKUP folder is not referenced anywhere**

Run: `grep -r "BACKUP_20260627_004012" . --include="*.js" --include="*.json" --exclude-dir=BACKUP_20260627_004012 --exclude-dir=node_modules`
Expected: No matches (folder is truly isolated)

- [ ] **Step 2: Verify backend is running and responding**

If backend not already running, start it:
```powershell
cd backend
npm start
# Wait 2 seconds for startup
# You should see: "Server is running on port 5500"
```

Then test from another terminal:
```powershell
$response = curl -s http://localhost:5500/api/auth/login -X OPTIONS
Write-Host "Backend responding: $($response.StatusCode -ne $null ? 'YES' : 'NO')"
```
Expected: GET returns 200 or 401 (proves server is responding)

- [ ] **Step 3: Test a specific active route (employees)**

```powershell
curl -s http://localhost:5500/api/employees -H "Authorization: Bearer test"
```
Expected: Returns JSON response (even if error, proves route loads)

### ✓ DELETION

- [ ] **Step 4: Remove BACKUP folder**

PowerShell:
```powershell
Remove-Item -Recurse -Force "BACKUP_20260627_004012"
```

- [ ] **Step 5: Verify folder is deleted**

PowerShell:
```powershell
if (Test-Path "BACKUP_20260627_004012") { Write-Host "ERROR: Folder still exists" } else { Write-Host "OK: Folder deleted" }
```
Expected: "OK: Folder deleted"

### ✓ POST-DELETION VERIFICATION

- [ ] **Step 6: Verify backend still runs (no errors after folder deletion)**

Check the backend terminal — should show no new errors. If it crashed, see error message in terminal.
Expected: Backend still running, no new error messages

- [ ] **Step 7: Test same route again (confirm no interruption)**

```powershell
curl -s http://localhost:5500/api/employees -H "Authorization: Bearer test"
```
Expected: Same response as Step 3 (no difference)

**✓ TASK 1 COMPLETE.** Proceed to Task 2 only if all verification steps passed.

---

## Task 2: Delete root routes/ folder (14 dead route duplicates)

**Files:**
- Delete: `routes/auth.js`
- Delete: `routes/batches.js`
- Delete: `routes/chickens.js`
- Delete: `routes/coops.js`
- Delete: `routes/customers.js`
- Delete: `routes/eggs.js`
- Delete: `routes/employees.js`
- Delete: `routes/equipment.js`
- Delete: `routes/feed.js`
- Delete: `routes/pricing.js`
- Delete: `routes/sales.js`
- Delete: `routes/security.js`
- Delete: `routes/stock.js`
- Delete: `routes/stock.js.backup`

**Interfaces:**
- Consumes: Nothing (dead duplicates of `backend/routes/`)
- Produces: Cleaner root directory

### ✓ PRE-DELETION VERIFICATION

- [ ] **Step 1: Verify root routes/ is not imported by active code**

Run: `grep -r "require.*['\"]\.\/routes" . --include="*.js" --exclude-dir=node_modules --exclude-dir=BACKUP_20260627_004012 | grep -v "backend/"`
Expected: No matches outside backend folder (only backend/app.js loads routes)

- [ ] **Step 2: Verify backend still responding**

```powershell
curl -s http://localhost:5500/api/employees -H "Authorization: Bearer test"
```
Expected: Same response as Task 1, Step 7

### ✓ DELETION

- [ ] **Step 3: Remove routes/ folder**

PowerShell:
```powershell
Remove-Item -Recurse -Force "routes"
```

- [ ] **Step 4: Verify folder deleted**

PowerShell:
```powershell
if (Test-Path "routes") { Write-Host "ERROR: Folder still exists" } else { Write-Host "OK: routes/ deleted" }
```
Expected: "OK: routes/ deleted"

### ✓ POST-DELETION VERIFICATION

- [ ] **Step 5: Check backend terminal for errors**

Look at backend terminal—should show no crashes or new errors after deletion.
Expected: Backend still running normally

- [ ] **Step 6: Test auth endpoint (critical for routing)**

```powershell
curl -s http://localhost:5500/api/auth/login -X POST -H "Content-Type: application/json" -d '{"username":"test","password":"test"}'
```
Expected: Response (error is OK, proves route loads from backend/routes/auth.js, not root/routes/auth.js)

- [ ] **Step 7: Test another route (batches)**

```powershell
curl -s http://localhost:5500/api/batches -H "Authorization: Bearer test"
```
Expected: Response (proves batch route loads from backend/routes/, not root/routes/)

**✓ TASK 2 COMPLETE.** Proceed to Task 3 only if all verification steps passed.

---

## Baseline Verification: Test All 13 Active Endpoints

**BEFORE ANY DELETIONS**, test all mounted routes to establish baseline:

- [ ] **Step 1: Test all 13 endpoints with Bearer token**

Run this script to test all routes:
```powershell
$endpoints = @(
  "auth/login",
  "employees",
  "stock",
  "feed",
  "coops",
  "eggs",
  "sales",
  "chickens",
  "customers",
  "batches",
  "pricing",
  "security",
  "equipment"
)

Write-Host "=== BASELINE ENDPOINT TEST ===" 
foreach ($endpoint in $endpoints) {
  $response = curl -s "http://localhost:5500/api/$endpoint" -H "Authorization: Bearer test" 2>&1
  if ($response -match "error|Error" -or $response.Length -gt 0) {
    Write-Host "✓ $endpoint: RESPONDING"
  } else {
    Write-Host "✗ $endpoint: NO RESPONSE"
  }
}
Write-Host "=== END BASELINE TEST ==="
```

Expected: All 13 show "RESPONDING" (errors like "Invalid token" are OK—they prove the endpoint exists)

---

## Task 3: Delete root-level server duplicates

**Files:**
- Delete: `app.js` (root)
- Delete: `server.js` (root)
- Delete: `api.js` (root)
- Delete: `config/database.js` and `config/` folder
- Delete: `data/database.js`, `data/sales.json`, and `data/` folder
- Delete: `database.db` (root duplicate)
- Delete: `package-lock.json` (root)

**Interfaces:**
- Consumes: Nothing (root duplicates of backend server, never loaded)
- Produces: Cleaner root directory

### ✓ PRE-DELETION VERIFICATION

- [ ] **Step 1: Verify root app.js is not imported anywhere**

Run: `grep -r "require.*['\"]\.\/app\.js" . --include="*.js" --exclude-dir=node_modules --exclude-dir=BACKUP_20260627_004012`
Expected: Only shows `./server.js:require('./app.js');` but NOT from active code paths

- [ ] **Step 2: Verify backend/app.js imports from backend/routes/ only**

Run: `grep "require.*routes" backend/app.js`
Expected: Shows `require('./routes/auth')`, `require('./routes/employees')`, etc. (all from backend/)

- [ ] **Step 3: Test all 13 endpoints again (confirm baseline)**

Run the baseline test from Task Baseline step 1.
Expected: All 13 endpoints responding

### ✓ DELETION

- [ ] **Step 4: Remove root server files**

PowerShell:
```powershell
Remove-Item -Force "app.js", "server.js", "api.js", "database.db", "package-lock.json" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "config" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "data" -ErrorAction SilentlyContinue
Write-Host "Deleted: app.js, server.js, api.js, database.db, package-lock.json, config/, data/"
```

- [ ] **Step 5: Verify files are gone**

PowerShell:
```powershell
@("app.js", "server.js", "api.js", "database.db") | ForEach-Object {
  if (Test-Path $_) { Write-Host "ERROR: $_ still exists" } else { Write-Host "OK: $_ deleted" }
}
```
Expected: All show "OK"

### ✓ POST-DELETION VERIFICATION

- [ ] **Step 6: Check backend terminal (no errors)**

Verify backend terminal still shows no errors. Backend should still be running.
Expected: No crash, no new errors

- [ ] **Step 7: Test all 13 endpoints again**

Run the baseline test from Task Baseline step 1 (same script).
Expected: All 13 endpoints still responding (identical to Step 3 results)

**✓ TASK 3 COMPLETE.** Proceed to Task 4 only if all verification steps passed.

---

## Task 4: Delete abandoned React migration files

**Files:**
- Delete: `src/` (entire directory with all components)
- Delete: `AddProductModal.jsx` (root)
- Delete: `ConfirmModal.jsx` (root)
- Delete: `RecentStockMovements.jsx` (root)
- Delete: `StockAdjustmentModal.jsx` (root)
- Delete: `StockManagement.jsx` (root)
- Delete: `Modals.css` (root)

**Interfaces:**
- Consumes: Nothing (never wired up, not bundled, abandoned React attempt)
- Produces: Cleaner project, removes incomplete experiment

### ✓ PRE-DELETION VERIFICATION

- [ ] **Step 1: Verify src/ is not imported in any code**

Run: `grep -r "from.*['\"].*src/" . --include="*.js" --include="*.jsx" --include="*.html" --exclude-dir=node_modules --exclude-dir=BACKUP_20260627_004012`
Expected: No matches

- [ ] **Step 2: Verify root JSX files are not imported**

Run: `grep -r "['\"]\.\/.*Modal\|['\"]\.\/Stock" . --include="*.js" --include="*.html" --exclude-dir=node_modules --exclude-dir=BACKUP_20260627_004012`
Expected: No matches

- [ ] **Step 3: Test all 13 endpoints (confirm baseline)**

Run the baseline test script from Task Baseline.
Expected: All 13 endpoints responding

### ✓ DELETION

- [ ] **Step 4: Remove React files**

PowerShell:
```powershell
Remove-Item -Force "AddProductModal.jsx", "ConfirmModal.jsx", "RecentStockMovements.jsx", "StockAdjustmentModal.jsx", "StockManagement.jsx", "Modals.css" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "src" -ErrorAction SilentlyContinue
Write-Host "Deleted: React migration files (src/, JSX files, Modals.css)"
```

- [ ] **Step 5: Verify deletion**

PowerShell:
```powershell
if (Test-Path "src") { Write-Host "ERROR: src/ still exists" } else { Write-Host "OK: src/ deleted" }
@("AddProductModal.jsx", "ConfirmModal.jsx", "Modals.css") | ForEach-Object {
  if (Test-Path $_) { Write-Host "ERROR: $_ still exists" } else { Write-Host "OK: $_ deleted" }
}
```
Expected: All show "OK"

### ✓ POST-DELETION VERIFICATION

- [ ] **Step 6: Check backend (no errors)**

Backend should still run. Check terminal for errors.
Expected: No crash, no new errors

- [ ] **Step 7: Test all 13 endpoints again**

Run the baseline test script.
Expected: All 13 endpoints responding (identical to pre-deletion)

**✓ TASK 4 COMPLETE.** Proceed to Task 5 only if all verification steps passed.

---

## Task 5: Delete stale HTML backup and misplaced variants

**Files:**
- Delete: `stock.html.backup`
- Delete: `stock.html.backup2`
- Delete: `stock.html.broken`
- Delete: `stock.html.old`
- Delete: `index.html.stock-backup`
- Delete: `test-css.html`
- Delete: `backend/batches.html`
- Delete: `backend/stock-new.html`
- Delete: `public/dashboard.html`
- Delete: `public/sales.html`

**Interfaces:**
- Consumes: Nothing (superseded by active .html files)
- Produces: Cleaner filesystem, no broken references

### ✓ PRE-DELETION VERIFICATION

- [ ] **Step 1: Verify active HTML files exist at root**

Run: `ls *.html | grep -E "dashboard|batches|sales|stock|index"`
Expected: See all 5 files (dashboard.html, batches.html, sales.html, stock.html, index.html)

- [ ] **Step 2: Verify backup files are not loaded by any page**

Run: `grep -r "stock\.html\.backup\|stock\.html\.broken" . --include="*.js" --include="*.html" --exclude-dir=node_modules`
Expected: No matches (they're dead files, not referenced)

- [ ] **Step 3: Test all 13 endpoints**

Run baseline test.
Expected: All responding

### ✓ DELETION

- [ ] **Step 4: Remove stale HTML files**

PowerShell:
```powershell
Remove-Item -Force "stock.html.backup", "stock.html.backup2", "stock.html.broken", "stock.html.old", "index.html.stock-backup", "test-css.html" -ErrorAction SilentlyContinue
Remove-Item -Force "backend/batches.html", "backend/stock-new.html" -ErrorAction SilentlyContinue
Remove-Item -Force "public/dashboard.html", "public/sales.html" -ErrorAction SilentlyContinue
Write-Host "Deleted: Stale HTML files"
```

- [ ] **Step 5: Verify deletion**

PowerShell:
```powershell
@("stock.html.backup", "stock.html.backup2", "stock.html.broken", "test-css.html") | ForEach-Object {
  if (Test-Path $_) { Write-Host "ERROR: $_ still exists" } else { Write-Host "OK: $_ deleted" }
}
```
Expected: All show "OK"

### ✓ POST-DELETION VERIFICATION

- [ ] **Step 6: Check backend (no errors)**

Backend should still run.
Expected: No crash

- [ ] **Step 7: Test all 13 endpoints**

Run baseline test.
Expected: All responding (identical to pre-deletion)

**✓ TASK 5 COMPLETE.** Proceed to Task 6 only if all verification steps passed.

---

## Task 6: Delete unmounted backend routes

**Files:**
- Delete: `backend/routes/products.js`
- Delete: `backend/routes/product-variants.js`

**Interfaces:**
- Consumes: Nothing (never registered in app.js, dead code)
- Produces: Cleaner routes directory with only active endpoints

### ✓ PRE-DELETION VERIFICATION

- [ ] **Step 1: Verify routes are not mounted in backend/app.js**

Run: `grep -E "products|product-variants" backend/app.js`
Expected: No matches

- [ ] **Step 2: Verify they are not imported anywhere else**

Run: `grep -r "products\|product-variants" backend/ --include="*.js" | grep -v "products\.js\|product-variants\.js"`
Expected: No matches

- [ ] **Step 3: Test all 13 endpoints**

Run baseline test.
Expected: All responding

### ✓ DELETION

- [ ] **Step 4: Remove unmounted route files**

PowerShell:
```powershell
Remove-Item -Force "backend/routes/products.js", "backend/routes/product-variants.js" -ErrorAction SilentlyContinue
Write-Host "Deleted: unmounted routes (products.js, product-variants.js)"
```

- [ ] **Step 5: Verify deletion**

PowerShell:
```powershell
@("backend/routes/products.js", "backend/routes/product-variants.js") | ForEach-Object {
  if (Test-Path $_) { Write-Host "ERROR: $_ still exists" } else { Write-Host "OK: $_ deleted" }
}
```
Expected: All show "OK"

### ✓ POST-DELETION VERIFICATION

- [ ] **Step 6: Check backend (no errors)**

Backend should run.
Expected: No crash

- [ ] **Step 7: Test all 13 endpoints**

Run baseline test.
Expected: All responding

**✓ TASK 6 COMPLETE.** Proceed to Task 7 only if all verification steps passed.

---

## Task 7: Delete migration and utility scripts

**Files:**
- Delete: `add-batches.js`, `add-batches.sql`, `add-sample-movements.js`
- Delete: `backend/add-batches.js`, `backend/add-movements.sql`, `backend/add-stock-movements.js`
- Delete: `backend/create-tables.js`, `backend/fix-tables.js`, `backend/setup-stock-movements.js`
- Delete: `backend/index.js` (entry point duplicate)
- Delete: `backend/server.js` — **CAUTION: Verify it's just a wrapper, not critical**
- Delete: `check_databases.js`, `currency.js`, `setup-backend.ps1`

**Interfaces:**
- Consumes: Nothing (one-off setup scripts, run once and never again)
- Produces: Cleaner directory, removes setup clutter

### ✓ PRE-DELETION VERIFICATION

- [ ] **Step 1: Verify backend/server.js is just a wrapper (critical!)**

Run: `cat backend/server.js`
Expected: Shows only `require('./app.js');` (NOT business logic)

- [ ] **Step 2: Verify none of these are imported by active code**

Run: `grep -r "require.*add-batches\|require.*create-tables\|require.*check_databases" backend/app.js --include="*.js"`
Expected: No matches

- [ ] **Step 3: Test all 13 endpoints**

Run baseline test.
Expected: All responding

### ✓ DELETION

- [ ] **Step 4: Remove utility scripts (careful with backend/server.js)**

PowerShell:
```powershell
# Root-level scripts
Remove-Item -Force "add-batches.js", "add-batches.sql", "add-sample-movements.js", "check_databases.js", "currency.js", "setup-backend.ps1" -ErrorAction SilentlyContinue

# Backend scripts (backend/server.js is just a wrapper, safe to delete)
Remove-Item -Force "backend/add-batches.js", "backend/add-movements.sql", "backend/add-stock-movements.js", "backend/create-tables.js", "backend/fix-tables.js", "backend/setup-stock-movements.js", "backend/index.js", "backend/server.js" -ErrorAction SilentlyContinue

Write-Host "Deleted: Migration and utility scripts"
```

- [ ] **Step 5: Verify deletion**

PowerShell:
```powershell
@("add-batches.js", "check_databases.js", "currency.js", "backend/server.js") | ForEach-Object {
  if (Test-Path $_) { Write-Host "ERROR: $_ still exists" } else { Write-Host "OK: $_ deleted" }
}
```
Expected: All show "OK"

### ✓ POST-DELETION VERIFICATION

- [ ] **Step 6: Check backend still runs**

Backend must still be running (no crash).
Expected: Still running, no errors

- [ ] **Step 7: Test all 13 endpoints**

Run baseline test.
Expected: All responding (identical to pre-deletion)

**⚠️ CRITICAL:** Ensure backend is still responding before proceeding.

**✓ TASK 7 COMPLETE.** Proceed to Task 8 only if all verification steps passed.

---

## Task 8: Delete old API layer and test data

**Files:**
- Delete: `backend/api/auth.js`
- Delete: `backend/api/sales.js`
- Delete: `backend/api/` (entire folder)
- Delete: `backend/data/sales.json`
- Delete: `backend/data/` (entire folder)

**Interfaces:**
- Consumes: Nothing (superseded by `backend/routes/`)
- Produces: Cleaner backend directory

### ✓ PRE-DELETION VERIFICATION

- [ ] **Step 1: Verify backend/api/ is not imported**

Run: `grep -r "backend/api\|require.*api/" backend/ --include="*.js" | grep -v "api\.js$"`
Expected: No matches

- [ ] **Step 2: Verify backend/data/ is not imported**

Run: `grep -r "backend/data\|require.*data/" backend/ --include="*.js"`
Expected: No matches

- [ ] **Step 3: Test all 13 endpoints**

Run baseline test.
Expected: All responding

### ✓ DELETION

- [ ] **Step 4: Remove old API and data folders**

PowerShell:
```powershell
Remove-Item -Recurse -Force "backend/api" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "backend/data" -ErrorAction SilentlyContinue
Write-Host "Deleted: backend/api/, backend/data/"
```

- [ ] **Step 5: Verify deletion**

PowerShell:
```powershell
@("backend/api", "backend/data") | ForEach-Object {
  if (Test-Path $_) { Write-Host "ERROR: $_ still exists" } else { Write-Host "OK: $_ deleted" }
}
```
Expected: All show "OK"

### ✓ POST-DELETION VERIFICATION

- [ ] **Step 6: Check backend (no errors)**

Backend should run.
Expected: No crash

- [ ] **Step 7: Test all 13 endpoints**

Run baseline test.
Expected: All responding

**✓ TASK 8 COMPLETE.** Proceed to Task 9 only if all verification steps passed.

---

## Task 9: Delete stale Postman and orphaned JS

**Files:**
- Delete: `postman/Whitestone-API-Collection.json` (old, superseded by Full)
- Delete: `postman/Whitestone-API-Environment-Production.json` (stale env)
- Delete: `js/sales.js` (orphaned, all active scripts in public/js/)

**Interfaces:**
- Consumes: Nothing (superseded or orphaned files)
- Produces: Cleaner postman/ directory, verified Full collection active

### ✓ PRE-DELETION VERIFICATION

- [ ] **Step 1: Verify Full Postman collection exists**

Run: `ls postman/`
Expected: See `Whitestone-API-Collection-Full.json` present

- [ ] **Step 2: Verify sales.js is not imported**

Run: `grep -r "['\"].*js/sales\|['\"]\.\/js\/sales" . --include="*.html" --exclude-dir=node_modules`
Expected: No matches

- [ ] **Step 3: Test all 13 endpoints**

Run baseline test.
Expected: All responding

### ✓ DELETION

- [ ] **Step 4: Remove stale Postman and JS files**

PowerShell:
```powershell
Remove-Item -Force "postman/Whitestone-API-Collection.json", "postman/Whitestone-API-Environment-Production.json" -ErrorAction SilentlyContinue
Remove-Item -Force "js/sales.js" -ErrorAction SilentlyContinue
Write-Host "Deleted: Stale Postman collections and orphaned JS"
```

- [ ] **Step 5: Verify deletion**

PowerShell:
```powershell
@("postman/Whitestone-API-Collection.json", "js/sales.js") | ForEach-Object {
  if (Test-Path $_) { Write-Host "ERROR: $_ still exists" } else { Write-Host "OK: $_ deleted" }
}
```
Expected: All show "OK"

### ✓ POST-DELETION VERIFICATION

- [ ] **Step 6: Check backend (no errors)**

Backend should run.
Expected: No crash

- [ ] **Step 7: Test all 13 endpoints**

Run baseline test.
Expected: All responding

**✓ TASK 9 COMPLETE.** Proceed to final verification (Task 10) only if all steps passed.

---

## Task 10: Comprehensive final verification

**Files:**
- Test: All active backend routes still registered
- Test: Backend server runs on port 5500
- Test: Git history clean (no conflicts)
- Test: Active HTML pages still accessible

**Interfaces:**
- Consumes: Results of all 9 prior deletions
- Produces: Confirmation that application is fully functional

- [ ] **Step 1: Check git status for cleanliness**

Run: `git status`
Expected: "working tree clean" or only shows deleted files in staging

- [ ] **Step 2: Verify all active backend routes are still in place**

Run: `ls backend/routes/`
Expected: Lists all 13 active routes (auth, employees, stock, feed, coops, eggs, sales, chickens, customers, batches, pricing, security, equipment). Should NOT show products.js or product-variants.js.

- [ ] **Step 3: Verify backend/app.js is untouched**

Run: `head -20 backend/app.js`
Expected: Shows "const app = express()" and core setup code

- [ ] **Step 4: Verify all active HTML pages exist**

Run: `ls *.html | sort`
Expected: Shows all 17 active pages (index, login, register, reset-password, dashboard, employees, batches, chickens, coops, customers, eggs, equipment, feed, pricing, sales, security, stock)

- [ ] **Step 5: Start backend and verify it runs**

PowerShell (from project root):
```powershell
cd backend
npm start
# Wait 2-3 seconds
# Check if terminal shows "Server is running on port 5500"
```
Expected: "Server is running on port 5500" or similar message (no errors)

- [ ] **Step 6: Test one active API route (from new PowerShell window)**

PowerShell (new terminal):
```powershell
$response = Invoke-RestMethod -Uri "http://localhost:5500/api/employees" -Headers @{"Authorization"="Bearer test"} -ErrorAction SilentlyContinue
Write-Host "Response status: $($response | Get-Member | Select-Object -First 1)"
```
Expected: Returns JSON response (even if empty or 401 auth error — proves route exists)

- [ ] **Step 7: Stop backend server**

Press `Ctrl+C` in the backend terminal
Expected: Server stops cleanly

- [ ] **Step 8: View final git log and summary**

Run: `git log --oneline | head -10`
Expected: Shows cleanup commits from tasks 1-9

- [ ] **Step 9: Show project stats**

PowerShell:
```powershell
Write-Host "=== PROJECT CLEANUP COMPLETE ==="
Write-Host ""
Write-Host "Remaining files (root):"
(Get-ChildItem -File | Measure-Object).Count | Write-Host
Write-Host ""
Write-Host "Remaining directories (root):"
(Get-ChildItem -Directory | Measure-Object).Count | Write-Host
Write-Host ""
git log --oneline --all | wc -l
```
Expected: Significantly fewer files/folders than before cleanup

- [ ] **Step 10: Confirm all deletions complete**

All 9 tasks done? All 13 endpoints responding after each deletion?

If YES to all: **✓ ALL CLEANUP COMPLETE — NO COMMITS MADE**

Files are deleted locally but not committed to git. Review the changes and commit when ready.

---

## Plan Summary

| Task | Category | Files | Pre/Post Test |
|------|----------|-------|---|
| 1. BACKUP folder | Backup | ~35 | ✓ Both |
| 2. Root routes/ | Dead routes | 14 | ✓ Both |
| 3. Root server | Server dups | 10 | ✓ Both |
| 4. React migration | Abandoned | 12 | ✓ Both |
| 5. HTML backups | Stale files | 10 | ✓ Both |
| 6. Unmounted routes | Dead routes | 2 | ✓ Both |
| 7. Migration scripts | Utils | 14 | ✓ Both |
| 8. Old API layer | Old pattern | 5 | ✓ Both |
| 9. Stale Postman | Old tooling | 4 | ✓ Both |
| 10. Final verification | Quality gate | — | ✓ Check |

**Total: ~100+ files removed. All 13 endpoints tested before and after each task. NO COMMITS until full user approval.**

---

## Summary

This plan removes **~70+ files** across 10 tasks:

| Task | Files Deleted | Impact |
|------|---------------|--------|
| 1. BACKUP folder | ~35 | Major |
| 2. Root routes/ | 14 | Major |
| 3. Root server duplicates | 10 | Major |
| 4. React migration (src/ + JSX) | 12 | Major |
| 5. Stale HTML backups | 10 | Minor |
| 6. Unmounted routes | 2 | Minor |
| 7. Migration scripts | 14 | Minor |
| 8. Old API layer | 5 | Minor |
| 9. Stale Postman/JS | 4 | Minor |
| 10. Verification | — | Validation |
| **TOTAL** | **~106** | **Clean project** |

Each task is independently committed, allowing for easy rollback if needed. Final verification ensures the backend still runs and all active routes are functional.
