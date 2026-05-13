# Attention Heatmap

A classroom tool for visualising where students look first on an image — poster, artwork, advertisement, or any design.

**Teacher** uploads an image and shares a link. **Students** visit on their own devices, tap where their eye goes (1st, 2nd, 3rd), and optionally add a reason. The teacher sees responses accumulate live and can switch between dot, heatmap, and average-zone views.

---

## Pages

| URL | Who uses it |
|-----|-------------|
| `/teacher.html` | Teacher — upload image, view results, export CSV |
| `/student.html` | Students — tap attention points, submit |

---

## Deploy to Cloudflare Pages

### 1. Install Wrangler

```bash
npm install
```

### 2. Create a KV namespace

```bash
npx wrangler kv namespace create HEATMAP_KV
# Also create a preview namespace for local dev:
npx wrangler kv namespace create HEATMAP_KV --preview
```

Copy the `id` values printed and paste them into `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "HEATMAP_KV"
id = "paste-production-id-here"
preview_id = "paste-preview-id-here"
```

### 3. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create attention-heatmap --public --source=. --push
```

### 4. Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard → Pages](https://dash.cloudflare.com) → **Create a project**
2. Connect your GitHub repo
3. Set **build output directory** to `public`
4. Leave build command blank (no build step needed)
5. Under **Settings → Functions → KV namespace bindings**, add:
   - Variable name: `HEATMAP_KV`
   - KV namespace: select the one you created above
6. Deploy

### 5. Local development

```bash
npm run dev
```

Then open `http://localhost:8788/teacher.html` and `http://localhost:8788/student.html`.

---

## How it works

- Image is stored in Cloudflare KV as a base64 data URL
- Each student submission is a separate KV key (`session:{id}`)
- Teacher page polls `/api/sessions` every 3 seconds for live updates
- Student page polls `/api/image` every 5 seconds until a session is active
- Uploading a new image automatically clears all previous responses

## Views (teacher page)

| View | What it shows |
|------|--------------|
| All | Every click from every student, colour-coded by order |
| 1st / 2nd / 3rd | Filtered to a single attention order |
| Heatmap | Soft radial density blobs per click order |
| Avg Zone | Centroid of all clicks per order |
| Discussion | Fullscreen projection mode — hides all controls |
