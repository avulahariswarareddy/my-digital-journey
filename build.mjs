// Builds the site into /public. Vercel runs this automatically on every push.
// No packages needed. Local test:  node build.mjs  then serve the /public folder.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, 'public');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Your live address. Vercel provides it; SITE_URL overrides it if you ever need to.
const host = (process.env.SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || '').replace(/^https?:\/\//, '').replace(/\/+$/, '');
const SITE = host ? `https://${host}` : 'http://localhost:8765';
const PROD = !process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'production';
const ON_VERCEL = !!process.env.VERCEL;
const TODAY = new Date().toISOString().slice(0, 10);

const NAME = 'Avula Hariswara Reddy';
const ALT_NAMES = ['Hariswara Reddy', 'Harishwar Reddy', 'Hariswar Reddy', 'Hariswara Reddy Avula', 'Harishwar Reddy Avula', 'A Harishwar Reddy', 'Avula Harishwar Reddy'];
const PERSON = {
  '@type': 'Person', '@id': `${SITE}/#person`, name: NAME, alternateName: ALT_NAMES,
  url: `${SITE}/`, image: `${SITE}/assets/me-photo.webp`,
  description: 'Class 12 student from Hyderabad who learns by building tools for real businesses, and is heading into an undergraduate degree in AI and machine learning.',
  jobTitle: 'Student', email: 'mailto:avulahariswarareddy@gmail.com',
  address: { '@type': 'PostalAddress', addressLocality: 'Hyderabad', addressRegion: 'Telangana', addressCountry: 'IN' },
  affiliation: { '@type': 'EducationalOrganization', name: 'Resonance Global Campus, Hyderabad' },
  alumniOf: [
    { '@type': 'EducationalOrganization', name: 'Bhashyam Blooms School, Maheswaram' },
    { '@type': 'EducationalOrganization', name: 'Jain Heritage Cambridge School, Kondapur' }
  ],
  memberOf: [{ '@type': 'Organization', name: 'Robin Hood Army' }, { '@type': 'Organization', name: 'The Knowledge Society' }],
  knowsAbout: ['Artificial intelligence', 'Machine learning', 'Web development', 'Next.js', 'React', 'TypeScript', 'Supabase', 'Python', 'OCR', 'Robotics', 'Arduino'],
  sameAs: ['https://github.com/avulahariswarareddy', 'https://www.instagram.com/harishwar_reddy_avula/', 'https://my-portfoliogit-s24yeckj6yxcos4ve6ymyf.streamlit.app/']
};
const WEBSITE = { '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: NAME, alternateName: ALT_NAMES, inLanguage: 'en-IN', publisher: { '@id': `${SITE}/#person` } };

// ---------- helpers ----------
const include = (html, depth = 0) => html.replace(/<!--\s*include:([\w./-]+)\s*-->/g, (_, f) => {
  if (depth > 6) throw new Error('include loop at ' + f);
  return include(read('src/' + f), depth + 1);
});
const faq = JSON.parse(read('src/data/faq.json'));
const reviews = JSON.parse(read('src/data/reviews.json')).filter((r) => r && r.quote && r.name);

const faqHtml = (items) => `<div class="faq-list">${items.map((q) => `
  <details><summary>${esc(q.q)}</summary><div class="faq-a">${q.a}</div></details>`).join('')}
</div>`;
const reviewsHtml = () => !reviews.length ? '' : `<section class="sec flush" id="reviews">
  <div class="wrap">
    <h2 data-reveal>What people say</h2>
    <div class="reviews">${reviews.map((r) => `
      <figure class="review"><blockquote>${esc(r.quote)}</blockquote><figcaption><b>${esc(r.name)}</b>${r.role ? `<span>${esc(r.role)}</span>` : ''}</figcaption></figure>`).join('')}
    </div>
  </div>
</section>`;
const stripTags = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

// ---------- collect pages ----------
const pages = [];
const walk = (dir) => {
  for (const f of fs.readdirSync(path.join(ROOT, dir))) {
    const p = path.join(dir, f);
    if (fs.statSync(path.join(ROOT, p)).isDirectory()) walk(p);
    else if (f.endsWith('.html')) {
      const raw = read(p);
      const m = raw.match(/^<!--page\s*([\s\S]*?)-->/);
      if (!m) throw new Error('Missing <!--page {...} --> header in ' + p);
      const meta = JSON.parse(m[1]);
      const rel = path.relative('src/pages', p).split(path.sep).join('/').replace(/\.html$/, '');
      meta.file = rel;
      meta.path = rel === 'index' ? '/' : '/' + rel;
      meta.body = raw.slice(m[0].length);
      pages.push(meta);
    }
  }
};
walk('src/pages');

const byPath = Object.fromEntries(pages.map((p) => [p.path, p]));
const crumbsFor = (p) => {
  if (p.path === '/' || p.noCrumbs) return [];
  const parts = p.path.split('/').filter(Boolean);
  const out = [{ name: 'Home', url: '/' }];
  let acc = '';
  parts.forEach((seg, i) => {
    acc += '/' + seg;
    const pg = byPath[acc];
    out.push({ name: pg ? (pg.label || pg.title) : seg, url: i === parts.length - 1 ? null : acc });
  });
  return out;
};

// ---------- render ----------
fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(path.join(ROOT, 'static'), OUT, { recursive: true });

const nav = read('src/partials/nav.html');
for (const p of pages) {
  const isHome = p.path === '/';
  const url = SITE + (isHome ? '/' : p.path);
  const title = p.fullTitle || `${p.title} | ${NAME}`;
  const crumbs = crumbsFor(p);
  const image = SITE + (p.image || '/assets/og-cover.jpg');

  // structured data
  const graph = [WEBSITE, PERSON];
  const pageType = p.schemaType || (isHome ? 'ProfilePage' : 'WebPage');
  const webpage = { '@type': pageType, '@id': `${url}#webpage`, url, name: title, description: p.description, isPartOf: { '@id': `${SITE}/#website` }, inLanguage: 'en-IN', dateModified: TODAY, primaryImageOfPage: { '@type': 'ImageObject', url: image } };
  if (isHome) webpage.mainEntity = { '@id': `${SITE}/#person` }; else webpage.about = { '@id': `${SITE}/#person` };
  if (crumbs.length) {
    webpage.breadcrumb = { '@id': `${url}#breadcrumb` };
    graph.push({ '@type': 'BreadcrumbList', '@id': `${url}#breadcrumb`, itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, ...(c.url ? { item: SITE + (c.url === '/' ? '/' : c.url) } : {}) })) });
  }
  if (p.faq) webpage.mainEntity = faq.map((q) => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: stripTags(q.a) } }));
  graph.push(webpage);
  if (p.project) graph.push({ '@type': 'CreativeWork', '@id': `${url}#project`, name: p.project.name, description: p.description, url: p.project.url || url, creator: { '@id': `${SITE}/#person` }, keywords: p.project.keywords, mainEntityOfPage: { '@id': `${url}#webpage` } });
  const ld = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');

  const head = `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(p.description)}">
<meta name="author" content="${NAME}">
<meta name="robots" content="${p.noindex || !PROD ? 'noindex, follow' : 'index, follow, max-image-preview:large'}">
${p.noindex ? '' : `<link rel="canonical" href="${url}">\n`}<meta property="og:type" content="${isHome ? 'profile' : 'website'}">
<meta property="og:site_name" content="${NAME}">
<meta property="og:title" content="${esc(p.ogTitle || title)}">
<meta property="og:description" content="${esc(p.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${image}">
<meta property="og:image:alt" content="${esc(NAME)}, portfolio">
<meta property="og:locale" content="en_IN">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(p.ogTitle || title)}">
<meta name="twitter:description" content="${esc(p.description)}">
<meta name="twitter:image" content="${image}">
<meta name="theme-color" content="#0B2A47">
<meta name="format-detection" content="telephone=no">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&amp;family=Caveat:wght@500..700&amp;family=Geist:wght@400..700&amp;family=Geist+Mono:wght@400;500&amp;display=swap">
<script src="/theme.js"></script>
<link rel="stylesheet" href="/styles.css">
<script type="application/ld+json">${ld}</script>
</head>`;

  let body = p.body;
  body = body.replace(/<!--if:home-->([\s\S]*?)<!--\/if:home-->/g, isHome ? '$1' : '');
  body = body.replace(/<!--if:page-->([\s\S]*?)<!--\/if:page-->/g, isHome ? '' : '$1');
  body = include(body);
  body = body.replace(/<!--if:home-->([\s\S]*?)<!--\/if:home-->/g, isHome ? '$1' : '');
  body = body.replace(/<!--if:page-->([\s\S]*?)<!--\/if:page-->/g, isHome ? '' : '$1');
  body = body.replace('<!-- faq:home -->', faqHtml(faq.slice(0, 5))).replace('<!-- faq:all -->', faqHtml(faq)).replace('<!-- reviews -->', reviewsHtml());

  const crumbHtml = crumbs.length ? `<nav class="crumbs" aria-label="Breadcrumb"><ol>${crumbs.map((c) => c.url ? `<li><a href="${c.url}">${esc(c.name)}</a></li>` : `<li aria-current="page">${esc(c.name)}</li>`).join('')}</ol></nav>` : '';
  const hero = p.hero ? `<section class="page-hero">
  <div class="wrap">
    ${crumbHtml}
    <h1 data-reveal>${p.hero.h1}</h1>
    ${p.hero.lede ? `<p class="lede">${p.hero.lede}</p>` : ''}
    ${p.hero.extra || ''}
  </div>
</section>` : '';

  const bare = p.layout === 'bare';
  const navHtml = bare ? '' : nav.replace(new RegExp(`data-nav="${p.nav}"`, 'g'), `data-nav="${p.nav}" aria-current="page"`);
  const analytics = ON_VERCEL && PROD ? '\n<script defer src="/_vercel/insights/script.js"></script>\n<script defer src="/_vercel/speed-insights/script.js"></script>' : '';
  const html = `${head}
<body class="${bare ? 'bare' : 'site'} pg-${p.nav || 'none'}">
${include('<!-- include:partials/sprite.svg -->')}
${bare ? '' : '<a class="skip" href="#main">Skip to content</a>'}
${navHtml}
<main id="main">
${hero}
${body.trim()}
</main>
${bare ? '' : include('<!-- include:partials/footer.html -->')}
${bare ? '' : include('<!-- include:partials/lightbox.html -->')}
${bare ? '' : include('<!-- include:partials/chat.html -->')}
${bare ? '<script src="/main.js"></script>' : `<script src="/vendor/gsap.min.js"></script>
<script src="/vendor/ScrollTrigger.min.js"></script>
<script src="/vendor/lenis.min.js"></script>
<script src="/main.js"></script>${isHome ? '\n<script src="/brush.js"></script>' : ''}
<script src="/bot.js"></script>`}${analytics}
</body>
</html>
`;
  if (/<!--\s*include:/.test(html)) throw new Error('Unresolved include in ' + p.file);
  const dest = path.join(OUT, p.file === 'index' ? 'index.html' : p.file + '.html');
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html);
}

// ---------- sitemap and robots ----------
const listed = pages.filter((p) => !p.noindex).sort((a, b) => (b.priority || 0.5) - (a.priority || 0.5));
fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${listed.map((p) => `  <url><loc>${SITE}${p.path === '/' ? '/' : p.path}</loc><lastmod>${TODAY}</lastmod><priority>${(p.priority || 0.5).toFixed(1)}</priority></url>`).join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(OUT, 'robots.txt'), PROD
  ? `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`
  : 'User-agent: *\nDisallow: /\n');

console.log(`Built ${pages.length} pages for ${SITE}${PROD ? '' : ' (preview, hidden from search)'}`);
