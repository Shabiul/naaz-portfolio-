/**
 * Proof of work — real systems built by Naaz AI Labs, every one live.
 *
 * The list follows the studio's company profile (Proof of Work, October
 * 2026), each project linked to the live site. Categories are the studio's
 * own industry list, plus Clinics & Healthcare. Summaries are written from each live site's own content — nothing
 * invented. Lynq, the in-house product, is listed first; Manoj Tours and The
 * Property Agent are live client builds kept from the earlier portfolio.
 *
 * `industry` is the display category and must be one of `CATEGORIES` below —
 * it drives the card label, the filter buttons, and the display order.
 *
 * `stack` is what each live site was found to run on (read from its HTML and
 * JS bundles, October 2026), plus the platforms a service card relies on.
 * Sites that were offline when checked keep an empty stack.
 *
 * `screenshot: true` means a capture of the live site exists at
 * public/img/work/<slug>.jpg (900×675, 4:3) — render.js uses it in place of
 * the generated gradient cover.
 *
 * `status: 'ongoing'` marks a project still in build: render.js withholds the
 * Visit link and stamps the cover. `summary` is optional — when absent,
 * render.js shows a visible <Description on delivery> slot instead of copy.
 *
 * Admin dashboards, CRMs and staff logins are never linked: a separate
 * dashboard card has no `live` at all, and a project that is a website plus
 * its admin links only to the public website.
 *
 * `linkLabel` replaces "Visit" when `live` points at something other than a
 * site we built — a Google Business Profile listing, for example.
 *
 * Within each category the file order is kept (the sort is stable), so a new
 * project can be appended anywhere and still lands in the right block.
 */

export const CATEGORIES = [
  'AI Product',
  'Hotels & Resorts',
  'Real Estate',
  'Tours & Travels',
  'Education',
  'Event Management',
  'Finance',
  'Security Services',
  'Clinics & Healthcare',
  'Other',
];

/** Categories with no filter button: Lynq alone, and builds that fit no industry. */
const UNFILTERED = ['AI Product', 'Other'];

export const categorySlug = (label) =>
  label.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const categoryRank = (project) => {
  const i = CATEGORIES.indexOf(project.industry);
  return i === -1 ? CATEGORIES.length : i;
};

const projectList = [
  {
    slug: 'lynq-platform',
    title: 'Lynq — AI automation platform',
    client: 'Naaz AI Labs (in-house product)',
    tags: ['ai', 'automation', 'crm'],
    industry: 'AI Product',
    year: '2026',
    stack: ['Next.js', 'WhatsApp Business API', 'Google Gemini', 'Node', 'Voice'],
    summary:
      'An AI workforce on WhatsApp, web chat, and phone lines. Answers from client documents, qualifies leads, books appointments, and runs outbound call campaigns.',
    // The portal is still in build; point at the early-access section instead.
    live: '/lynq.html#early-access',
    linkLabel: 'Early access',
    screenshot: true,
    // Extra product screenshots beyond the cover — filenames under
    // public/img/work/, shown in a lightbox when the card's media is
    // clicked. See render.js renderProjects() and src/js/modules/gallery.js.
    gallery: ['lynq-platform-2.jpg'],
  },

  // — Tours & Travels ——————————————————————————————————————————————————
  {
    slug: 'al-safr',
    title: 'Al Safr',
    client: 'Al Safr Holidays',
    tags: ['web'],
    industry: 'Tours & Travels',
    year: '2026',
    stack: ['Next.js'],
    summary:
      'Holiday packages site for a Dubai tour operator — 29 complete tours across 18 countries, offers, destinations, and a tour finder by style and departure month.',
    live: 'https://al-safr-2.vercel.app/',
    screenshot: true,
  },
  {
    slug: 'somu-holidays',
    title: 'Somu Holidays',
    client: 'Somu Holidays Tours and Travels',
    tags: ['web'],
    industry: 'Tours & Travels',
    year: '2026',
    stack: ['Next.js'],
    summary:
      'Cab and bus rental site for a Rajajinagar, Bengaluru operator — Innova, Crysta, Swift and Etios cabs, 21/25-seater buses, domestic tours, corporate travel, and airport transport.',
    live: 'https://www.somuholidays.com/',
    screenshot: true,
  },
  {
    slug: 'murudeshwara',
    title: 'Murudeshwara',
    client: 'Murudeshwara',
    tags: ['web'],
    industry: 'Tours & Travels',
    year: '2026',
    stack: ['React + Vite'],
    summary:
      'Coastal tourism site for a Karnataka beach destination operator — scuba diving, beachfront stays, and bike & cab rental, with a course and crew section for the diving side of the business.',
    live: 'https://www.murudeshwara.com/',
    screenshot: true,
  },
  {
    slug: 'sushi-tours-and-travels',
    title: 'Sushi Travels',
    client: 'Sushi Tours & Travels',
    tags: ['web', 'gmb'],
    industry: 'Tours & Travels',
    year: '2026',
    stack: ['Next.js'],
    summary:
      'Fleet and round-trip route site for a Bengaluru group-travel operator — pre-calculated outstation fares and an online booking flow by vehicle type and dates.',
    live: 'https://www.sushitravels.com/',
    screenshot: true,
  },
  {
    slug: 'yogi-tours-and-travels',
    title: 'Yogi Tours & Travels',
    client: 'Yogi Tours & Travels',
    tags: ['web', 'gmb'],
    industry: 'Tours & Travels',
    year: '2026',
    stack: ['HTML / CSS / JS'],
    summary:
      'Fleet and tour-package site for a Bengaluru vehicle rental and tourism operator — rates, routes, and quote requests for cars, tempo travellers, and coaches across South India.',
    live: 'https://www.yogitourstravels.com/',
    screenshot: true,
  },
  {
    slug: 'renuka-tours-and-travel',
    title: 'Renuka Tours & Travels',
    client: 'Renuka Tours & Travels',
    tags: ['web', 'gmb'],
    industry: 'Tours & Travels',
    year: '2026',
    stack: [],
    summary:
      'Booking site for a Bengaluru chauffeur-driven rental company — destination search by pickup, date, and passenger count, plus fleet and fare details.',
    live: 'https://www.renukatoursandtravel.com/',
    screenshot: true,
  },
  {
    slug: 'sumpreeth-tours-and-travels',
    title: 'Sumpreeth Tours & Travels',
    client: 'Sumpreeth Tours & Travels',
    // Has a staff admin portal for bookings — recorded by the tag, not linked.
    tags: ['web', 'crm', 'gmb'],
    industry: 'Tours & Travels',
    year: '2026',
    stack: ['Next.js'],
    summary:
      'Cab and coach rental site for a Bangalore operator — one-way, round-trip, airport, and local trips, plus tempo travellers and buses for outstation tours across Karnataka and South India, with an admin portal for bookings.',
    live: 'https://www.sumpreethtoursandtravels.com/',
    screenshot: true,
  },
  {
    slug: 'thonse-tours-and-travels',
    title: 'Thonse Tours & Travels',
    client: 'Thonse Tours & Travels',
    tags: ['web', 'gmb'],
    industry: 'Tours & Travels',
    year: '2026',
    stack: ['React + Vite'],
    summary:
      'Booking site for an Udupi car rental operator — Swift Dzire and Ertiga rentals with drivers, route search, and airport transfers.',
    live: 'https://www.thonsetoursandtravels.in/',
    screenshot: true,
  },
  {
    slug: 'pro-tours-travel-solutions',
    title: 'Pro Tours Travel Solutions',
    client: 'Pro Tours & Travel Solutions',
    tags: ['web', 'gmb'],
    industry: 'Tours & Travels',
    year: '2026',
    stack: ['React + Vite'],
    summary:
      'Site for a Shivaji Nagar, Bengaluru travel agency and IATA-accredited agent — flights, hotels, visas, passports, tour packages, and Hajj & Umrah.',
    live: 'https://www.protoursandtravelsolutions.com/',
    screenshot: true,
  },
  {
    slug: 'darshh-bike-rentals',
    title: 'Darshh Bike Rentals',
    client: 'Darshh Bike Rentals',
    tags: ['web', 'gmb'],
    industry: 'Tours & Travels',
    year: '2026',
    stack: ['Next.js'],
    summary:
      'Booking site for a self-drive bike, scooter, and car rental operator across Hassan, Sakleshpura, and Chikmagalur — fixed pricing, live fleet search, and booking tracking.',
    live: 'https://selfdrive.bike/',
    screenshot: true,
  },
  {
    // Staff-only dashboard: shown as proof of work, but never linked.
    slug: 'darshh-bike-rentals-crm',
    title: 'Darshh Bike Rentals CRM',
    client: 'Darshh Bike Rentals',
    tags: ['crm'],
    industry: 'Tours & Travels',
    year: '2026',
    stack: ['Next.js'],
    summary:
      'The staff CRM behind selfdrive.bike — a login-protected console the rental team works from day to day.',
    screenshot: true,
  },
  {
    slug: 'hotel-chandreshwar-rishikesh',
    title: 'Rishikesh Project — Hotel Chandreshwar',
    client: 'Hotel Chandreshwar',
    tags: ['web'],
    industry: 'Hotels & Resorts',
    year: '2026',
    stack: ['Next.js'],
    summary:
      'Direct-booking site for a stay by the Ganga in Chandreshwar Nagar, Rishikesh — AC and non-AC rooms, with bookings by phone or WhatsApp.',
    live: 'https://rishikesh-nu.vercel.app/',
    screenshot: true,
  },
  {
    slug: 'sanju-tours-and-travels',
    title: 'Sanju Tours & Travels',
    client: 'Sanju Tours & Travels',
    tags: ['web', 'gmb'],
    industry: 'Tours & Travels',
    year: '2026',
    stack: ['React + Vite'],
    summary:
      'Rental and tour site for a Hubli-Dharwad operator — cars, Tempo Travellers, and luxury coaches with per-km pricing, verified drivers, airport transfers, and outstation tours across Karnataka.',
    live: 'https://www.sanjutoursandtravels.in/',
    screenshot: true,
  },
  {
    slug: 'manoj-tours-and-travels',
    title: 'Manoj Tours & Travels',
    client: 'Manoj Tours & Travels',
    // Has a staff admin portal for bookings — recorded by the tag, not linked.
    tags: ['web', 'crm', 'gmb'],
    industry: 'Tours & Travels',
    year: '2026',
    stack: ['Next.js'],
    summary:
      'Taxi booking site for a Bangalore cab service — one-way, round-trip, local, and airport transfers across Karnataka, with an admin portal for managing bookings.',
    live: 'https://www.manojtoursandtravels.in/',
    screenshot: true,
  },
  {
    slug: 'raa-travel-ventures',
    title: 'RAA Travel Ventures',
    client: 'RAA Travel Ventures',
    tags: ['web'],
    industry: 'Tours & Travels',
    year: '2026',
    stack: ['Next.js'],
    summary:
      'Holiday site for a tour operator — curated Indian and international tour packages, destination browsing, and personalised trip planning.',
    live: 'https://raa-travels.vercel.app/',
    screenshot: true,
  },
  {
    slug: 'sardar-travels',
    title: 'Sardar Travels',
    client: 'Sardar Travels',
    tags: ['web', 'gmb'],
    industry: 'Tours & Travels',
    year: '2026',
    stack: ['Next.js'],
    summary:
      'Tour and vehicle-hire site for a Mysuru operator — sightseeing, hill-station, and heritage tours to Ooty, Kodaikanal, and Coorg, with an online quote request.',
    live: 'https://sardar-travels.vercel.app/',
    screenshot: true,
  },
  {
    // Google Business Profile work, not a website. Google blocks automated
    // captures of its listings, so the cover is a designed card, not a screenshot.
    slug: 'kaveri-travels-gmb',
    title: 'Kaveri Travels — Google Business Profile',
    client: 'Kaveri Travels',
    tags: ['gmb'],
    industry: 'Tours & Travels',
    year: '2026',
    stack: ['Google Business Profile'],
    summary:
      'Google Business Profile setup and optimisation for a travel operator — so the business shows up in local Google Search and Maps results.',
    live: 'https://share.google/GeupMFRjGun5SQFcA',
    linkLabel: 'View on Google',
    screenshot: true,
  },
  {
    // Google Business Profile work; no website or listing link supplied yet,
    // so no button and a designed cover (same recipe as Kaveri Travels).
    slug: 'paryatna-holidays-gmb',
    title: 'Paryatna Holidays — Google Business Profile',
    client: 'Paryatna Holidays',
    tags: ['gmb'],
    industry: 'Tours & Travels',
    year: '2026',
    stack: ['Google Business Profile'],
    summary:
      'Google Business Profile setup and optimisation for a holiday and tour operator — so the business shows up in local Google Search and Maps results.',
    screenshot: true,
  },
  {
    // Digital marketing clients: no site or listing of ours to link, so no
    // button and a designed cover (same recipe as the Google profile cards).
    slug: 'trip-banao-marketing',
    title: 'Trip Banao — Digital Marketing',
    client: 'Trip Banao',
    tags: ['marketing'],
    industry: 'Tours & Travels',
    year: '2026',
    stack: [],
    summary:
      'Digital marketing for a travel brand — campaigns and content planned, run and reported on to bring in trip enquiries.',
    screenshot: true,
  },
  {
    slug: 'magic-fares-marketing',
    title: 'Magic Fares — Digital Marketing',
    client: 'Magic Fares',
    tags: ['marketing'],
    industry: 'Tours & Travels',
    year: '2026',
    stack: [],
    summary:
      'Digital marketing for a travel fares business — campaigns and content planned, run and reported on to turn searches into bookings.',
    screenshot: true,
  },

  // — Hotels & Resorts ——————————————————————————————————————————————————
  {
    slug: 'casa-paradiso',
    title: 'Hotel Casa Paradiso',
    client: 'Hotel Casa Paradiso',
    tags: ['web', 'gmb'],
    industry: 'Hotels & Resorts',
    year: '2026',
    stack: ['Next.js'],
    summary:
      'Booking site for an 18-room boutique hotel on Altinho hill, Panaji — room rates, on-site dining, vehicle rentals, and direct reservations.',
    live: 'https://www.panjimhotelcasaparadiso.in/',
    screenshot: true,
  },
  {
    slug: 'coorg-jungle-mist',
    title: 'Coorg Jungle Mist Resort',
    client: 'Coorg Jungle Mist',
    tags: ['web'],
    industry: 'Hotels & Resorts',
    year: '2026',
    stack: ['jQuery + Bootstrap'],
    summary:
      'Booking site for a nature retreat in Mekeri, Madikeri — stream-edge and wooden cottages, family rooms, a gallery, and an availability check.',
    live: 'https://coorgjunglemistresort.com/',
    screenshot: true,
  },
  {
    // A service, not a site: no `live` link, so no Visit button. The cover
    // is a photo of the resort supplied by the studio.
    slug: 'coorg-jungle-mist-whatsapp',
    title: 'Coorg Jungle Mist — WhatsApp Automation',
    client: 'Coorg Jungle Mist',
    tags: ['automation'],
    industry: 'Hotels & Resorts',
    year: '2026',
    stack: ['WhatsApp Business API'],
    summary:
      'WhatsApp automation for the resort — guest enquiries, lead capture, and booking requests handled on WhatsApp, alongside the booking website we built.',
    screenshot: true,
  },
  {
    slug: 'cauvery-resort',
    title: 'Cauvery Resort',
    client: 'Cauvery Resorts',
    tags: ['web'],
    industry: 'Hotels & Resorts',
    year: '2026',
    stack: ['HTML / CSS / JS'],
    summary:
      'Group-stay site for a resort near Talacauvery and Bhagamandala, Coorg — rooms for 10 to 150 guests, pure vegetarian meals, and enquiries from pilgrim groups and families.',
    live: 'https://www.cauverykannika.com/',
    screenshot: true,
  },
  {
    slug: 'jungle-hill-resort-coorg',
    title: 'Jungle Hill Resort',
    client: 'Jungle Hill Resort',
    tags: ['web'],
    industry: 'Hotels & Resorts',
    year: '2026',
    stack: ['Next.js'],
    summary:
      'Site for a 13-room nature retreat in the coffee and pepper estates 5 km from Madikeri, Coorg — rooms, a pool, a kids play area, a restaurant, and enquiries.',
    live: 'https://jungle-hill-resort-coorg.vercel.app/',
    screenshot: true,
  },
  {
    // A service, not a site we built: no `live` link, so no Visit button.
    // The cover is a capture of the hotel's own website.
    slug: 'the-grange-hotel-whatsapp',
    title: 'The Grange Hotel — WhatsApp Automation',
    client: 'The Grange Hotel, Ooty',
    tags: ['automation'],
    industry: 'Hotels & Resorts',
    year: '2026',
    stack: ['WhatsApp Business API'],
    summary:
      'WhatsApp automation for an 1860 heritage hotel in Ooty — guest enquiries, lead capture, and booking requests handled on WhatsApp.',
    screenshot: true,
  },

  // — Clinics & Healthcare ——————————————————————————————————————————————
  {
    slug: 'crown-celebrity',
    title: 'Crown Celebrity',
    client: 'Crown Celebrity Aesthetic',
    tags: ['web', 'gmb'],
    industry: 'Clinics & Healthcare',
    year: '2026',
    stack: ['Next.js'],
    summary:
      'Site for a Jayanagar, Bengaluru hair and skin clinic, PMU studio, and training academy — GFC and PRP hair restoration, laser treatments, and consultation booking.',
    live: 'https://www.crowncelebrity.com/',
    screenshot: true,
  },
  {
    slug: 'zafoor-clinic',
    title: 'Zafoor Clinic',
    client: 'Zafoor Clinic',
    tags: ['web'],
    industry: 'Clinics & Healthcare',
    year: '2026',
    stack: ['React + Vite'],
    summary:
      'Booking site for a doctor-led skin, hair, and diabetes care clinic in Chennai — treatments, results, testimonials, and appointment requests.',
    live: 'https://www.zafoorclinic.com/',
    screenshot: true,
  },
  {
    // Staff-only dashboard: shown as proof of work, but never linked.
    slug: 'zafoor-clinic-crm',
    title: 'Zafoor Clinic CRM',
    client: 'Zafoor Clinic',
    tags: ['crm'],
    industry: 'Clinics & Healthcare',
    year: '2026',
    stack: ['Next.js'],
    summary:
      'The clinic’s own staff CRM — a login-protected console behind zafoorclinic.com for the team running the front desk.',
    screenshot: true,
  },
  {
    slug: 'lumi-hospital',
    title: 'Lumi Hospital',
    client: 'Lumi Hospital',
    tags: ['web', 'gmb'],
    industry: 'Clinics & Healthcare',
    year: '2026',
    stack: ['React + Vite'],
    summary:
      'Site for a multi-speciality hospital with 24/7 emergency, ICU and pharmacy — specialities, doctors, a hospital tour, health checks, and appointment booking.',
    live: 'https://lumihospital.com/',
    screenshot: true,
  },

  // — Education —————————————————————————————————————————————————————————
  {
    // A service, not a site: no `live` link, so no Visit button. The cover
    // is the client's logo, supplied by the studio.
    slug: 'sahara-edutech',
    title: 'Sahara Edutech — WhatsApp Automation',
    client: 'Sahara Edutech',
    tags: ['automation'],
    industry: 'Education',
    year: '2026',
    stack: ['WhatsApp Business API'],
    summary:
      'WhatsApp automation for an education company — student and parent enquiries, lead capture, and follow-ups handled on WhatsApp.',
    screenshot: true,
  },

  // — Event Management ——————————————————————————————————————————————————
  {
    slug: 'the-event-co',
    title: 'The Event Co',
    client: 'The Event Co.',
    tags: ['web'],
    industry: 'Event Management',
    year: '2026',
    stack: ['Next.js'],
    summary:
      'Site for a Bengaluru event management and planning company — weddings, private celebrations, and corporate events, with enquiries by form or WhatsApp.',
    live: 'https://the-event-co.vercel.app/',
    screenshot: true,
  },
  {
    slug: 'sid-events',
    title: 'Sid Events',
    client: 'Sid Events',
    tags: ['web'],
    industry: 'Event Management',
    year: '2026',
    stack: ['Next.js', 'Supabase'],
    summary:
      'Site for a Davanagere event management company — photography, decor, and catering packages, a wedding package builder, and consultation requests.',
    live: 'https://www.sideventsmanagement.com/',
    screenshot: true,
  },
  {
    slug: 'arshiya-weds-farhan',
    title: 'Arshiya Weds Farhan',
    client: 'Private client',
    tags: ['web'],
    industry: 'Event Management',
    year: '2026',
    stack: ['Next.js'],
    summary:
      'A digital wedding invitation for a Dawat-e-Walima in Kanpur — an animated tap-to-open invite with the event details.',
    live: 'https://arshiya-weds-farhan.vercel.app/',
    screenshot: true,
  },
  {
    slug: 'av-tec',
    title: 'AVTEC India',
    client: 'AV-TEC',
    tags: ['web'],
    industry: 'Event Management',
    year: '2026',
    stack: ['Next.js'],
    summary:
      'Service and enquiry site for an audio-visual and event technology company — equipment categories, past-production gallery, and quote requests for events.',
    live: 'https://www.avtecindia.com/',
    screenshot: true,
  },

  // — Event Management (decoration) —————————————————————————————————————
  {
    slug: 'plan-my-decor',
    title: 'Plan My Decor',
    client: 'Plan My Decor',
    tags: ['web', 'gmb', 'marketing'],
    industry: 'Event Management',
    year: '2026',
    stack: ['React + Vite', 'Supabase', 'Firebase'],
    summary:
      'Booking platform for surprise and event decoration across Bengaluru — balloon setups, candlelight dinners, room decor, and proposal setups with same-day slots.',
    live: 'https://www.planmydecor.in/',
    screenshot: true,
  },

  // — Real Estate ———————————————————————————————————————————————————————
  {
    slug: 'trishna-property-management',
    title: 'Trishna Property Management',
    client: 'Trishna Property Management',
    tags: ['web', 'gmb'],
    industry: 'Real Estate',
    year: '2026',
    stack: ['React + Vite', 'Supabase'],
    summary:
      'Listings site for a Bengaluru property firm — sale, rental, lease, and commercial spaces, with search by location and an admin sign-in for managing listings.',
    live: 'https://www.trishnapropertymanagement.in/',
    screenshot: true,
  },
  {
    slug: 'ariston-developers',
    title: 'Ariston Developers',
    client: 'Ariston Developers',
    tags: ['web'],
    industry: 'Real Estate',
    year: '2026',
    stack: [],
    summary:
      'Property discovery site for a Bengaluru luxury real estate developer — listings by type and status, galleries, and consultation requests for high-value buyers.',
    live: 'https://www.aristondevelopers.com/',
    screenshot: true,
  },
  {
    slug: 'sarakki-homes',
    title: 'Sarakki Homes',
    client: 'Sarakki Homes',
    tags: ['web', 'gmb'],
    industry: 'Real Estate',
    year: '2026',
    stack: ['Next.js', 'Supabase'],
    summary:
      'Property consultancy site for a Bengaluru real estate firm — bank-auction, resale, and rental listings, plus legal verification, loans, registration, and khata transfer.',
    live: 'https://www.sarakkihomes.com/',
    screenshot: true,
  },
  {
    // Staff-only dashboard: shown as proof of work, but never linked.
    slug: 'sarakki-homes-admin',
    title: 'Sarakki Homes CRM / Admin Dashboard',
    client: 'Sarakki Homes',
    tags: ['crm'],
    industry: 'Real Estate',
    year: '2026',
    stack: ['Next.js', 'Supabase'],
    summary:
      'The staff console behind sarakkihomes.com — a login-protected CRM and admin dashboard for listings and enquiries.',
    screenshot: true,
  },
  {
    slug: 'the-property-agent',
    title: 'The Property Agent',
    client: 'The Property Agent',
    // Has a staff admin portal for listings — recorded by the tag, not linked.
    tags: ['web', 'crm', 'gmb'],
    industry: 'Real Estate',
    year: '2026',
    stack: ['React + Vite', 'Supabase'],
    summary:
      'Listings site for a Bengaluru real estate agent — plots, farmhouse plots, agricultural land, rentals, and commercial property across Karnataka, with an admin portal for managing listings.',
    live: 'https://thepropertyagent.in/',
    screenshot: true,
  },

  // — Finance ———————————————————————————————————————————————————————————
  {
    slug: 'arena-financial-services',
    title: 'Arena Financial Services',
    client: 'Arena Financial Services',
    tags: ['web', 'gmb'],
    industry: 'Finance',
    year: '2026',
    stack: ['Next.js'],
    summary:
      'Site for a financial services firm — personal and business loans, insurance, and investment advisory through a network of 25+ banking partners, with online applications.',
    live: 'https://arena-financial-services.vercel.app/',
    screenshot: true,
  },

  // — Security Services —————————————————————————————————————————————————
  {
    slug: 'shan-maintenance-services',
    title: 'Shan Maintenance Services',
    client: 'Shan Maintenance Services',
    tags: ['web', 'gmb'],
    industry: 'Security Services',
    year: '2026',
    stack: ['Next.js'],
    summary:
      'Enquiry site for a Bengaluru industrial security and facilities firm — security, housekeeping, and training services, with quote requests by form, phone, or WhatsApp.',
    live: 'https://www.shanmaintenanceservices.in/',
    screenshot: true,
  },

  // — Other: fits no industry, shown under All work only ———————————————
  {
    slug: 'criador',
    title: 'Criador Studio',
    client: 'Criador',
    tags: ['web'],
    industry: 'Other',
    year: '2026',
    stack: ['Next.js'],
    summary:
      'Site for a Bengaluru branding and business-growth studio — portfolio, case studies, and consultation booking for its branding, social, SEO, and web services.',
    live: 'https://criador-studio.vercel.app/',
    screenshot: true,
  },
  {
    slug: 'prabhulinga',
    title: 'Prabhulinga',
    client: 'Prabhuling Travel Agency & Online Services',
    tags: ['web'],
    industry: 'Tours & Travels',
    year: '2026',
    stack: ['React + Vite'],
    summary:
      'Site for a travel agency and online-services counter running its own fleet of three buses — bus, flight, and train bookings, tour packages, and vehicle rentals.',
    live: 'https://prabhulinga.vercel.app/',
    screenshot: true,
  },
  {
    slug: 'corporate-estate-avenue',
    title: 'Corporate Estate Avenue',
    client: 'Corporate Estate Avenue',
    tags: ['web'],
    industry: 'Real Estate',
    year: '2026',
    stack: ['HTML / CSS / JS'],
    summary:
      'Site for a Bangalore property management and real estate consultancy — buying, selling, renting, and corporate relocation, with separate journeys for owners and seekers.',
    live: 'https://corporate-estate-avenue-navy.vercel.app/',
    screenshot: true,
  },
  {
    slug: 'naaz-renders-design-canvas',
    title: 'Naaz Renders Design Canvas',
    client: 'Naaz Renders',
    tags: ['web'],
    industry: 'Other',
    year: '2026',
    stack: [],
    // No screenshot or summary yet: the live link returned 404 when the
    // portfolio was updated (October 2026), so there was nothing to capture.
    live: 'https://naaz-renders-design-canvas.vercel.app/',
  },
];

/**
 * Shown ahead of everything else, in this order, on the Proof of Work page and
 * the home page. Everything after them keeps its category order.
 */
export const FIRST = ['al-safr', 'plan-my-decor', 'zafoor-clinic', 'lumi-hospital', 'sid-events'];

const priority = (project) => {
  const i = FIRST.indexOf(project.slug);
  return i === -1 ? FIRST.length : i;
};

export const projects = projectList
  .slice()
  .sort((a, b) => priority(a) - priority(b) || categoryRank(a) - categoryRank(b));

/** What was delivered, keyed by the project `tags` that mean it. */
export const SOLUTIONS = [
  ['web', 'Websites'],
  ['crm', 'CRM & dashboards'],
  ['automation', 'WhatsApp automation'],
  ['ai', 'AI agents'],
  ['gmb', 'Google Business Profile'],
  ['marketing', 'Digital marketing'],
];

/**
 * Tech that implies a solution. A site on Supabase or Firebase has a real
 * backend — logins, listings, bookings managed by staff — so it counts as a
 * CRM/dashboard build even when that wasn't tagged by hand.
 */
const TECH_SOLUTIONS = {
  Supabase: 'crm',
  Firebase: 'crm',
  'WhatsApp Business API': 'automation',
  'Google Gemini': 'ai',
  Voice: 'ai',
  'Google Business Profile': 'gmb',
};

/** A project's solution tags: its own `tags` plus whatever its `stack` implies. */
export const solutionTags = (p) => {
  const tags = new Set([...p.tags, ...p.stack.map((t) => TECH_SOLUTIONS[t]).filter(Boolean)]);
  return SOLUTIONS.filter(([tag]) => tags.has(tag)).map(([tag]) => tag);
};

/** The two ways a project can be filtered, as data-* attribute values. */
export const projectFacets = (p) => ({
  industry: categorySlug(p.industry),
  solution: solutionTags(p).join(' '),
});

/**
 * Filter groups: Industry and Solution. Within a group one option is active;
 * across groups they combine (Real Estate + CRM & dashboards). Every industry
 * gets a button, even ones with no projects yet — the page shows an
 * empty-state note for those. 'AI Product' and 'Other' get none; those
 * projects still appear when nothing is narrowed.
 */
export const projectFilterGroups = [
  {
    id: 'industry',
    label: 'Industry',
    options: CATEGORIES.filter((cat) => !UNFILTERED.includes(cat)).map((cat) => ({
      value: categorySlug(cat),
      label: cat,
    })),
  },
  {
    id: 'solution',
    label: 'Solution',
    options: SOLUTIONS.filter(([tag]) => projects.some((p) => solutionTags(p).includes(tag))).map(
      ([value, label]) => ({ value, label }),
    ),
  },
];
