/* Portfolio assistant. Runs entirely in the browser: no server, no API, no keys.
   How it answers, in order:
   1. small talk, arithmetic and word definitions
   2. project questions, using a structured record per project (problem, what he built, what he learned, stack...)
      "it" and "that one" follow the last project discussed
   3. general topics, scored by phrases and keywords with typo correction; two-part questions get two answers
   4. a keyword search over everything it knows, and finally an honest "I don't know" with a WhatsApp hand-off
   Facts live in P (projects) and K (topics). Edit those; the engine below doesn't need to change. */
(function(){
'use strict';
const PHONE='919000320544';
const WA='https://wa.me/'+PHONE+'?text='+encodeURIComponent('Hi Hariswara, I found your portfolio and wanted to reach out.');
const A={wa:['Message him on WhatsApp',WA],form:['Open the enquiry form','/enquiry','#contact'],work:['See his projects','/projects','#work'],mail:['Email him','mailto:avulahariswarareddy@gmail.com'],gh:['GitHub','https://github.com/avulahariswarareddy'],insta:['Instagram','https://www.instagram.com/harishwar_reddy_avula/'],
 py:['Open his Python app','https://my-portfoliogit-s24yeckj6yxcos4ve6ymyf.streamlit.app/'],intern:['See internships','/internships','#internships'],school:['See academics','/academics','#school'],trophies:['See the trophies','/academics#trophies','#trophies'],tksLetter:['See the TKS letter','/academics#tks-2026','#tks-2026'],aiws:['See the certificate','/academics#ai-workshop','#ai-workshop'],magnets:['See the magnets','/academics#magnets','#magnets'],sports:['See sport','/sports','#sports'],gurukul:['See the medal','/sports','#sports'],service:['See community work','/volunteering','#service'],running:['See the runs','/volunteering#running','#running'],systems:['See how the pieces connect','/projects#systems','#systems'],about:['Read his story','/about','#about'],faq:['All questions','/faq']};
const pick=a=>a[Math.floor(Math.random()*a.length)];
const esc=s=>String(s).replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
const ul=a=>'<ul>'+a.map(x=>`<li>${x}</li>`).join('')+'</ul>';
const title=p=>p.name.replace(/^the /,'').replace(/^./,c=>c.toUpperCase());

/* ---------- Projects: one structured record each ---------- */
const P={
 ved:{name:'Vedasri Traders',alias:['vedasri traders','vedasri','vedashri','grocery store','grocery app','grocery website','grocery','family shop','online store','quick commerce','e commerce','ecommerce','ai chef','list scanner','shopping list'],
  one:'a full online grocery store for his family\'s kirana shop in Gachibowli, with a customer side and an admin side in one app',
  problem:'Customers around Gachibowli are used to ordering from quick-commerce apps. He wanted the family shop to offer the same convenience without losing what a neighbourhood store does well: credit (khata) for regulars, bulk prices for businesses, and separate business and personal accounts.',
  built:['A shopping-list scanner: photograph a handwritten list, Gemini reads it, fuzzy matching finds the products, and anything unsure is offered as choices','AI Chef, which plans a dish using only what is in stock','A customer side (20 categories, bulk price tiers, offers, referrals, Razorpay checkout, order tracking) and an admin side (customer approval, invoice scanning for stock, khata, expenses, analytics, an audit log that can\'t be edited)','Row-level security in Supabase so each side only sees its own data'],
  learned:'Two kinds of users in one app meant learning how row-level security really keeps data apart. A security audit found a leak between admin and customer data and a sign-out bug, and fixing them taught him to test his own assumptions instead of trusting that something looks right.',
  stack:['Next.js 14','Supabase (database and auth)','Gemini for reading handwriting','Razorpay payments','Capacitor for the Android version','Vercel'],
  role:'He planned the product, designed it, built it and deployed it, using AI coding assistants for much of the code.',
  status:'Live on the web at vedasri-traders.vercel.app. The Android version, packaged with Capacitor, is in progress.',
  beyond:'It is built around how a kirana actually works, including credit for regular customers and bulk pricing, rather than copying a big app.',
  acts:[['Open Vedasri Traders','https://vedasri-traders.vercel.app/'],['Read the full story','/projects/vedasri-traders']]},
 app:{name:'the PG Management App',alias:['pg management app','pg management','management app','pg app','rent app','tenant app','property management','pg software'],
  one:'the private app his family\'s PG runs on every day: tenants, rent and dues for more than 250 beds across three properties',
  problem:'His father runs Bhagya Lakshmi PG. With more than 250 beds, registers weren\'t keeping up, and his father was looking at paid rental software. Hariswara built one instead, shaped around how the PG actually works.',
  built:['Occupancy, collections and dues for every property on one dashboard','Two OCR flows on the Gemini API: one reads handwritten rent notes, the other fills a new tenant\'s record from a photo of the PG\'s own printed form','Messages to tenants through the Meta WhatsApp API, and branded receipts on demand','Owner and manager logins, with the limits enforced on the server','New properties can be added without changing code'],
  learned:'Software for a real business has to fit how people already work. Much of the PG still runs on paper, so the app learned to read it instead of asking everyone to type.',
  stack:['React','TypeScript','Supabase','Gemini API','Meta WhatsApp API'],
  role:'Everything from planning to deployment, for his own family\'s business, using AI coding assistants for much of the code.',
  status:'Private and login-only, used in daily operations, so there is no public link.',
  beyond:'He also runs Meta and ChatGPT ads for the PG, so he sees both sides: how residents find the PG and how it is run once they move in.',
  acts:[['Read the full story','/projects/pg-management-app']]},
 site:{name:'the Bhagya Lakshmi PG website',alias:['bhagya lakshmi pg website','bhagyalakshmi pg','bhagya lakshmi pg','bhagya lakshmi','bhagyalakshmi','pg website','pg site','paying guest','womens pg','women pg','hostel'],
  one:'the public website for his family\'s paying-guest homes for women in Kondapur, Madhapur and HITEC City, at bhagyalakshmi-pg.com',
  problem:'Most people find a PG through word of mouth or listing apps. He wanted prospective residents and their families to understand the three homes (rooms, food, facilities, how to get in touch) before they ever called.',
  built:['A page for each of the three homes, plus facilities, food menu and gallery','A three-step enquiry form that hands the details to WhatsApp, where the PG already replies','An AI assistant that runs locally in the browser'],
  learned:'Getting noticed is its own problem. A good website still needs ads, clear information and a quick way to reply, all working together.',
  stack:['Static site','Custom domain','Local in-browser assistant','Meta and ChatGPT ads'],
  role:'Design, build and the online side of marketing.',
  status:'Live at bhagyalakshmi-pg.com.',
  beyond:'He runs Meta and ChatGPT ads for the PG and has been thinking about the whole path a resident takes: seeing an ad, checking the site, sending a WhatsApp message and getting a reply. He is exploring how WhatsApp automation could connect the public site to the private PG app.',
  acts:[['Visit the PG site','https://bhagyalakshmi-pg.com'],['Read the full story','/projects/bhagya-lakshmi-pg-website']]},
 hitex:{name:'Hitex Health Nest',alias:['hitex health nest','hitex','health nest','clinic website','clinic','polyclinic','doctor website','bhaskar reddy','client project'],
  one:'a client project for a polyclinic in Shilpa Hills under Dr. Bhaskar Reddy: its website, and help with its first steps online',
  problem:'The clinic (pulmonology, diabetes care, acupuncture, chiropractic, yoga and lifestyle medicine) was new to being online. It needed to be found, to feel trustworthy, and to make booking effortless.',
  built:['A three-step booking wizard that becomes a ready-to-send WhatsApp message, with a consent check','An offline AI receptionist that answers patient questions without any external API, checking for emergencies first','Service pages, the doctor\'s profile, gallery, FAQs, fees, directions, light and dark themes','A calm blue design with a slow breathing glow, four seconds in and six out, a nod to the clinic\'s lung care'],
  learned:'A clinic doesn\'t just need a website; it needs patients to find it, trust it and reach it. That pulled him into social media, content and messaging, and it is where he started thinking about technology as connected systems rather than single projects.',
  stack:['Next.js 15','TypeScript','Tailwind','Framer Motion','Vercel','Instagram','ChatGPT for content ideas'],
  role:'He built the website, and then helped with the clinic\'s digital start: how it presents itself online, setting up its Instagram, planning early posts and content, and trying ChatGPT for captions and ideas. He is clear that he wasn\'t the clinic\'s marketing agency and the decisions were the clinic\'s.',
  status:'Live at hitex-health-nest.vercel.app.',
  beyond:'Beyond the site he helped with the initial digital setup, the clinic\'s Instagram presence, planning posts and content, marketing ideas, and using AI tools like ChatGPT for content. The question he found interesting was how a new clinic actually gets noticed.',
  acts:[['Visit Hitex Health Nest','https://hitex-health-nest.vercel.app/'],['Read the full story','/projects/hitex-health-nest']]},
 udhaar:{name:'UdhaarAI',alias:['udhaarai','udhaar ai','udhaar','udhar','udaar','credit app','kirana app','credit notebook','khata app','notebook app'],
  one:'an app that reads the handwritten credit notebooks kirana shops keep, built in two days, which earned him a place in The Knowledge Society',
  problem:'Most kirana shops keep customer credit (udhaar) in a paper notebook because writing is faster than typing. Apps like Khatabook still need every entry typed, and plain OCR gives text, not a ledger.',
  built:['Photograph the day\'s page and the OCR reads Hindi, Telugu and English, even mixed','Each entry is checked against the database, and anything uncertain goes to a review screen with a confidence score','Customer ledgers, payments, reminders written from each customer\'s real history (with a checker that blocks anything threatening), and profit analytics','Action notes: type or say a sentence and his own parser works out the action, always confirming anything involving money','A no-sign-up demo with a sample shop'],
  learned:'Where AI helps and where plain code is better. He used Gemini only to read handwriting and wrote the rest as rules he could test: 224 automated tests across 9 suites. Two days also forced him to decide what mattered most.',
  stack:['Next.js 15','TypeScript','Supabase','Gemini'],
  role:'Solo build and pitch, in two days, for the TKS Prompt to Product challenge.',
  status:'The demo is live at udhaar-ai-alpha.vercel.app. It took him to the TKS interview round and he was selected for the TKS virtual programme.',
  beyond:'The design choice that matters: it doesn\'t ask shopkeepers to change how they work. They keep writing; the software adapts to the paper.',
  acts:[['Try the UdhaarAI demo','https://udhaar-ai-alpha.vercel.app/'],['Read the full story','/projects/udhaarai']]}
};
const FACETS=[
 ['learned',/\b(learn\w*|lesson\w*|taught|teach\w*|takeaway\w*|gain\w*|grow\w*)\b/],
 ['beyond',/\b(marketing|market|instagram|social|ads?|advert\w*|promot\w*|beyond|business side|digital presence|online presence|content|posts?|noticed)\b/],
 ['stack',/\b(stack|tech|technolog\w*|built with|made with|made in|framework\w*|languages?|tools?|database|backend|frontend|api|apis)\b/],
 ['link',/\b(links?|url|visit|try|demo|open it|see it|website address|where can i (see|find))\b/],
 ['status',/\b(status|still|in use|live|used|users|scale|how many|launched|finished|done)\b/],
 ['role',/\b(role|his part|contribut\w*|alone|solo|by himself|team|who built|who made|did he (build|make|do|code))\b/],
 ['problem',/\b(why|problem|reason|motivat\w*|purpose|need\w*|inspir\w*)\b/],
 ['built',/\b(features?|what does it do|how does it work|how it works|what is it|what can it|functionalit\w*|capabilit\w*)\b/]
];
const FACET_CHIP={learned:'What did he learn from it?',stack:'What is it built with?',problem:'Why did he build it?',beyond:'Anything beyond the code?'};
function projectAnswer(k,facet){
 const p=P[k],N=p.name[0].toUpperCase()+p.name.slice(1);
 let a;
 switch(facet){
  case 'learned':a=`<p><b>What ${esc(p.name)} taught him:</b> ${p.learned}</p>`;break;
  case 'stack':a=`<p>${N} is built with:</p>${ul(p.stack)}<p class="soft">${p.role}</p>`;break;
  case 'problem':a=`<p>${p.problem}</p>`;break;
  case 'built':a=`<p>What's in ${esc(p.name)}:</p>${ul(p.built)}`;break;
  case 'link':case 'status':a=`<p>${p.status}</p>`;break;
  case 'role':a=`<p>${p.role}</p>`;break;
  case 'beyond':a=`<p>${p.beyond}</p>`;break;
  default:a=`<p><b>${N}</b> is ${p.one}.</p><p>${p.problem}</p>${ul(p.built.slice(0,3))}<p><b>What he learned:</b> ${p.learned}</p>`;
 }
 const chips=Object.entries(FACET_CHIP).filter(([f])=>f!==facet&&!(f==='learned'&&!facet)).map(([,c])=>c).concat('Other projects');
 return {a,acts:p.acts,chips};
}

/* ---------- General topics ---------- */
const K=[
{id:'who',q:['who is he','who is this','tell me about him','about him','about hariswara','who is hariswara','introduce him','introduction','summary','summarise','summarize','in short','quick intro','tell me about yourself','overview','give me a summary','30 second','elevator pitch'],w:['who','introduce','summary','overview','bio','background'],
 a:`<p>Avula Hariswara Reddy is a Class 12 student in Hyderabad who learns by building. He has made five tools that are in real use: an online store for his family's kirana shop, the app his family's PG runs on, a website and online start for a local clinic, the PG's public website, and UdhaarAI, which reads kirana credit notebooks and got him into The Knowledge Society.</p><p>He scored 96.8% in Class 11, has school trophies from Grades 8 and 9, has done 50 Robin Hood Army drives, and volunteers at city events. He's heading into an undergraduate degree in AI and machine learning from 2027.</p>`,
 chips:['What has he built?','How does he learn?','What are his achievements?','Why AI and ML?'],acts:['about']},
{id:'admit',q:['why should a university','why should we admit','why admit him','admissions','for admissions','university application','what would he bring','what will he bring','fit for university','good candidate','why should we accept','college application','admission officer','admissions officer'],w:['admit','admission','admissions','university','college','candidate','applicant','application'],
 a:`<p>Read the evidence rather than adjectives:</p><ul><li><b>Curiosity that turns into work.</b> Five projects in real use, each started from a problem he could see: his father's registers, a shopkeeper's notebook, a clinic nobody could find online.</li><li><b>He learns what the problem needs.</b> Databases, logins, payments, the WhatsApp API and AI APIs, picked up project by project. He's open that AI assistants write much of his code; the decisions and testing are his.</li><li><b>He thinks in systems.</b> Working with real businesses moved him from "make a website" to how people find it, contact it, and how the data flows.</li><li><b>Academic consistency.</b> 96.8% in Class 11, full marks in Maths IB, Physics and Chemistry, and school trophies through Grades 8 and 9.</li><li><b>He shows up for people.</b> 50 Robin Hood Army drives and event volunteering like the Hyderabad Monsoon Run.</li></ul>`,
 chips:['How does he learn?','What has he built?','What are his achievements?'],acts:['about','work']},
{id:'learnhow',q:['how does he learn','how he learns','learning style','how did he learn','where did he learn','self taught','teach himself','how does he work','his process','how does he build','how he builds','learn by building','learning by doing'],w:['learning','learns','process','approach','method','selftaught'],
 a:`<p>Mostly by building. His loop:</p><ol><li><b>Start with a real problem</b>, usually one he can see around him.</li><li><b>Find out what he doesn't know</b>: databases, logins, a payment gateway, the WhatsApp API. He reads, watches and asks a lot of questions, including to AI tools.</li><li><b>Build the smallest version</b> someone can actually try.</li><li><b>Watch it break, then fix it.</b> A security audit, a confusing form, OCR that misread a word. He says most of what he knows came from this step.</li></ol><p>He also learned Python formally, in an internship, before deploying his own Streamlit app.</p>`,
 chips:['Does he write the code himself?','What has building taught him?','Why AI and ML?'],acts:['about']},
{id:'systems',q:['systems thinking','think in systems','how things connect','how the pieces connect','black box','black boxes','more than a website','bigger picture','what has he learned from projects','what did he learn from building','biggest lesson','main lesson','what has building taught him','what did he learn'],w:['systems','system','connect','connections','pieces','blackbox','lessons','lesson','learned'],
 a:`<p>The biggest thing building for real businesses taught him: a website is only one piece.</p><p>Apps he used every day once felt like black boxes. Building his own showed him they're a set of parts working together: an interface, a database, logins, APIs, AI, WhatsApp, payments, analytics and small bits of automation. Working with the PG and Hitex Health Nest pulled him further, into ads, Instagram and how a customer gets from finding a business to getting a reply.</p><p>There's an interactive map of which project needed which part on the projects page.</p>`,
 chips:['Hitex marketing work','How is WhatsApp used?','How does the OCR work?'],acts:['systems']},
{id:'marketing',q:['marketing','digital marketing','instagram','social media','ads','advertising','digital presence','online presence','content creation','promotion','business side','chatgpt for marketing','hitex marketing work'],w:['marketing','instagram','social','ads','advertising','promotion','content','presence','business'],
 a:`<p>Two projects went beyond the website:</p><ul><li><b>Hitex Health Nest:</b> he helped with the clinic's initial digital setup and how it presents itself online, helped set up its Instagram presence, planned early posts and content, suggested marketing ideas, and tried ChatGPT and other AI tools for drafting captions and ideas. He's clear it was help, not running an agency; the decisions were the clinic's.</li><li><b>Bhagya Lakshmi PG:</b> he runs Meta and ChatGPT ads for the PG and thinks about the path from ad to website to WhatsApp reply.</li></ul><p>It's where he learned that getting noticed is a separate problem from building something good.</p>`,
 chips:['Hitex Health Nest','The PG website','Systems thinking'],acts:['systems']},
{id:'whatsapp',q:['whatsapp api','how is whatsapp used','whatsapp integration','whatsapp automation','meta api','whatsapp booking','messaging'],w:['whatsapp','meta','messaging','messages','automation'],
 a:`<p>WhatsApp shows up in three projects, because it's where people in Hyderabad already reply:</p><ul><li><b>PG Management App:</b> sends messages to tenants through the Meta WhatsApp API, plus branded receipts.</li><li><b>Bhagya Lakshmi PG website:</b> the three-step enquiry form hands the details to WhatsApp. He's exploring automation to connect it to the private app.</li><li><b>Hitex Health Nest:</b> booking ends as a ready-to-send WhatsApp message, with a consent check.</li></ul>`,chips:['The PG app','Hitex Health Nest','Systems thinking']},
{id:'ocr',q:['ocr','scanner','list scanner','scan list','handwriting','handwritten','read handwriting','invoice scanner','how does the ocr work','how does scanning work','image to text','reading paper'],w:['ocr','scanner','scan','scanning','handwriting','handwritten','invoice','gemini'],
 a:`<p>Reading handwriting is a thread through three of his apps, all using Google's Gemini:</p><ul><li><b>Vedasri Traders:</b> a photo of a handwritten grocery list is read, then fuzzy matching finds the products. When a match is unsure it offers choices instead of guessing. Admins scan supplier invoices the same way.</li><li><b>UdhaarAI:</b> credit notebooks in Hindi, Telugu and English, with a review screen for uncertain entries.</li><li><b>PG Management App:</b> handwritten rent notes, and new-tenant forms read field by field.</li></ul><p>His idea: people keep writing on paper, so the software should adapt to the paper.</p>`,
 chips:['Vedasri Traders','UdhaarAI','The PG app']},
{id:'roles',q:['admin role','customer role','user roles','admin panel','admin side','customer side','permissions','access levels','owner and manager','manager login','row level security','rls','security'],w:['admin','role','roles','permission','permissions','access','manager','owner','security','rls'],
 a:`<p>In <b>Vedasri Traders</b>, customers and admins use the same app and see different things depending on their role. Supabase row-level security enforces it in the database. A security audit found a leak between admin and customer data, which he fixed, along with a sign-out bug.</p><p>The <b>PG Management App</b> has owner and manager logins: managers run a property day to day but can't see the financial records, and that limit is enforced on the server.</p>`,chips:['Vedasri Traders','The PG app']},
{id:'projects',q:['what has he built','what did he build','his projects','his work','show me his work','what has he made','websites he made','apps he made','projects','products','anything built','list projects','other projects','all projects'],w:['projects','project','built','build','made','apps','websites','products','portfolio','work'],
 a:()=>`<p>Five projects, all in real use:</p><ul>${Object.values(P).map(p=>`<li><b>${esc(title(p))}</b>: ${p.one}</li>`).join('')}</ul><p>Ask about any one, then follow up with what it's built with or what it taught him.</p>`,
 chips:['Vedasri Traders','Hitex Health Nest','UdhaarAI','Compare his projects'],acts:['work']},
{id:'compare',q:['compare his projects','compare projects','compare the projects','which project is best','biggest project','best project','hardest project','most complex','which is his favourite project','favourite project'],w:['compare','comparison','biggest','hardest','complex','favourite','favorite'],
 a:`<p>A quick way to see them side by side:</p><ul><li><b>Largest in scale:</b> the PG Management App, used daily for 250+ beds.</li><li><b>Most parts connected:</b> Vedasri Traders: logins, roles, database, payments, AI and stock, all in one app.</li><li><b>Fastest:</b> UdhaarAI, built and pitched in two days, and the one that got him into TKS.</li><li><b>Most beyond the code:</b> Hitex Health Nest, where he also helped with Instagram, content and the clinic's start online.</li></ul><p>He hasn't named a favourite on the site, so I won't pick one for him.</p>`,chips:['Vedasri Traders','The PG app','UdhaarAI']},
{id:'aicode',q:['does he code himself','does he write code','does he write the code','who wrote the code','does he use ai','use claude','use chatgpt','vibe coding','vibe code','ai coding','is it ai generated','did ai build','real developer','can he code','does he know coding','is he a programmer','prompting','good at coding','good at programming','can he program','how good is his code'],w:['claude','chatgpt','copilot','cursor','coding','programmer','developer','himself','prompt','prompts','generated'],
 a:`<p>He's upfront about it: he uses AI coding assistants, mostly Claude, to write much of the code.</p><p>What he owns is the part those tools don't do: working out what a business actually needs, deciding how the pieces connect (database, logins, WhatsApp, payments, AI), testing with the people who use it, and fixing what breaks. For example, noticing through a security audit that admin and customer data could leak in Vedasri Traders, and fixing it.</p><p>He also learned Python from the ground up in an internship and built and deployed his own Streamlit app. Understanding the fundamentals underneath is exactly why he wants a proper degree.</p>`,
 chips:['How does he learn?','What tech does he use?','Python internship'],acts:['py']},
{id:'skills',q:['tech stack','what tech','technologies','programming languages','what languages does he code','skills','tools he uses','frameworks','what does he know','what can he do','react','next js','nextjs','typescript','supabase','what tech does he use'],w:['stack','tech','technology','technologies','skills','skill','tools','frameworks','react','nextjs','typescript','javascript','supabase','python','streamlit','tailwind','vercel','arduino','database'],
 a:`<ul><li><b>Web:</b> Next.js, React, TypeScript, Tailwind</li><li><b>Data and logins:</b> Supabase, with row-level security</li><li><b>AI:</b> Gemini API for reading handwriting, offline in-browser assistants</li><li><b>Integrations:</b> Meta WhatsApp API, Razorpay payments</li><li><b>Mobile:</b> Capacitor for Android</li><li><b>Deploying:</b> Vercel, GitHub, Streamlit Cloud, custom domains</li><li><b>Also:</b> Python and Streamlit, Arduino from robotics, Instagram and Meta ads on the business side</li></ul><p>He picks things up as a project needs them, and uses AI coding assistants, mostly Claude, to write much of the code.</p>`,
 chips:['Does he write the code himself?','Systems thinking']},
{id:'goal',q:['what does he want to study','future plans','his goal','his dream','what does he want to become','career','which university','study abroad','undergrad','after 12th','after school','what next','higher studies','ambition','aim','why ai','why ml','why ai and ml','why machine learning','why artificial intelligence'],w:['future','goal','goals','dream','plan','plans','career','universities','abroad','undergraduate','degree','ambition','aim','ml','become'],
 a:`<p>An undergraduate degree in Artificial Intelligence and Machine Learning, aiming to start in 2027.</p><p>Why: he has already used AI in real projects (reading handwriting in three apps, offline assistants), and he's seen both where it helps and where plain code is better. Now he wants to understand properly how it works underneath, rather than only how to call it.</p>`,
 chips:['What has he built?','What are his marks?','How does he learn?']},
{id:'study',q:['what does he study','what is he studying','which class','which grade','which school','which college','current school','is he in college','is he a student','mpc','resonance'],w:['study','studying','class','grade','school','student','resonance','mpc','subjects','stream'],
 a:`<p>He's in Class 12 at Resonance Global Campus, Hyderabad, studying Maths, Physics and Chemistry (MPC). Before that he spent Classes 5 to 10 at Bhashyam Blooms, a residential school in Maheswaram.</p>`,chips:['What are his marks?','Where has he studied?','His trophies']},
{id:'schools',q:['where has he studied','schools he went','all schools','education history','schooling','previous school','primary school'],w:['schools','schooling','education','jain','heritage','bhashyam','blooms','gowtham','nursery'],
 a:`<ul><li>Resonance Global Campus, Hyderabad: Classes 11 and 12</li><li>Bhashyam Blooms School, Maheswaram: Classes 5 to 10 (residential)</li><li>Jain Heritage Cambridge School, Kondapur: Classes 2 to 4</li><li>Gowtham Model School: UKG to Class 1</li><li>New Bloom School: Nursery</li></ul>`,acts:['school']},
{id:'marks',q:['his marks','good at maths','good at math','maths marks','good in studies','percentage','how much did he score','score in','class 11','class 10','10th','11th','results','report card','grades','is he good at studies','academics','academic record'],w:['marks','percentage','score','scored','result','grades','cgpa','gpa','maths','math','physics','chemistry','english','french','academic','academics','exam'],
 a:`<p>Class 11: <b>455 out of 470, which is 96.8%</b>.</p><ul><li>Mathematics IA 74/75, Mathematics IB 75/75</li><li>Physics 60/60, Chemistry 60/60</li><li>English 91/100, French 95/100</li></ul><p>Class 10 at Bhashyam Blooms: 81.6%. Earlier, at Bhashyam Blooms, he received school trophies as class topper and second topper in Grade 8 and class second in Grade 9.</p>`,chips:['His trophies','Olympiads?','What does he want to study?'],acts:['school']},
{id:'trophies',q:['trophies','trophy','his trophies','class topper','second topper','annual day','independence day award','school awards','academic awards','topper','ranks in class','class rank','academic achievements'],w:['trophy','trophies','topper','annual','toppers','rank'],
 a:`<p>Four trophies from Bhashyam Blooms, all school-level, in order:</p><ul><li><b>Aug 2022, Class Topper, Grade 8.</b> Presented during the school's Independence Day celebrations.</li><li><b>Dec 2022, Academics Second Topper, 2022-23.</b> Second academic topper of his Grade 8 cohort, at the Annual Day.</li><li><b>2023-24, Class Second, Grade 9.</b> Presented at the Grade 9 Annual Day.</li><li><b>Ramanujan Test, 2nd Place.</b> A maths test held at school for its Ramanujan Day celebrations.</li></ul><p>None are national awards, and he doesn't present them that way. Together they show two steady years.</p>`,chips:['What are his marks?','The Gurukul medal','Olympiads?'],acts:['trophies']},
{id:'ramanujan',q:['ramanujan','ramanujan test','ramanujan day','maths competition','math competition','1729'],w:['ramanujan','1729'],
 a:`<p>He came second in a maths test held at Bhashyam Blooms as part of its Ramanujan Day celebrations. The trophy carries Ramanujan's famous number: 1729 = 10³ + 9³ = 12³ + 1³, the smallest number that is a sum of two cubes in two different ways.</p>`,acts:['trophies']},
{id:'gurukul',q:['gurukul','gurukul olympics','go 2023','go2023','medal','silver medal','under 14','u14','basketball medal','the gurukul medal'],w:['gurukul','medal','silver','olympics','go2023'],
 a:`<p>At the Gurukul Olympics 2023, held from 6 to 9 December 2023 at Shree Swaminarayan Gurukul International School, Hyderabad, his school team won silver in Under-14 basketball. He was in Grade 9 and vice-captain of the Bhashyam Blooms team that year.</p><p>The site shows the certificate together with the actual medal.</p>`,chips:['Other sports?','His trophies'],acts:['gurukul']},
{id:'olymp',q:['olympiad','olympiads','nso','imo','science olympiad','math olympiad','maths olympiad'],w:['olympiad','olympiads','nso','imo','sof'],
 a:`<ul><li><b>NSO 2022-23</b> (Class 8): school rank 7, zonal 648, international 1108</li><li><b>NSO 2023-24</b> (Class 9, with Techfest IIT Bombay): school 12, zonal 432, international 900</li><li><b>IMO 2023-24</b> (Class 9): took part alongside students from across India and abroad</li></ul>`,chips:['His trophies','Abacus and early years'],acts:['school']},
{id:'awards',q:['awards','achievements','prizes','certificates he won','what has he won','recognition','accomplishments','essay','slogan','news in education','hand print','what are his achievements'],w:['awards','award','achievements','achievement','prizes','prize','won','essay','slogan','handprint','accomplishments'],
 a:`<p>Grouped the way the site shows them:</p><ul><li><b>Academic:</b> 96.8% in Class 11; Class Topper (Grade 8), Academics Second Topper 2022-23, Class Second (Grade 9); top-five magnets from Grade 8 to Grade 10; Science and Maths Olympiads</li><li><b>Selected:</b> TKS 2026-2027, through UdhaarAI</li><li><b>Learning:</b> Python Using AI Workshop, AI for Techies, March 2026</li><li><b>Competitions:</b> 2nd in a Ramanujan Day maths test; 1st in Reflective Essay and Slogan Writing (Class 8); News in Education (Class 7); abacus contest first round (Class 3)</li><li><b>Sport:</b> silver in Under-14 basketball at the Gurukul Olympics 2023; athletics 1st place; kabaddi winners; Cult Ninja at the gym</li><li><b>Community and running:</b> 50 Robin Hood Army drives, volunteer at the Hyderabad Monsoon Run 2026, finished the Pink Power Run 2026 5K</li></ul>`,
 chips:['His trophies','The Gurukul medal','Volunteering'],acts:['trophies']},
{id:'early',q:['abacus','sip','arithmetic genius','google cs first','google logo','childhood','when he was young','early years','first code','abacus and early years'],w:['abacus','sip','arithmetic','childhood','young','kid','doodle'],
 a:`<p>In Class 3 he won the first round of the all-India SIP Arithmetic Genius abacus contest, and took part again in 2018. In Class 4 (December 2018) he designed his own version of the Google logo with code through Google CS First, his first taste of computer science.</p>`},
{id:'expo',q:['edu expo','expo','exhibition','police station','hyderabad metro','metro model','cryptocurrency','eco friendly home','sub inspector'],w:['expo','exhibition','police','metro','crypto','cryptocurrency','bitcoin','eco','model'],
 a:`<p>Every year at Bhashyam Blooms, classrooms became exhibitions:</p><ul><li>Class 5: a working police station, where he played the Sub-Inspector and gave the speech</li><li>Class 7: an eco-friendly home that stays cool without air conditioning</li><li>Class 8: a model of the Hyderabad Metro, their biggest build, where he was on the core team</li><li>Class 9: explaining cryptocurrency and Bitcoin to parents</li></ul>`},
{id:'tks',q:['tks','knowledge society','the knowledge society','prompt to product','accelerator','selected for'],w:['tks','knowledge','society','accelerator','challenge','hackathon','competition'],
 a:`<p>He has been <b>selected to join TKS 2026-2027</b>. His Letter of Acceptance is on the academics page.</p><p>The Knowledge Society (TKS) is a 10-month programme for teenagers that started in Silicon Valley. His way in was its Prompt to Product challenge: two days to build and pitch a working AI product for businesses. He entered with UdhaarAI, reached the interview round, and was selected.</p>`,chips:['UdhaarAI','The AI workshop','Internships?'],acts:['tksLetter']},
{id:'aiws',q:['ai workshop','python using ai','python using ai workshop','ai for techies','the ai workshop','ai certificate','workshop'],w:['workshop','techies'],
 a:`<p>On 22 March 2026 he completed the <b>Python Using AI Workshop</b> by AI for Techies. The certificate covers writing Python with AI, debugging Python with AI, and building interactive visualisations in Python.</p><p>His main takeaway was about choosing tools: different AI tools suit different jobs, and he started comparing when ChatGPT or Claude is the better fit. It's one step in his ongoing experimenting with AI, not a claim to expertise.</p>`,chips:['Does he write the code himself?','Python internship'],acts:['aiws']},
{id:'magnets',q:['magnets','fridge magnets','top 5','top five','magnet'],w:['magnets','magnet','fridge'],
 a:`<p>At Bhashyam Blooms, students who finished in the top five of their class after an exam got a small fridge magnet. He collected them repeatedly from the end of Grade 8 through Grade 10: five designs, with "Winning is within reach" twice. Small things, but they show the ranking wasn't a one-off.</p>`,chips:['His trophies','What are his marks?'],acts:['magnets']},
{id:'intern',q:['internships','internship','work experience','experience','has he worked','any job','jobs'],w:['internships','internship','experience','job','jobs','worked','trainee'],
 a:`<p>Three, in very different fields:</p><ul><li><b>Law</b> at Midhun Allu &amp; Associates, May to July 2026, including a day at the High Court in Hyderabad</li><li><b>Python and Streamlit</b>, learned from scratch, ending with his own deployed app</li><li><b>Robotics</b>, where his team built AquaMind, a plant-watering system</li></ul>`,chips:['Law internship','Python internship','AquaMind'],acts:['intern']},
{id:'law',q:['law internship','law','lawyer','legal','high court','midhun allu','advocate','court'],w:['law','legal','lawyer','court','advocate','midhun','allu'],
 a:`<p>Three months, May to July 2026, with Midhun Allu &amp; Associates, learning the everyday legal basics most people rely on without understanding them. They spent a full day at the High Court in Hyderabad, moving between courtrooms. He says it changed how he reads the things we all sign.</p>`,chips:['Python internship','AquaMind']},
{id:'python',q:['python internship','python','streamlit','his python app','bmi calculator','expense tracker','interest calculator','math utility'],w:['python','streamlit','bmi','expense','splitter','calculator'],
 a:`<p>He learned Python from the ground up with a group of encouraging teachers, and finished by building and deploying his own Streamlit app: an expense splitter, a BMI calculator, a simple and compound interest calculator, and a maths utility for primes, HCF and LCM. Along the way: loops, conditionals, strings and lists, regex input validation, Streamlit layouts and GitHub.</p>`,acts:['py','gh']},
{id:'aqua',q:['aquamind','robotics','arduino','plant watering','robot','soil sensor','irrigation'],w:['aquamind','robotics','arduino','plant','plants','watering','sensor','relay','pump','hardware','robot'],
 a:`<p>AquaMind is a plant-watering system his robotics team built. A soil moisture sensor reports to an Arduino Uno; when the soil is too dry, the Arduino triggers a relay (its 5V signal can't power the pump directly), the pump sends water through a drip pipe, and it switches off once the soil is wet enough. A closed loop that decides for itself.</p><p>Team: Darsh Sheejith, Vishwa Prerepa, Dhruva Nerella, Meghanandan Reddy and Hariswara.</p>`,acts:['intern']},
{id:'bball',q:['basketball','does he play basketball','vice captain','captain','ymca','game point'],w:['basketball','hoops','captain','vice','ymca'],
 a:`<p>He played for the Bhashyam Blooms team and was vice-captain, with inter-school wins at the YMCA Kargil Victory Sports Festival and the Under-14 silver at the Gurukul Olympics, both in 2023. He also did a summer coaching camp at Game Point Academy.</p>`,chips:['The Gurukul medal','Gym?','Other sports?'],acts:['sports']},
{id:'sports',q:['other sports','sports','games','athletics','kabaddi','kho kho','volleyball','sporty'],w:['sports','sport','athletics','kabaddi','kho','khokho','volleyball','games','athlete'],
 a:`<ul><li>Silver, Under-14 basketball, Gurukul Olympics 2023</li><li>1st place, Athletics 2021-22 (running events)</li><li>Winners, Kabaddi 2023-24</li><li>Runners-up, Kho-Kho 2023-24 and Volleyball Fest 2021-22</li></ul><p>At a residential school, sport was part of every week, so he tried almost everything.</p>`,chips:['The Gurukul medal','Gym?','Running?'],acts:['sports']},
{id:'gym',q:['gym','fitness','workout','work out','does he lift','cult','cult ninja','exercise'],w:['gym','fitness','workout','lift','lifting','cult','ninja','exercise','training'],
 a:`<p>He started training seriously at the gym in Class 11 and it's one of his most consistent habits. At cult he earned the Cult Ninja recognition, given to members who show up at least three days a week, week after week. His take: it's less about intensity and more about turning up.</p>`,chips:['Running?','Volunteering']},
{id:'run',q:['running','marathon','run','pink power run','necklace road','5k','10k','runs','race'],w:['running','run','marathon','runner','pink','necklace','race','runs'],
 a:`<p>He's been on both sides of city runs:</p><ul><li><b>Pink Power Run Hyderabad 2026</b> (27 September, People's Plaza, Necklace Road), a breast cancer awareness run by the Sudha Reddy and MEIL Foundations. He finished the 5K wearing bib 50458; his certificate records a provisional time of 41:24. He ran it for the cause, not as a competitive race.</li><li><b>Hyderabad Monsoon Run 2026</b> (16 August, HITEC City area), where he <b>volunteered</b> on traffic and route support. He didn't run that one.</li></ul><p class="soft">About that time: the organisers later said the course measured roughly 5.8 km, and the clock ran from a crowded mass start, so it isn't comparable to a chip-timed 5K.</p>`,chips:['Monsoon Run volunteering','Robin Hood Army'],acts:['running']},
{id:'monsoon',q:['monsoon run','hyderabad monsoon run','monsoon','traffic control','route support','hitec city run','event volunteering','volunteered at an event','monsoon run volunteering'],w:['monsoon','traffic','route','hitec','hitech','marshal'],
 a:`<p>On 16 August 2026 he volunteered at the Hyderabad Monsoon Run in the HITEC City area, on traffic and route support: helping with traffic control and keeping movement along the route organised. He was a volunteer, not a runner. He describes it as a small part of a large community event, but a meaningful one.</p><p>A month later he's a participant in the Pink Power Run, so he's seen these events from both sides.</p>`,chips:['Pink Power Run','Robin Hood Army'],acts:['running']},
{id:'rha',q:['robin hood','robin hood army','rha','volunteer','volunteering','social work','community service','charity','teaching kids','ngo','food drive','drives','community'],w:['robin','hood','rha','volunteer','volunteering','social','community','charity','ngo','teaching','kids','children','drives','drive','service'],
 a:`<p>He's done <b>50 drives</b> with the Robin Hood Army in Hyderabad, every week or at least once a month. On food drives they serve meals to families who need them. On teaching drives they spend time with children who don't go to school, teach them the basics, and talk to their parents about enrolling them. He got the Ninja badge at his 10-drive milestone in May 2026.</p><p>He also volunteered on route support at the Hyderabad Monsoon Run 2026, helps at temples during festivals, and did hands-only CPR training at Gandhi Medical College.</p>`,chips:['Monsoon Run volunteering','Temple volunteering','CPR training'],acts:['service']},
{id:'temple',q:['temple','ganesh','dasara','dussehra','festival','festivals','temple volunteering'],w:['temple','temples','ganesh','dasara','dussehra','festival','festivals'],
 a:`<p>During festivals like Ganesh Chaturthi and Dasara he volunteers at local temples, helping with arrangements and serving devotees when the crowds are at their biggest.</p>`},
{id:'cpr',q:['cpr','first aid','gandhi medical','cardiac','cpr training'],w:['cpr','aid','cardiac','gandhi','manikin'],
 a:`<p>On 1 February 2026 he attended a hands-only CPR workshop at Gandhi Medical College, Secunderabad: what a bystander should do in sudden cardiac arrest, then practice on training manikins.</p>`},
{id:'kid_service',q:['recycling','freedom ride','atlanta foundation','cycling'],w:['recycling','recycle','freedom','cycling','atlanta'],
 a:`<p>In 2018 he took part in the Inter School Recycling Championship (an ITC and GHMC initiative), exchanging 7.3 kg of dry waste, old books and paper. In August 2017 he rode in the Atlanta Foundation's Freedom Ride at Gachibowli Stadium in support of education.</p>`},
{id:'challenge',q:['biggest challenge','hardest thing','what went wrong','failure','failed','mistake','mistakes','something that broke','a bug','problem he faced','difficult'],w:['challenge','challenges','hardest','failure','failed','mistake','mistakes','bug','bugs','difficult'],
 a:`<p>A few that are on record:</p><ul><li><b>A data leak he caught.</b> A security audit of Vedasri Traders found admin and customer data could leak between roles, plus a sign-out bug. He fixed both, and learned not to trust that something works just because it looks right.</li><li><b>Paper that won't go away.</b> The PG kept writing rent notes by hand, so instead of forcing typing he built OCR that reads them.</li><li><b>Two days for UdhaarAI.</b> The constraint forced him to decide what mattered and leave the rest out.</li></ul>`,chips:['What did Vedasri teach him?','How does he learn?']},
{id:'strengths',q:['why should i hire him','why hire him','why him','what makes him special','what makes him different','strengths','his strength','is he good','is he talented','what is he good at','stand out','impressive'],w:['strength','strengths','special','different','unique','talented','impressive'],
 a:`<ul><li>He finishes things: five projects in real use, two running his family's businesses every day.</li><li>He starts from the person's problem. UdhaarAI works because it doesn't ask shopkeepers to stop writing.</li><li>He connects areas: code, databases, WhatsApp, ads and Instagram in the same project.</li><li>He's consistent: 96.8% in Class 11, Cult Ninja at the gym, 50 Robin Hood Army drives.</li></ul>`,acts:['work']},
{id:'weak',q:['weakness','weaknesses','bad at','what is he bad','improve on','flaws','negatives','drawbacks','limitations'],w:['weakness','weaknesses','weak','flaw','flaws','negative','improve','limitations'],
 a:`<p>An honest answer: his formal computer science is still early. He learned Python in an internship and leans on AI coding assistants for much of his production code, while he handles the decisions, testing and deployment. Going deeper into the fundamentals is exactly why he wants a degree in AI and machine learning.</p>`},
{id:'curious',q:['what is he curious about','what interests him','what excites him','interests','hobbies','free time','what does he like','for fun','passion','what does he enjoy','spare time','weekend'],w:['curious','curiosity','interest','interests','hobby','hobbies','fun','enjoy','likes','free','excites'],
 a:`<p>How things fit together: how a product he uses every day is really a set of systems talking to each other, and how small businesses around him actually get noticed and run. Beyond that: AI and machine learning, mathematics, robotics, the gym, running and community work.</p>`,chips:['Systems thinking','How does he learn?']},
{id:'person',q:['what is he like','his personality','what kind of person','is he nice','is he friendly','nature','character'],w:['personality','person','nature','character','friendly','nice','kind'],
 a:`<p>From his work and record: practical, consistent and people-minded. He picks problems he sees around him (his dad's PG, a local clinic, kirana shops), keeps showing up (the gym three days a week, 50 volunteer drives), and is honest about what he doesn't know yet.</p>`},
{id:'family',q:['his father','his dad','his family','his parents','his mother','his mom','siblings','brother','sister','family business'],w:['father','dad','family','parents','mother','mom','sibling','siblings','brother','sister'],
 a:`<p>His father runs Bhagya Lakshmi PG, homes for women across three properties in Hyderabad, and Hariswara built both its website and the app it runs on. The family also runs a kirana shop, Vedasri Traders, in Gachibowli. Beyond that, family details are his to share.</p>`},
{id:'name',q:['his name','full name','how do you spell','what is he called','surname','last name','first name','harishwar','hariswar reddy','avula'],w:['name','spell','surname','harishwar','hariswar'],
 a:`<p>His full name is Avula Hariswara Reddy. Older certificates spell it Harishwar Reddy A or Hariswar Reddy A. They're all him.</p>`},
{id:'age',q:['how old','his age','date of birth','when was he born','birthday','what age'],w:['age','old','born','birthday','dob'],
 a:`<p>He's in Class 12. For anything more personal than that, it's best to ask him directly.</p>`,acts:['wa']},
{id:'where',q:['where does he live','where is he from','where is he based','which city','location','hometown','where is he'],w:['where','live','city','location','based','hyderabad','telangana'],
 a:`<p>He's based in Hyderabad, Telangana, India.</p>`},
{id:'hire',q:['can he build','build me','build a website','make me a website','website for me','website for my','app for my','hire him','hire','freelance','is he available','available for','take projects','work with him','charges','how much does he charge','price','pricing','cost','quote','budget','rates','collaborate','collab'],w:['hire','hiring','freelance','freelancer','available','availability','price','pricing','cost','charge','charges','quote','budget','rates','collaborate','collab','client','commission'],
 a:`<p>Yes, he takes on websites and small apps for businesses: fast sites with WhatsApp booking or enquiries, offline AI assistants, and simple internal tools like dashboards. Given Hitex and the PG, he'll also want to talk about how people will find you, not just the site.</p><p>Pricing depends on what you need, so send a short message with what your business does.</p>`,acts:['form','wa']},
{id:'contact',q:['contact','how do i reach','reach him','get in touch','email','phone number','his number','whatsapp number','call him','message him','his socials','linkedin','github','how do i contact him'],w:['contact','reach','email','mail','phone','number','call','message','socials','linkedin','github'],
 a:`<ul><li>Email: <a href="mailto:avulahariswarareddy@gmail.com">avulahariswarareddy@gmail.com</a></li><li>Phone and WhatsApp: +91 90003 20544</li><li>GitHub: <a href="https://github.com/avulahariswarareddy">avulahariswarareddy</a></li><li>Instagram: <a href="https://www.instagram.com/harishwar_reddy_avula/">harishwar_reddy_avula</a></li></ul><p>Or use the enquiry form. It opens WhatsApp with your message ready to send.</p>`,acts:['wa','form']},
{id:'speak',q:['languages does he speak','what languages','does he speak','speak telugu','speak hindi','speak french','speak english','mother tongue'],w:['speak','speaks','spoken','tongue'],
 a:`<p>He studies English and French at school (95 out of 100 in French in Class 11). For anything beyond that, ask him directly.</p>`},
{id:'site',q:['who made this site','who built this site','who made this website','who designed this','how was this site made','how was this website created','this website','this site','how did he make this','this portfolio','what is this portfolio','what is this site','what is this website','is this his portfolio','why did he make this','why did he build this'],w:['website','site','designed','portfolio'],
 a:`<p>Hariswara built this portfolio himself, working with AI development tools and agents the same way he builds his projects. He decided what it should show and say, planned the pages, tested it on phones and laptops, and kept refining it until it felt right.</p><p>Along the way he learned how the pieces of a modern site fit together. It's a static site with no server and no database: the enquiry form hands your message to WhatsApp, and I run entirely in your browser.</p>`,chips:['What has he built?','Does he write the code himself?']},
{id:'resume',q:['resume','cv','profile pdf','download','his pdf','portfolio pdf','biodata'],w:['resume','cv','pdf','download','biodata'],
 a:`<p>There's no download on the site, but he has a full profile PDF with every certificate. Ask him on WhatsApp and he can send it.</p>`,acts:['wa']},
{id:'certs',q:['certificates','certificate','proof','show me certificates','evidence'],w:['certificates','certificate','proof','documents','evidence'],
 a:`<p>Every certificate sits next to what it's for: academics and Olympiads, trophies, sport (including the Gurukul medal), internships and community work. Tap any to see it full size.</p>`,acts:['school','sports']},
{id:'help',q:['what can you do','what can i ask','help','options','menu','what do you know','topics'],w:['help','options','menu','topics'],
 a:`<p>Ask me about his projects (and follow up with "what did it teach him?" or "what's it built with?"), how he learns, his marks and trophies, sport, volunteering, his goals, or how to contact him. Two-part questions work too, like "marks and projects".</p>`,chips:['What has he built?','Why should a university admit him?','What are his achievements?']}
];

/* ---------- small talk, fun and definitions ---------- */
const HE='(?:he|him|hari\\w*|harish\\w*|avula)';
const SMALL=[
 [/^(hi+|hey+|hello+|hlo|helo|hii+|yo|sup|hola|namaste|namaskaram|namaskar|vanakkam|good (morning|afternoon|evening))\b[\s!.]*(there|bro|anna|bhai|sir|madam|bot)?[\s!.]*$/i,()=>`<p>${greet()}! I can tell you about Hariswara: what he's built and learned, his school record, sport, volunteering, or how to reach him.</p>`,['What has he built?','Give me a summary','Why should a university admit him?']],
 [/\b(bagunnava|bagunnara|ela unnav|kaise ho|how are you|how r u|how are u|hows it going|whats up|wassup)\b/i,()=>`<p>Doing well, thanks. Ask me anything about Hariswara.</p>`],
 [/^(thanks|thank you|thx|ty|tysm|thank u|dhanyavad\w*|shukriya)\b/i,()=>`<p>${pick(['Anytime','Happy to help','You got it'])}. If you'd like to talk to him directly, WhatsApp is quickest.</p>`,null,['wa']],
 [/^(bye|goodbye|see you|see ya|cya|good night|tata)\b/i,()=>`<p>Bye, and thanks for reading his portfolio.</p>`],
 [/^(ok+|okay|k|cool|nice|great|awesome|wow|amazing|impressive|good|super|lol|haha+|hmm+|fine|alright|got it|noted|interesting)[\s!.]*$/i,()=>`<p>${pick(['Glad it helps.','There\'s more if you want it.','Right?'])} Want the short summary, or a specific project?</p>`,['Give me a summary','What has he built?']],
 [/\b(what time|current time|time now|what is the time|todays date|what day is it|what is the date)\b/i,()=>`<p>It's ${new Date().toLocaleString([], {weekday:'long',day:'numeric',month:'long',hour:'numeric',minute:'2-digit'})} where you are.</p>`]
];
const FACTS=['His first taste of computer science was coding his own version of the Google logo in Class 4.','He once played the Sub-Inspector in a school expo and gave the speech to parents.','UdhaarAI, the app that got him into The Knowledge Society, was built in two days.','The Ramanujan trophy he won carries the number 1729, the smallest number that is a sum of two cubes in two ways.','He scored 75 out of 75 in Maths IB and 95 out of 100 in French.','He spent a full day moving between courtrooms at the High Court during his law internship.','The PG app he built is used every day for more than 250 beds.','He has been on both sides of a city run: volunteering on the route in August, running in September.'];
const FUN=[
 [/\b(girl ?friend|boy ?friend|crush|dating|relationship status|married|love life|is he single)\b/i,()=>`<p>That's personal, so it's not something I'd share. Happy to talk about his work, school or volunteering.</p>`,['What has he built?','Fun fact']],
 [/\b(marry (me|him)|i love (you|him)|love you)\b/i,()=>`<p>Kind of you. I'm a chatbot on a portfolio, though, so the best I can offer is the enquiry form.</p>`],
 [/\b(handsome|good looking|cute|ugly|attractive|how does he look)\b/i,()=>`<p>The photo on the homepage is real. I'll leave it there.</p>`],
 [/\b(is (he|hari\w*) rich|net ?worth|how much money|salary|earn(s|ing)?|income|bank balance|pocket money)\b/i,()=>`<p>That's private. What's public: five projects in real use and fifty volunteer drives.</p>`],
 [/\b(how tall|height|his weight|how much does he weigh)\b/i,()=>`<p>Not in the portfolio. His Class 11 score is, though: 96.8%.</p>`],
 [/\b(is (he|hari\w*) (smart|intelligent|clever|a genius|genius|brilliant|a nerd)|his iq|how smart)\b/i,()=>`<p>No IQ test on file. On file: 75 out of 75 in Maths IB, 96.8% in Class 11, five projects in real use and a place in The Knowledge Society. Draw your own conclusions.</p>`],
 [/\b(hack|hacker|hacking)\b/i,()=>`<p>He builds things; he doesn't break into them. The closest he gets is security-testing his own apps, like the audit that caught a data leak in Vedasri Traders.</p>`],
 [/\b(homework|assignment|do my (project|exam)|exam answers|solve my|write my (essay|code)|cheat)\b/i,()=>`<p>I only know about Hariswara, so I can't help with that one. He'd probably tell you to try building a small version first.</p>`],
 [/\b((favou?rite|fav) (food|dish|movie|film|song|singer|actor|show|series|anime|band|book|colou?r))\b/i,()=>`<p>He hasn't told me that one. Ask him on WhatsApp.</p>`,null,['wa']],
 [/\b(cricket|football|pubg|bgmi|free ?fire|valorant|minecraft|fortnite|gta|video games?|gaming|chess)\b/i,()=>`<p>Not on my list. These days he's more of a gym and running person, and on school teams he played basketball, kabaddi, kho-kho and volleyball.</p>`],
 [/\b(are you (alive|sentient|conscious|real|human|a robot|a bot|ai|chatgpt|claude|gemini)|do you have feelings|who are you|what are you|your name|am i talking to)\b/i,()=>`<p>I'm a small assistant built into this page. I'm not Hariswara and I'm not connected to the internet. I only know what's in his portfolio, which keeps me honest. To reach the real him, use WhatsApp.</p>`,null,['wa']],
 [/\b(who (made|built|created|coded) you|your creator)\b/i,()=>`<p>Hariswara built me into this site, so the questions I can't answer are on him.</p>`],
 [/\broast (him|hari\w*)\b/i,()=>pick([`<p>He's built five apps and his own certificates still can't agree on how to spell his name.</p>`,`<p>He built a chatbot whose whole job is talking about him. Let that sink in.</p>`])],
 [/\b(tell me a joke|joke|make me laugh|something funny)\b/i,()=>pick([`<p>Why did the kirana shopkeeper trust UdhaarAI? It never forgets who owes what.</p>`,`<p>His plant-watering robot has more self-control than most of us. It stops drinking when it's had enough.</p>`,`<p>Why did the PG app go to therapy? Too many unresolved dues.</p>`])],
 [/\b(fun fact|random fact|tell me something( interesting)?|surprise me|interesting fact|did you know|another fun fact)\b/i,()=>`<p>${pick(FACTS)}</p>`,['Another fun fact','What has he built?']],
 [/\b(flip a coin|toss a coin|heads or tails)\b/i,()=>`<p>It's ${pick(['heads','tails'])}.</p>`],
 [/\b(roll a (dice|die))\b/i,()=>`<p>You rolled a ${1+Math.floor(Math.random()*6)}.</p>`],
 [/\b(caste|religion|hindu|muslim|christian|politic\w*|vote|bjp|congress|brs)\b/i,()=>`<p>That's personal, and not something I share. His projects, marks and volunteering are all fair game.</p>`],
 [/\b(home address|house address|where exactly|which area does he live|his address)\b/i,()=>`<p>Hyderabad is as specific as I get. For anything else, message him.</p>`,null,['wa']],
 [/\b(does he (drink|smoke|party|vape)|alcohol|beer|smoking)\b/i,()=>`<p>Not something I share. What I can tell you: he's at the gym at least three days a week.</p>`],
 [/\b(can you speak|do you speak|in telugu|in hindi|telugu lo|hindi mein)\b/i,()=>`<p>I only answer in English. His apps read Hindi and Telugu handwriting, though, so I'm the least multilingual thing he's built.</p>`],
 [/\bdoes he (know|use|code in|work with) (java|c\+\+|c#|c|php|ruby|go|golang|rust|kotlin|swift|flutter|dart|angular|vue|django|flask|aws|docker|kubernetes|unity|figma)\b/i,()=>`<p>Not on his list yet. His everyday tools are Next.js, React, TypeScript, Supabase and Python, plus Arduino from robotics. He picks up what a project needs.</p>`,['What tech does he use?']],
 [/\b(how long (does|would|will) it take|how many days|how fast can he)\b/i,()=>`<p>Depends on the project. UdhaarAI's first version took two days; the PG app took several days of focused work. Send what you need and he'll give you a real estimate.</p>`,null,['form']]
];
/* ---------- Intent: sorts a message before any topic matching ----------
   genuine     plain questions, including basic ones ("is this a website?") -> a straight answer
   playful     harmless silliness ("who asked?", "is the bot alive?") -> a light reply, with a fact where one fits
   provocative insults aimed at him or the bot -> a fixed dry comeback, never about who anyone is
   sensitive   identity used as a gotcha -> declined without treating the identity as an insult
   profanity   swearing -> a calm boundary
   Order matters: profanity first, then sensitive, provocative, genuine site questions, playful. */
const WHO='(?:he|him|hari\\w*|harish\\w*|avula|this guy|the guy|your (?:owner|creator|boss))';
const RUDE='(?:stupid|dumb|dumbass|useless|idiot\\w*|failure|a failure|loser|fool|foolish|moron|trash|garbage|worthless|pathetic|brainless|clueless|lazy|fake|fraud|overrated|a joke|clown|noob|lame|mid|annoying|incompetent|talentless|a nobody|nobody)';
const QUAL='(?:(?:so|a|an|really|kinda|kind of|such an?|just|actually|even|very|total(?:ly)?|complete(?:ly)?)\\s+)*';
const INTENT=[
 ['profanity',/\b(fuck\w*|f+u+c+k+\w*|fck|fk off|shit\w*|bullshit|bitch\w*|bastard|asshole|dickhead|motherf\w*|wtf|stfu|madarchod|bhenchod|behenchod|chutiy\w*|gandu|bhosd\w*|randi|lanja\w*|dengey|dengu)\b/,
  ()=>pick(['Let\'s keep the portfolio civilized. Ask me something useful 😭','Strong vocabulary. Weak question. Try again.','That\'s a lot of energy for a portfolio. Put it into a real question?'])],
 ['sensitive',new RegExp('\\b(is|are|isnt)\\s+'+WHO+'\\s+'+QUAL+'(gay|lesbian|bi|bisexual|queer|trans\\w*|straight|homo\\w*|lgbt\\w*)\\b'),
  ()=>pick(['That has absolutely nothing to do with the portfolio. Try asking something useful.','Interesting question. Unfortunately, the portfolio has better things to talk about.'])],
 ['provocative',new RegExp('\\b(is|isnt|was)\\s+'+WHO+'\\s+'+QUAL+RUDE+'\\b|\\b'+WHO+'\\s+(is|s|was|looks|seems)\\s+'+QUAL+RUDE+'\\b|\\b'+WHO+'\\s+(sucks|is trash|cant do anything|knows nothing|is nothing)\\b|\\bcan\\s+'+WHO+'\\s+(even\\s+|actually\\s+)?do\\s+anything\\b|\\bdoes\\s+'+WHO+'\\s+(even\\s+|actually\\s+)?know\\s+anything\\b'),
  ()=>pick(['Bold question for someone visiting his portfolio.','You came to his portfolio just to ask that? Interesting use of your time.','Look at the projects first. Then we can discuss your theory.','Five apps in real use, 96.8% in Class 11 and a TKS acceptance letter. Your move.'])],
 ['provocative',/\b(you|this bot|the bot|this chatbot|the chatbot|this (web)?site|the (web)?site|this portfolio)\s+(is|are|r)?\s*(so\s+|really\s+|kinda\s+)*(stupid|dumb|useless|trash|garbage|sucks|suck|bad|boring|mid|lame|annoying)\b/,
  ()=>pick(['I run entirely in your browser, so technically you just insulted your own device.','Harsh. I\'m a small offline chatbot doing my best. Ask me something real and watch me shine.'])],
 ['genuine',/\bis (this|it|that) (a|his|hari\w*s?|harish\w*s?) (real )?(website|site|web ?page|portfolio)\b|^(what is|whats) (this|this (web)?site|this portfolio|this page)$/,
  ()=>`Yes. This is Hariswara's personal portfolio website, made to show his projects, achievements, experiences and interests.`,['What has he built?','Who made this site?']],
 ['playful',new RegExp('\\bdid\\s+'+WHO+'\\s+(really|actually|even|truly)\\s+(make|build|create|code|design)\\b'),
  ()=>`Yes, really. He planned it, directed the AI tools and agents that helped build it, tested it and kept rebuilding bits until they felt right. You're standing in the result.`,['Does he write the code himself?','What has he built?']],
 ['genuine',new RegExp('^why (did|does|would)\\s+'+WHO+'\\s+(make|build|create)\\s+(this|the (web)?site|this (web)?site|this portfolio|a portfolio)$'),
  ()=>`To keep everything in one place: the projects he has built, what they taught him, his school record, and the things he does outside class, with the evidence one tap away. Building it was also a project in its own right, and a way to learn how a modern site fits together.`,['What has he built?','How was this site made?']],
 ['genuine',new RegExp('\\b(who|which person)\\s+(made|built|created|designed|coded|developed|wrote)\\s+(this|the (web)?site|this (web)?site|this portfolio|the portfolio|this page)$'),
  ()=>`Hariswara did. He used AI-assisted development to help build and refine the site, while learning how the different pieces of a modern web application fit together.`,['How was this site made?','What has he built?']],
 ['genuine',new RegExp('\\bdid\\s+'+WHO+'\\s+(make|build|create|design|code|develop)\\s+(this|the (web)?site|this (web)?site|this portfolio|the portfolio)( himself| by himself| on his own)?$'),
  ()=>`Yes. Hariswara built this portfolio with the help of AI development tools and agents. Through the process he learned how interfaces, APIs, services and systems connect to turn an idea into a working product.`,['How was this site made?','What has he built?']],
 ['playful',/\bwho asked\b/,()=>pick(['You did, technically. Now make it a good one.','Nobody, and yet here you are, reading his whole portfolio.'])],
 ['playful',new RegExp('\\bis (this|that|he) (actually|really|truly) '+WHO+'\\b|\\bis this (actually|really) (him|hari\\w*|harish\\w*)\\b'),
  ()=>`Yes, it's really him: Class 12, Hyderabad, and usually mid-project. The chatbot, however, is not him. The chatbot is just very well informed.`],
 ['playful',new RegExp('\\bdoes\\s+'+WHO+'\\s+(even|actually|really)?\\s*exist\\b|\\bis\\s+'+WHO+'\\s+(even\\s+)?real\\b'),
  ()=>`Unfortunately for your theory, yes. He exists, he builds things, and he has the trophies to prove it.`],
 ['playful',/\b(can|does) (this|the) (web ?site|site|page|portfolio|bot|chatbot) (talk|speak|think)\b|\bis (the|this) (chat)?bot (alive|real|sentient|conscious|human)\b|\bare you (alive|sentient|conscious)\b/,
  ()=>pick(['Unfortunately for you, yes. The chatbot is operational.','Yes. You have officially discovered the website\'s interrogation department.'])+' I only know what\'s in his portfolio, which keeps me honest.'],
 ['playful',new RegExp('\\bis\\s+'+WHO+'\\s+(a\\s+)?(boy|guy|girl|man|woman|male|female|human|robot|alien)\\b'),
  ()=>`He's a guy, and fully human. Only the chatbot is a robot. His projects are more interesting than either fact, though.`,['What has he built?']],
 ['playful',/^(is this real|is this for real|is any of this real)\??$/,
  ()=>`Very real. The trophies are real, the apps are live, and the chatbot is regrettably awake.`],
 ['playful',/^(?=[a-z]{6,}$)[^aeiouy]*$|^(?![hm])([a-z])\1{5,}$|^(asdf\w*|qwer\w*|zxcv\w*|hjkl\w*)$/,
  ()=>pick(['That\'s either a password or a cat on the keyboard. Try words 😄','I\'m fluent in English, not keyboard smash.'])]
];
let lastQ='',repeats=0;
function intent(lite){
 const t=lite.replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
 if(!t)return null;
 repeats=t===lastQ?repeats+1:0;lastQ=t;
 for(const [kind,re,fn,chips] of INTENT)if(re.test(t))return {kind,a:`<p>${fn()}</p>`,chips:chips||(kind==='genuine'?undefined:['What has he built?','What are his achievements?'])};
 if(repeats>=2)return {kind:'playful',a:`<p>That's the same question ${repeats+1} times. The answer is refusing to change 😭 Try another?</p>`};
 return null;
}
const GLOSS={kirana:'A kirana is a neighbourhood grocery shop in India. His family runs one, Vedasri Traders in Gachibowli.',udhaar:'Udhaar means buying on credit and paying later. Kirana shops track it in paper notebooks, which is what UdhaarAI reads.',khata:'A khata is a running credit account a shop keeps for regular customers. Vedasri Traders and UdhaarAI both handle it.',pg:'A PG, or paying guest home, is shared accommodation with rooms and meals. His father runs Bhagya Lakshmi PG for women in Hyderabad.',ocr:'OCR is software that reads text from a photo. His apps use it to read handwriting in notebooks, rent notes and shopping lists.',supabase:'Supabase is a database and login service. He uses it in Vedasri Traders, UdhaarAI and the PG app.',nextjs:'Next.js is a framework for building websites and web apps with React. Most of his projects use it.',vercel:'Vercel is where most of his sites are hosted, including this one.',rls:'Row-level security is a database rule that makes sure each person only sees their own rows. It keeps customer and admin data apart in Vedasri Traders.',api:'An API is a way for one piece of software to ask another for something. His apps use APIs for AI (Gemini), WhatsApp messages (Meta) and payments (Razorpay).',streamlit:'Streamlit turns Python scripts into web apps. He built his first portfolio with it in his Python internship.',arduino:'Arduino is a small programmable board. It was the brain of AquaMind, his team\'s plant-watering system.',razorpay:'Razorpay is an Indian payment gateway. Vedasri Traders uses it for checkout.',capacitor:'Capacitor turns a web app into a phone app. He\'s using it for the Android version of Vedasri Traders.',gemini:'Gemini is Google\'s AI model. His apps use it to read handwriting.',claude:'Claude is the AI coding assistant he builds with. It also helped build this site.',mpc:'MPC is the Maths, Physics and Chemistry stream in Indian schools. It\'s what he studies in Class 12.',tks:'The Knowledge Society is a 10-month accelerator for teenagers. He got in with UdhaarAI.'};
const GKEY={kirana:'kirana',udhaar:'udhaar',udhar:'udhaar',khata:'khata',pg:'pg','paying guest':'pg',ocr:'ocr',supabase:'supabase','next js':'nextjs',nextjs:'nextjs',vercel:'vercel',rls:'rls','row level security':'rls',api:'api',apis:'api',streamlit:'streamlit',arduino:'arduino',razorpay:'razorpay',capacitor:'capacitor',gemini:'gemini',claude:'claude',mpc:'mpc',tks:'tks'};
function gloss(n){const m=n.match(/^(what is|what are|what does|meaning of|define|explain)\s+(an?\s+|the\s+)?(kirana|udhaar|udhar|khata|pg|paying guest|ocr|supabase|next js|nextjs|vercel|rls|row level security|apis?|streamlit|arduino|razorpay|capacitor|gemini|claude|mpc|tks)(\s+mean|\s+means|\s+stand for)?\s*$/);return m?GLOSS[GKEY[m[3]]]:null}
function greet(){const h=new Date().getHours();return h<5?'Hey there':h<12?'Good morning':h<17?'Good afternoon':'Good evening'}

/* ---------- text utilities ---------- */
const SUBS={u:'you',ur:'your',r:'are',abt:'about',wat:'what',wht:'what',hw:'how',whr:'where',plz:'please',pls:'please',hes:'he is',whos:'who is',wats:'what is',whats:'what is',im:'i am',dont:'do not',doesnt:'does not',ph:'phone',mob:'mobile',insta:'instagram',hari:'hariswara',harish:'hariswara',pgs:'pg',webiste:'website',wesite:'website',projcts:'projects',intrnship:'internship',acheivements:'achievements',achievments:'achievements',acadmics:'academics',trophys:'trophies',volunteerd:'volunteered',whatsap:'whatsapp',watsapp:'whatsapp',univ:'university',uni:'university',tropy:'trophy',trophie:'trophy',lern:'learn',lernt:'learned',lerned:'learned',olympaid:'olympiad',projet:'project',projcet:'project',intership:'internship',volenteer:'volunteer',voluntering:'volunteering',achivements:'achievements'};
function norm(s){return s.toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9%.+\-*/ ]/g,' ').replace(/\s+/g,' ').trim().split(' ').map(t=>SUBS[t]??t).join(' ')}
const stem=t=>t.length>4&&t.endsWith('ies')?t.slice(0,-3)+'y':t.length>4&&t.endsWith('ing')?t.slice(0,-3):t.length>3&&t.endsWith('s')&&!t.endsWith('ss')?t.slice(0,-1):t;
function lev(a,b){if(Math.abs(a.length-b.length)>2)return 9;const m=Array.from({length:a.length+1},(_,i)=>[i]);for(let j=1;j<=b.length;j++)m[0][j]=j;for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)m[i][j]=Math.min(m[i-1][j]+1,m[i][j-1]+1,m[i-1][j-1]+(a[i-1]===b[j-1]?0:1));return m[a.length][b.length]}
const STOP=new Set('the a an is are was were of to in on at for and or but he him his does do did can could would should will what which who how where when why tell me about you your i my it this that there any some please show give know has have had with from by be been as its they them their than then so if just really very much more also get got'.split(' '));
K.forEach(k=>{k.qn=k.q.map(norm);k.wn=k.w.map(w=>stem(norm(w)))});
Object.values(P).forEach(p=>{p.an=p.alias.map(norm).sort((a,b)=>b.length-a.length)});

/* vocabulary for typo correction: every keyword, phrase word and project alias */
const VOCAB=new Set();
K.forEach(k=>{k.w.forEach(w=>VOCAB.add(norm(w)));k.qn.forEach(q=>q.split(' ').forEach(t=>t.length>3&&VOCAB.add(t)))});
Object.values(P).forEach(p=>p.an.forEach(a=>a.split(' ').forEach(t=>t.length>3&&VOCAB.add(t))));
const VL=[...VOCAB];
function fix(n){return n.split(' ').map(t=>{if(t.length<4||VOCAB.has(t)||STOP.has(t)||/\d/.test(t))return t;let best=t,bd=9;for(const v of VL){if(Math.abs(v.length-t.length)>2||(v[0]!==t[0]&&t.length<7))continue;const d=lev(t,v);if(d<bd){bd=d;best=v}}return (bd===1&&t.length>=6)||(bd===2&&t.length>=8)?best:t}).join(' ')}

/* BM25-style fallback index over every answer */
const plain=s=>typeof s==='function'?'':s.replace(/<[^>]+>/g,' ');
const toksOf=s=>norm(s).split(' ').map(stem).filter(t=>t&&t.length>2&&!STOP.has(t));
const DOCS=K.map(k=>({k,t:toksOf(plain(k.a)+' '+k.q.join(' ')+' '+k.w.join(' ')+' '+k.w.join(' '))}));
const DF={};DOCS.forEach(d=>new Set(d.t).forEach(t=>{DF[t]=(DF[t]||0)+1}));
const AVG=DOCS.reduce((s,d)=>s+d.t.length,0)/DOCS.length;
function bm25(qt){let best=null,bs=0,bh=0;for(const d of DOCS){let s=0,h=0;for(const t of new Set(qt)){const f=d.t.filter(x=>x===t).length;if(!f)continue;h++;const idf=Math.log(1+(DOCS.length-DF[t]+.5)/(DF[t]+.5));s+=idf*(f*2.2)/(f+1.2*(.25+.75*d.t.length/AVG))}if(s>bs){bs=s;best=d.k;bh=h}}return [best,bs,bh]}

function score(k,n,toks){
 let s=0;const pad=' '+n+' ';
 for(const p of k.qn){if(p&&pad.includes(' '+p+' '))s+=3+p.split(' ').length*.6}
 for(const w of k.wn){
  if(toks.includes(w)){s+=1.6;continue}
  if(w.length>=6)for(const t of toks){if(t.length>=6){const d=lev(t,w);if(d===1||(d===2&&w.length>=8)){s+=1.1;break}}}
 }
 return s;
}
function topics(n){const toks=n.split(' ').map(stem).filter(t=>t&&!STOP.has(t));return K.map(k=>[k,score(k,n,toks)]).sort((a,b)=>b[1]-a[1])}
function findProjects(n){const pad=' '+n+' ',hit=[];for(const [id,p] of Object.entries(P)){for(const a of p.an){const i=pad.indexOf(' '+a+' ');if(i>=0){hit.push([id,i]);break}}}return hit.sort((a,b)=>a[1]-b[1]).map(h=>h[0])}
function facetOf(n){for(const [f,re] of FACETS)if(re.test(n))return f;return null}

/* Safe arithmetic: a tiny parser, no eval */
function calc(s){let i=0;const pk=()=>s[i];
 const num=()=>{const st=i;while(i<s.length&&/[\d.]/.test(s[i]))i++;if(st===i)throw 0;const v=parseFloat(s.slice(st,i));if(isNaN(v))throw 0;return v};
 const fac=()=>{if(pk()==='-'){i++;return -fac()}if(pk()==='+'){i++;return fac()}if(pk()==='('){i++;const v=ex();if(s[i++]!==')')throw 0;return v}return num()};
 const pw=()=>{const b=fac();if(pk()==='^'){i++;return Math.pow(b,pw())}return b};
 const tm=()=>{let v=pw();while(pk()==='*'||pk()==='/'||pk()==='%'){const o=s[i++],r=pw();v=o==='*'?v*r:o==='/'?v/r:v%r}return v};
 const ex=()=>{let v=tm();while(pk()==='+'||pk()==='-'){const o=s[i++],r=tm();v=o==='+'?v+r:v-r}return v};
 if(s.length>120)return null;try{const v=ex();return i===s.length?v:null}catch(e){return null}}

/* ---------- conversation memory ---------- */
let ctx={project:null,facet:null,topic:null};
const pack=k=>{ctx.topic=k.id;ctx.project=null;return {a:typeof k.a==='function'?k.a():k.a,chips:k.chips,acts:k.acts}};
const NEXT={who:'projects',projects:'compare',admit:'learnhow',learnhow:'systems',systems:'marketing',marketing:'whatsapp',marks:'trophies',trophies:'gurukul',gurukul:'sports',run:'monsoon',monsoon:'rha',rha:'temple',intern:'aqua',goal:'learnhow',aicode:'learnhow',awards:'trophies',ocr:'roles',tks:'projects',strengths:'challenge',challenge:'learnhow'};
const FACET_ORDER=['built','problem','learned','stack','beyond','status'];
const SPECIFIC=['compare','marketing','whatsapp','ocr','roles','challenge'];
function answer(raw){
 const text=raw.trim();if(!text)return null;
 let n=norm(text);
 // arithmetic
 const mm=text.toLowerCase().replace(/[×x]/g,'*').replace(/÷/g,'/').match(/[\d(][\d.\s()]*[+\-*/^%][\d.\s+\-*/^%()]*[\d)]/);
 const expr=mm?mm[0].replace(/\s/g,''):'';
 if(expr&&/^[\d.+\-*/()%^]+$/.test(expr)&&/\d[+\-*/%^]\(?\d|\)[+\-*/]/.test(expr)){const v=calc(expr);if(v!==null&&isFinite(v))return {a:`<p>That's ${+v.toFixed(6)}.</p>`}}
 const lite=text.toLowerCase().replace(/[’']/g,'');
 const it=intent(lite);if(it)return it;
 for(const [re,fn,chips,acts] of SMALL)if(re.test(text))return {a:fn(),chips:chips||undefined,acts};
 for(const [re,fn,chips,acts] of FUN)if(re.test(lite))return {a:fn(),chips:chips||undefined,acts};
 const g=gloss(n);if(g)return {a:`<p>${g}</p>`,chips:['What has he built?','Systems thinking']};
 n=fix(n);

 // "more", "go on", "yes": continue whatever we were talking about
 if(/^(more|tell me more|and|what else|go on|continue|elaborate|details|explain|ok and|then|next|yes|yeah|yep|sure|please)$/.test(n)){
  if(ctx.project){const i=FACET_ORDER.indexOf(ctx.facet);const f=FACET_ORDER[(i+1)%FACET_ORDER.length];ctx.facet=f;return projectAnswer(ctx.project,f)}
  if(ctx.topic&&NEXT[ctx.topic])return pack(K.find(k=>k.id===NEXT[ctx.topic]));
 }
 if(/^other projects?$/.test(n))return pack(K.find(k=>k.id==='projects'));

 const projs=findProjects(n);
 const facet=facetOf(n);
 const pronoun=/\b(it|its|this|that|this one|that one|them|they|their|the app|the site|the project|the website|the clinic|the store|there)\b/.test(n);
 const tps=topics(n),topScore=tps[0][1],topId=tps[0][0].id;

 // comparisons between named projects
 if(projs.length>=2&&/\b(compare|comparison|difference|differ|vs|versus|better|between)\b/.test(n)){
  ctx.project=null;
  return {a:projs.map(id=>{const p=P[id];return `<p><b>${esc(title(p))}</b>: ${p.one}. Built with ${p.stack.slice(0,3).join(', ')}. <i>What it taught him:</i> ${p.learned.split('. ')[0]}.</p>`}).join(''),chips:projs.map(id=>title(P[id]))};
 }
 // one named project, unless the question is really about a cross-project topic ("how is OCR used across projects")
 if(projs.length===1&&!(topScore>=6&&SPECIFIC.includes(topId)&&!facet)){
  ctx.project=projs[0];ctx.facet=facet;ctx.topic=null;return projectAnswer(projs[0],facet);
 }
 if(projs.length>=2){ctx.project=projs[0];ctx.facet=facet;return {a:projs.map(id=>projectAnswer(id,facet||'overview').a.replace(/^<p>/,`<p><b>${esc(title(P[id]))}:</b> `)).join('<hr>'),chips:['Compare his projects']}}
 // "what did it teach him?" right after talking about a project
 if(ctx.project&&facet&&(pronoun||(n.split(' ').length<=6&&topScore<5))){ctx.facet=facet;return projectAnswer(ctx.project,facet)}

 // two-part questions: "his marks and his projects"
 const parts=n.split(/\s(?:and also|and|also|plus|as well as)\s|\s*[,;]\s*/).filter(x=>x&&x.trim());
 if(parts.length>=2&&parts.length<=3){
  const picks=[];
  for(const part of parts){const t=topics(part)[0];if(t[1]>=3&&!picks.find(p=>p.id===t[0].id))picks.push(t[0])}
  if(picks.length>=2){ctx.project=null;ctx.topic=picks[picks.length-1].id;return {a:picks.map(k=>typeof k.a==='function'?k.a():k.a).join('<hr>'),chips:picks[picks.length-1].chips,acts:[...new Set(picks.flatMap(k=>k.acts||[]))].slice(0,2)}}
 }

 const toks=n.split(' ').map(stem).filter(t=>t&&!STOP.has(t));
 if(topScore>=1.5||(toks.length<=2&&topScore>=1.1))return pack(tps[0][0]);
 if(!toks.length)return {a:`<p>Try something like "what has he built?" or "what did the PG app teach him?"</p>`,chips:['What has he built?','How do I contact him?']};
 const [rb,rs,rh]=bm25(toks);
 if(rb&&rs>=2.2&&(rh>=2||toks.length<=2)){const p=pack(rb);p.a=`<p class="soft">Closest thing I know about that:</p>`+p.a;return p}
 const ask=['Ask him on WhatsApp','https://wa.me/'+PHONE+'?text='+encodeURIComponent('Hi Hariswara, your website assistant could not answer this: '+text.slice(0,300))];
 return {a:`<p>${pick(['That one isn\'t in anything I know about Hariswara, and I\'d rather not guess.','I don\'t have that, and I don\'t make things up.'])}</p><p>Want to ask him directly? The button opens WhatsApp with your question ready.</p>`,chips:['What has he built?','Give me a summary','How do I contact him?'],acts:[ask]};
}

/* ---------- UI ---------- */
window.__askBot=answer;
const $=s=>document.querySelector(s);
const fab=$('#chatFab'),box=$('#chat'),log=$('#chatLog'),chips=$('#chatChips'),form=$('#chatForm'),inp=$('#chatInput');
if(!fab||!box)return;
const START=['Give me a summary','What has he built?','Why should a university admit him?','What are his achievements?','How does he learn?','Fun fact','How do I contact him?'];
const KEY='hr-chat-v2',reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
let hist=[],opened=false;
const save=()=>{try{sessionStorage.setItem(KEY,JSON.stringify({hist:hist.slice(-40),ctx}))}catch(e){}};
function actLink(key){
 const [l,h,sc]=Array.isArray(key)?key:A[key]||[];if(!l)return null;
 const a=document.createElement('a');a.textContent=l;a.href=h;
 if(sc&&document.getElementById(sc.slice(1)))a.dataset.scroll=sc;
 if(/^(https?:|mailto:)/.test(h)){a.target='_blank';a.rel='noopener'}else a.addEventListener('click',()=>{if(innerWidth<=560)toggle(false)});
 return a;
}
function add(html,who,acts,keep=true){
 const m=document.createElement('div');m.className='msg '+who;m.innerHTML=html;
 if(acts&&acts.length){const d=document.createElement('div');d.className='acts';acts.map(actLink).filter(Boolean).forEach(a=>d.appendChild(a));m.appendChild(d)}
 m.querySelectorAll('a[href^="http"]').forEach(a=>{a.target='_blank';a.rel='noopener'});
 log.appendChild(m);log.scrollTop=log.scrollHeight;
 if(keep){hist.push({who,html,acts:acts||null});save()}
 return m;
}
function setChips(list){chips.innerHTML='';(list||START).slice(0,5).forEach(t=>{const b=document.createElement('button');b.type='button';b.className='qchip';b.textContent=t;b.onclick=()=>ask(t);chips.appendChild(b)})}
function ask(q){
 add(esc(q),'me');
 const r=answer(q);if(!r)return;
 const t=document.createElement('div');t.className='msg bot typing';t.setAttribute('aria-hidden','true');t.innerHTML='<i></i><i></i><i></i>';log.appendChild(t);log.scrollTop=log.scrollHeight;
 const delay=reduce?120:Math.min(900,300+r.a.length*.9);
 setTimeout(()=>{t.remove();add(r.a,'bot',r.acts);setChips(r.chips||START);save()},delay);
}
function intro(){add(`<p>${greet()}! I'm the assistant on Hariswara's portfolio. Ask about his projects (then follow up with "what did it teach him?"), his achievements, how he learns, or how to reach him.</p>`,'bot');setChips()}
function restore(){
 try{const s=JSON.parse(sessionStorage.getItem(KEY)||'null');if(s&&s.hist&&s.hist.length){hist=s.hist;ctx=Object.assign(ctx,s.ctx||{});hist.forEach(m=>add(m.html,m.who,m.acts,false));setChips();return true}}catch(e){}
 return false;
}
function toggle(o){
 box.classList.toggle('open',o);fab.classList.toggle('hide',o);fab.setAttribute('aria-expanded',String(o));document.dispatchEvent(new CustomEvent('chat:toggle',{detail:o}));
 if(o){if(!opened){opened=true;if(!restore())intro()}setTimeout(()=>inp.focus({preventScroll:true}),200)}
 else fab.focus({preventScroll:true});
}
fab.addEventListener('click',()=>toggle(true));
$('#chatX').addEventListener('click',()=>toggle(false));
$('#chatNew')?.addEventListener('click',()=>{hist=[];ctx={project:null,facet:null,topic:null};try{sessionStorage.removeItem(KEY)}catch(e){}log.innerHTML='';intro();inp.focus({preventScroll:true})});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&box.classList.contains('open'))toggle(false)});
form.addEventListener('submit',e=>{e.preventDefault();const q=inp.value;inp.value='';if(q.trim())ask(q)});
})();
