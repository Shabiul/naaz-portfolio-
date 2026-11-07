/**
 * Industry solution matrix — the commercial heart of the site.
 *
 * This is the single source of truth for the Solutions page, the home page
 * preview, and the footer's industry links. Rendered to static HTML at build
 * time (see vite-plugin-content.js) so it stays crawlable and costs no runtime
 * JavaScript.
 *
 * `inherits` is rendered as the "Everything in X, plus" line, so tiers are
 * written as deltas rather than restating the whole list three times.
 *
 * ---------------------------------------------------------------------------
 * FILLING IN THE COMMERCIALS
 * ---------------------------------------------------------------------------
 * Each tier carries three fields — investment, timeline, team. Where no
 * client-specific quote exists, the tier uses the studio's standard bands
 * (October 2026): Standard ₹18,000–₹25,000 · 2–3 weeks · 2–3 specialists;
 * Intermediate ₹32,000–₹45,000 · 4–6 weeks · 3–4 specialists; Premium from
 * ₹75,000 · 6–10 weeks · 4–6 specialists. A missing field would still render
 * as a visible slot (render.js), never a guess:
 *
 *   {
 *     name: 'Standard',
 *     investment: '₹15,000',      // one-off build, or '₹11,999 / month'
 *     timeline: '3–4 weeks',
 *     team: '3 specialists',
 *     ...
 *   }
 *
 * Reference figures from real Naaz AI Labs proposals — starting points to
 * adjust per industry, deliberately NOT applied automatically, because a
 * quote written for one client is not a price list for eight sectors:
 *
 *   Proposal NAL-2026-014 — Website ₹15,000 · CRM setup ₹5,000 ·
 *                            WhatsApp automation from ₹4,000
 *   WhatsApp standalone   — ₹20,000 setup, then ₹2,500–₹9,000 / month
 *   Lynq subscription     — ₹11,999 / ₹29,999 / ₹74,999 per month
 *                           (see src/data/company.js)
 */

export const industries = [
  {
    id: 'real-estate',
    name: 'Real Estate',
    blurb: 'Listings that convert, pipelines that follow up on their own.',
    outcome:
      'Property businesses lose deals in the gap between enquiry and callback. We close that gap — every lead captured, scored, and answered before it cools.',
    icon: 'building',
    timeline: '3–14 weeks',
    team: '3–7 specialists',
    complexity: 4,
    stack: ['Next.js', 'Node', 'PostgreSQL', 'OpenAI', 'Twilio', 'Mapbox'],
    tiers: [
      {
        name: 'Standard',
        label: 'Foundation',
        investment: '₹15,000',
        timeline: '2–3 weeks',
        team: '2–3 specialists',
        features: [
          'Modern business website',
          'Property listings with search & filters',
          'Enquiry and contact forms',
          'Google Maps integration',
          'Lead capture form',
          'Fully responsive design',
          'Technical SEO foundation',
        ],
      },
      {
        name: 'Intermediate',
        label: 'Operations',
        inherits: 'Standard',
        investment: '₹24,000',
        timeline: '4–6 weeks',
        team: '3–4 specialists',
        features: [
          'CRM built around your sales stages',
          'Lead management & assignment',
          'WhatsApp Business integration',
          'Analytics & conversion reporting',
          'Site-visit booking system',
          'Admin dashboard',
        ],
      },
      {
        name: 'Premium',
        label: 'Intelligence',
        inherits: 'Intermediate',
        investment: 'From ₹75,000',
        timeline: '6–10 weeks',
        team: '4–6 specialists',
        features: [
          'AI voice agent for inbound calls',
          'AI chatbot trained on your inventory',
          'Property recommendation engine',
          'Predictive analytics on deal likelihood',
          'Owner dashboard',
          'Sales performance dashboard',
          'Automated multi-channel follow-ups',
          'Payment gateway',
          'Document management & e-signing',
          'Third-party API integrations',
          'Native mobile app',
        ],
      },
    ],
  },
  {
    id: 'resort',
    name: 'Resort',
    blurb: 'A booking experience as considered as the property itself.',
    outcome:
      'Guests judge the property by the website before they ever arrive. We build the arrival experience — and the engine that fills the rooms behind it.',
    icon: 'palm',
    timeline: '4–16 weeks',
    team: '4–8 specialists',
    complexity: 4,
    stack: ['Next.js', 'Node', 'Stripe', 'OpenAI Realtime', 'Cloudinary', 'Supabase'],
    tiers: [
      {
        name: 'Standard',
        label: 'Foundation',
        investment: '₹18,000 – ₹25,000',
        timeline: '2–3 weeks',
        team: '2–3 specialists',
        features: [
          'Luxury brand website',
          'Cinematic gallery',
          'Room & suite pages',
          'Booking enquiry flow',
          'Amenities showcase',
          'Contact & location',
          'Technical SEO foundation',
        ],
      },
      {
        name: 'Intermediate',
        label: 'Operations',
        inherits: 'Standard',
        investment: '₹32,000 – ₹45,000',
        timeline: '4–6 weeks',
        team: '3–4 specialists',
        features: [
          'Live booking dashboard',
          'Admin panel',
          'Offers & seasonal packages',
          'Guest review management',
          'Room inventory management',
          'WhatsApp confirmations',
          'Email automation',
        ],
      },
      {
        name: 'Premium',
        label: 'Intelligence',
        inherits: 'Intermediate',
        investment: 'From ₹75,000',
        timeline: '6–10 weeks',
        team: '4–6 specialists',
        features: [
          'AI concierge for guest requests',
          'AI receptionist, 24/7',
          'Voice-driven booking',
          'Dynamic pricing engine',
          'Integrated guest CRM',
          'Guest behaviour analytics',
          'Restaurant reservation integration',
          'Spa & activity booking',
          'Travel package builder',
          'Native mobile app',
        ],
      },
    ],
  },
  {
    id: 'travel',
    name: 'Travel Agency',
    blurb: 'From destination browsing to a booked, paid, documented trip.',
    outcome:
      'Travel is sold on inspiration and won on logistics. We build both halves — the browsing that sells the trip and the system that operates it.',
    icon: 'compass',
    timeline: '4–14 weeks',
    team: '3–7 specialists',
    complexity: 4,
    stack: ['Next.js', 'Node', 'Amadeus API', 'Stripe', 'OpenAI', 'Mapbox'],
    tiers: [
      {
        name: 'Standard',
        label: 'Foundation',
        investment: '₹18,000 – ₹25,000',
        timeline: '2–3 weeks',
        team: '2–3 specialists',
        features: [
          'Travel brand website',
          'Package listings',
          'Destination pages',
          'Editorial blog',
          'Enquiry & contact flow',
        ],
      },
      {
        name: 'Intermediate',
        label: 'Operations',
        inherits: 'Standard',
        investment: '₹32,000 – ₹45,000',
        timeline: '4–6 weeks',
        team: '3–4 specialists',
        features: [
          'Package management system',
          'Booking engine',
          'CRM with lead pipeline',
          'Lead capture & routing',
          'WhatsApp integration',
          'Automated invoicing',
          'Online payments',
        ],
      },
      {
        name: 'Premium',
        label: 'Intelligence',
        inherits: 'Intermediate',
        investment: 'From ₹75,000',
        timeline: '6–10 weeks',
        team: '4–6 specialists',
        features: [
          'AI trip planner',
          'AI voice booking agent',
          'Customer self-service portal',
          'Hotel inventory APIs',
          'Flight search APIs',
          'Interactive maps & itineraries',
          'Full payment gateway',
          'Personalised recommendations',
        ],
      },
    ],
  },
  {
    id: 'crm',
    name: 'CRM Systems',
    blurb: 'The system your team actually opens every morning.',
    outcome:
      'Most CRMs fail because they are built for reporting, not for the person doing the work. We build AI CRM systems your team actually uses, without being told to.',
    icon: 'nodes',
    timeline: '6–20 weeks',
    team: '4–9 specialists',
    complexity: 5,
    stack: ['React', 'Node', 'PostgreSQL', 'Claude', 'Redis', 'AWS'],
    tiers: [
      {
        name: 'Standard',
        label: 'Foundation',
        investment: '₹18,000 – ₹25,000',
        timeline: '2–3 weeks',
        team: '2–3 specialists',
        features: [
          'Customer & company records',
          'Lead capture and tracking',
          'Task and activity management',
          'Standard reporting',
        ],
      },
      {
        name: 'Intermediate',
        label: 'Operations',
        inherits: 'Standard',
        investment: '₹32,000 – ₹45,000',
        timeline: '4–6 weeks',
        team: '3–4 specialists',
        features: [
          'Workflow automation',
          'Email sequences',
          'WhatsApp integration',
          'Analytics dashboards',
          'Custom sales pipelines',
          'Invoicing & quotes',
        ],
      },
      {
        name: 'Premium',
        label: 'Intelligence',
        inherits: 'Intermediate',
        investment: 'From ₹75,000',
        timeline: '6–10 weeks',
        team: '4–6 specialists',
        features: [
          'AI-native CRM assistant',
          'Voice AI for call logging & follow-up',
          'Predictive sales forecasting',
          'Automated lead scoring',
          'Document AI & extraction',
          'End-to-end process automation',
          'Business intelligence layer',
        ],
      },
    ],
  },
  {
    id: 'hospitality',
    name: 'Hospitality',
    blurb: 'Front desk, restaurant, and reservations on one spine.',
    outcome:
      'Hospitality runs on a dozen disconnected tools. We consolidate them into one system so the guest never feels the seams.',
    icon: 'bell',
    timeline: '4–16 weeks',
    team: '4–8 specialists',
    complexity: 4,
    stack: ['Next.js', 'Node', 'Supabase', 'OpenAI Realtime', 'Stripe'],
    tiers: [
      {
        name: 'Standard',
        label: 'Foundation',
        investment: '₹18,000 – ₹25,000',
        timeline: '2–3 weeks',
        team: '2–3 specialists',
        features: [
          'Property website',
          'Booking enquiry system',
          'Gallery & venue showcase',
          'Technical SEO foundation',
        ],
      },
      {
        name: 'Intermediate',
        label: 'Operations',
        inherits: 'Standard',
        investment: '₹32,000 – ₹45,000',
        timeline: '4–6 weeks',
        team: '3–4 specialists',
        features: [
          'Guest CRM',
          'Guest-facing dashboard',
          'Full reservation system',
          'Restaurant table management',
        ],
      },
      {
        name: 'Premium',
        label: 'Intelligence',
        inherits: 'Intermediate',
        investment: 'From ₹75,000',
        timeline: '6–10 weeks',
        team: '4–6 specialists',
        features: [
          'AI receptionist',
          'Voice assistant for guest services',
          'Unified CRM across properties',
          'Occupancy & revenue analytics',
          'Dynamic pricing',
          'Native mobile app',
        ],
      },
    ],
  },
  {
    id: 'finance',
    name: 'Finance',
    blurb: 'Compliant on the outside, automated underneath.',
    outcome:
      'Financial services live or die on trust and turnaround. We build interfaces that earn the first and automation that delivers the second.',
    icon: 'chart',
    timeline: '6–22 weeks',
    team: '4–9 specialists',
    complexity: 5,
    stack: ['Next.js', 'Node', 'PostgreSQL', 'Claude', 'OCR', 'AWS KMS'],
    tiers: [
      {
        name: 'Standard',
        label: 'Foundation',
        investment: '₹18,000 – ₹25,000',
        timeline: '2–3 weeks',
        team: '2–3 specialists',
        features: [
          'Corporate website',
          'Product & loan pages',
          'Eligibility calculators',
          'Enquiry & contact flow',
        ],
      },
      {
        name: 'Intermediate',
        label: 'Operations',
        inherits: 'Standard',
        investment: '₹32,000 – ₹45,000',
        timeline: '4–6 weeks',
        team: '3–4 specialists',
        features: [
          'CRM for applications',
          'EMI & repayment tooling',
          'Internal dashboard',
          'Customer portal',
        ],
      },
      {
        name: 'Premium',
        label: 'Intelligence',
        inherits: 'Intermediate',
        investment: 'From ₹75,000',
        timeline: '6–10 weeks',
        team: '4–6 specialists',
        features: [
          'AI financial assistant',
          'Loan origination automation',
          'OCR document processing',
          'Portfolio analytics',
          'Automated KYC workflows',
          'Document AI & verification',
        ],
      },
    ],
  },
  {
    id: 'events',
    name: 'Event Management',
    blurb: 'Registration, vendors, and ticketing without the spreadsheet.',
    outcome:
      'Events are operations problems disguised as creative ones. We build the operational layer so the creative work has room to happen.',
    icon: 'ticket',
    timeline: '4–14 weeks',
    team: '3–7 specialists',
    complexity: 3,
    stack: ['Next.js', 'Node', 'Stripe', 'OpenAI', 'Supabase'],
    tiers: [
      {
        name: 'Standard',
        label: 'Foundation',
        investment: '₹18,000 – ₹25,000',
        timeline: '2–3 weeks',
        team: '2–3 specialists',
        features: [
          'Event website',
          'Gallery & past events',
          'Registration forms',
          'Contact & enquiry flow',
        ],
      },
      {
        name: 'Intermediate',
        label: 'Operations',
        inherits: 'Standard',
        investment: '₹32,000 – ₹45,000',
        timeline: '4–6 weeks',
        team: '3–4 specialists',
        features: [
          'Booking management',
          'Client CRM',
          'Automated invoicing',
          'Vendor coordination panel',
        ],
      },
      {
        name: 'Premium',
        label: 'Intelligence',
        inherits: 'Intermediate',
        investment: 'From ₹75,000',
        timeline: '6–10 weeks',
        team: '4–6 specialists',
        features: [
          'AI event planner & budgeting',
          'Vendor performance dashboard',
          'Ticketing with QR check-in',
          'Attendance & engagement analytics',
          'End-to-end automation',
          'Native mobile app',
        ],
      },
    ],
  },
  {
    id: 'education',
    name: 'Education',
    blurb: 'Admissions, learning, and reporting in one continuous system.',
    outcome:
      'Institutions run on admissions cycles and attention. We build systems that shorten the first and hold the second.',
    icon: 'academic',
    timeline: '5–18 weeks',
    team: '4–8 specialists',
    complexity: 4,
    stack: ['Next.js', 'Node', 'PostgreSQL', 'Claude', 'Firebase', 'Stripe'],
    tiers: [
      {
        name: 'Standard',
        label: 'Foundation',
        investment: '₹18,000 – ₹25,000',
        timeline: '2–3 weeks',
        team: '2–3 specialists',
        features: [
          'Institution website',
          'Course catalogue',
          'Admissions information',
          'Faculty directory',
        ],
      },
      {
        name: 'Intermediate',
        label: 'Operations',
        inherits: 'Standard',
        investment: '₹32,000 – ₹45,000',
        timeline: '4–6 weeks',
        team: '3–4 specialists',
        features: [
          'Student portal',
          'Attendance tracking',
          'Learning management system',
          'Admissions CRM',
        ],
      },
      {
        name: 'Premium',
        label: 'Intelligence',
        inherits: 'Intermediate',
        investment: 'From ₹75,000',
        timeline: '6–10 weeks',
        team: '4–6 specialists',
        features: [
          'AI teaching assistant',
          'AI admissions counsellor',
          'Full LMS with course authoring',
          'Native student mobile app',
          'Performance analytics',
          'Administrative automation',
          'AI-assisted assessment',
        ],
      },
    ],
  },
];

/** Inline SVG glyphs — no icon-font request, no sprite sheet, no CLS. */
export const icons = {
  building: '<path d="M3 21h18M5 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16M13 21V9h5a1 1 0 0 1 1 1v11M8 8h2M8 12h2M8 16h2M16 13h1M16 17h1"/>',
  palm: '<path d="M12 21V11M12 11c0-3-2-5-5-5M12 11c0-3 2-5 5-5M12 11c-2.5-1.5-5-1-6.5 1M12 11c2.5-1.5 5-1 6.5 1M12 11a3 3 0 0 1 0-6M4 21h16"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  nodes: '<circle cx="12" cy="5" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/><path d="M12 7v5m0 0-5.2 4M12 12l5.2 4"/>',
  bell: '<path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>',
  chart: '<path d="M3 21h18M6 17V9M11 17V5M16 17v-6M21 17v-9"/>',
  ticket: '<path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4z"/><path d="M13 7v2M13 13v2" stroke-dasharray="2 2"/>',
  academic: '<path d="m12 4 9 5-9 5-9-5 9-5z"/><path d="M6 12v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5"/>',
};
