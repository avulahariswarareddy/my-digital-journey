# Avula Hariswara Reddy, portfolio

A static website with 17 pages. No server, no database, no API keys.
Vercel builds it automatically every time you push to GitHub.

## Deploy (GitHub to Vercel)

1. Create a new GitHub repository and upload everything in this folder.
   Make sure `.gitignore` goes up too. Windows hides files that start with a dot.
2. On vercel.com click **Add New > Project**, pick the repository and press **Deploy**.
   Don't change any settings. `vercel.json` already tells Vercel what to do
   (build command `node build.mjs`, output folder `public`). No environment variables needed.
3. Every push to `main` redeploys on its own.

The build fills in your real web address everywhere Google needs it
(sitemap, canonical links, share images). If you later add your own domain in Vercel,
the next deploy switches to it automatically. Preview deployments are hidden from Google.

## After the first deploy (for Google)

1. Go to search.google.com/search-console and add your site as a **URL prefix** property.
2. Choose **HTML file** verification. Download the file Google gives you
   (it looks like `google1234abcd.html`), put it in the `static` folder, push, then press Verify.
3. Open **Sitemaps** and submit `sitemap.xml`.
4. In Vercel, open your project and turn on **Analytics** and **Speed Insights** (one click each).
   Both are cookie-free, so no cookie banner is needed.

What helps you rank first for your name:
- Link to this site from the footer of all five of your live sites, your GitHub profile and your Instagram bio.
- A custom domain such as `avulahariswarareddy.com`.

## Short links you can send people

| Link | Opens |
| --- | --- |
| `/inquiry`, `/contact`, `/hire` | Enquiry page |
| `/whatsapp` | WhatsApp chat with you |
| `/vedasri`, `/udhaar`, `/hitex`, `/pg`, `/pg-app` | Each project's story |
| `/work`, `/portfolio` | All projects |
| `/marks`, `/olympiads`, `/certificates` | Academics |
| `/basketball`, `/gym`, `/running` | Sport |
| `/rha`, `/volunteer`, `/community` | Community and volunteering |
| `/achievements`, `/trophies`, `/awards` | The trophy shelf on the academics page |
| `/medal`, `/gurukul` | Sport, with the Gurukul Olympics medal |
| `/monsoon-run`, `/runs` | Both city runs (volunteer and participant) |
| `/systems` | The "website is only one piece" map |
| `/story` | About page |
| `/github`, `/instagram`, `/python-app` | Your profiles |
| `/links` | Link-in-bio page for Instagram |

Add or change short links in the `redirects` list in `vercel.json`.

## Editing

- Page text: `src/pages/` (one file per page, projects in `src/pages/projects/`)
- Sections shared by several pages: `src/blocks/` (change it once, every page updates)
- Navigation, footer, chat: `src/partials/`
- FAQ questions: `src/data/faq.json` (shows on the site and in Google)
- Chat assistant: `static/bot.js`. Projects live in `P` (one record each: problem, what was built, what was learned, stack, links), everything else in `K`. Add facts there; the matching engine below them does not need changes.
- The "website is only one piece" map: `src/blocks/systems.html`. Each part lists the projects that used it in `data-p` (`ved app site hitex udhaar`) and its explanation in `data-d`.
- Trophy shelf: `src/blocks/school.html`. Gurukul medal: `src/blocks/sports.html`. Runs: `src/blocks/service.html`.
- Colours and layout: `static/styles.css`
- Photos: `static/assets/`

Each page file starts with a `<!--page {...} -->` line holding its title and Google description.
Keep descriptions under 160 characters.

To check locally: `node build.mjs`, then open the `public` folder with any local server.

## Adding real reviews

Reviews stay hidden until `src/data/reviews.json` has entries. Only use real quotes, with permission:

```json
[
  { "quote": "Hariswara built our clinic website and patients book on WhatsApp now.", "name": "Dr. Bhaskar Reddy", "role": "Hitex Health Nest" }
]
```

## How the achievement photos were made

The trophies (`trophy-*.webp`) and the Gurukul medal (`gurukul-medal.webp`) are cut-outs from the original phone photos, made with a background-removal model. Only masking, cropping, levels and a mild white balance were applied. The medal was also un-tilted (it was photographed at an angle) and stood upright so its tab is at the top. Nothing on any object was redrawn. If you retake a photo, a plain background and even light give the cleanest cut-out.

## Adding photos later

These spots stay invisible until a file with the exact name exists in `static/assets/`.
`.webp`, `.jpg`, `.jpeg` or `.png` all work. Keep each photo under about 400 KB.

| File name | Where it shows |
| --- | --- |
| `expo-eco` | Edu Expos, Class 7 Eco-friendly Home |
| `expo-metro` | Edu Expos, Class 8 Hyderabad Metro |
| `expo-crypto` | Edu Expos, Class 9 Cryptocurrency |
| `run-finisher` | Pink Power Run, finisher certificate |
| `run-timing` | Pink Power Run, timing certificate |
| `temple` | Temple volunteering |
| `rha-drive-1`, `rha-drive-2`, `rha-drive-3` | Robin Hood Army photos |

## Keeping it safe

Nobody can change the site by visiting it. It only changes through your GitHub repository
or your Vercel account, so turn on two-factor login for both.
`vercel.json` adds strict security headers: only your own scripts can run, and other sites can't embed yours.
