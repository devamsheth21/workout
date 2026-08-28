# Free workout telemetry — Cloudflare Worker + D1 (~15 min, one time)

This gives your FORGE page a free, durable cloud log so the **📊 Progress** panel
can chart your lifts across devices and you can export the data to an AI coach.
Free tier is ~100k writes/day and 5 GB — you'll use a rounding error of it, and it
**never auto-bills** (the free plan hard-stops instead of charging).

Everything below runs on **your** machine (it needs your Cloudflare login).

## 1. One-time account + CLI
1. Make a free account at https://dash.cloudflare.com/sign-up
2. Install the CLI and log in:
   ```
   npm install -g wrangler
   wrangler login
   ```

## 2. Create the database
From this `workout-worker/` folder:
```
cd workout-worker
wrangler d1 create workout-log
```
Copy the `database_id` it prints and paste it into `wrangler.toml`
(replace `PASTE_DATABASE_ID_HERE`).

## 3. Create the table
```
wrangler d1 execute workout-log --remote --file=schema.sql
```

## 4. Set your secret (the shared password the page sends)
```
wrangler secret put SECRET
```
Type any passphrase when prompted — e.g. `forge-7fk29q`. Remember it for step 6.

## 5. Deploy
```
wrangler deploy
```
It prints a URL like `https://workout-log.<your-subdomain>.workers.dev`. Copy it.

## 6. Point the page at it
Open `Neptune-Gym-Workout-Plan.html`, find the `TELE` block near the top of the
`<script>`, and fill in both fields:
```js
var TELE = {
  url:    "https://workout-log.<your-subdomain>.workers.dev",
  secret: "forge-7fk29q"   // the exact passphrase from step 4
};
```
Then republish (from the repo root):
```
cp Neptune-Gym-Workout-Plan.html index.html && git add -A && git commit -m "connect telemetry" && git push
```

## Done
Tick an exercise off with a weight in its box → it's logged to the cloud (always
stored in kg internally, shown in your chosen lb/kg unit). Tap the **📊** button
(bottom-right) for your streak, body-weight/waist trend, and weight sparklines per
lift, plus **Copy for coach** to paste your progression into an AI for advice.

Weight-entry convention (also recorded with every set): **dumbbells = one bell
(per hand)**, **barbell = total bar + all plates**, **machine = the stack number**.
Each box shows a `/hand`, `total`, or `stack` tag so it's unambiguous.

### Notes
- The `secret` ships in the page's JS, so it deters casual junk writes but isn't
  real security — fine for a personal log. Don't store anything sensitive.
- Quick test without the page:
  ```
  curl -H "X-Token: forge-7fk29q" https://workout-log.<your-subdomain>.workers.dev
  ```
  should return `[]` (or your rows).
- Offline at the gym? Sets queue on the phone and auto-resend next time the page
  loads with signal.
