# How to submit (GitHub + optional live demo)

## Is the project ready?

Yes — if `npm run build` succeeds locally, you are good to submit the **code repository**.

For reviewers to **use the live UI** on GitHub Pages, they still need a running API (see below).

## Step 1 — Create a GitHub repository

1. Go to [https://github.com/new](https://github.com/new)
2. Name it e.g. `task-platform-api` (remember the name — it becomes part of the Pages URL)
3. **Do not** add a README (you already have one)
4. Create the repository

## Step 2 — Push this project

In PowerShell, from the project folder:

```powershell
cd c:\Users\Ruchika\Downloads\malvika\p5
git init
git add .
git commit -m "Backend intern assignment: auth, RBAC, task CRUD, React UI"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME`.

## Step 3 — Enable GitHub Pages

1. Repo → **Settings** → **Pages**
2. **Build and deployment** → Source: **GitHub Actions**
3. After the workflow runs, your site will be at:

   `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

## Step 4 — What to put in the Google Form

| Field | Value |
|-------|--------|
| GitHub repo | `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME` |
| Live UI (optional) | `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/` |
| API docs | Run locally: `http://localhost:4000/api/docs` |
| Postman | `docs/postman/Task-Platform.postman_collection.json` |

**Note:** GitHub Pages only hosts the **React frontend**. The **Express API + database** must be run locally (`npm run dev`) or deployed separately (Render, Railway, Fly.io).

### Optional: live API for Pages demo

1. Deploy `apps/api` to [Render](https://render.com) (free Web Service)
2. In GitHub repo → **Settings** → **Secrets and variables** → **Actions** → **Variables**
3. Add variable `API_URL` = `https://your-api.onrender.com/api/v1`
4. Re-run the Pages workflow

## Local demo (recommended in form notes)

```powershell
npm install
copy apps\api\.env.example apps\api\.env
copy apps\web\.env.example apps\web\.env
$env:DATABASE_URL="file:./apps/api/prisma/dev.db"
npm run prisma:push:sqlite --workspace @p5/api
npm run dev
```

- Frontend: http://localhost:5173  
- Swagger: http://localhost:4000/api/docs  
- Admin: `admin@taskplatform.dev` / `Admin@12345!`
