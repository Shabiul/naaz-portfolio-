/**
 * Services and indicative pricing.
 *
 * Sourced from the studio's company profile (October 2026): the twenty
 * services on the "Our Services" page, the three website packages and the
 * "Other services" price list on the "Pricing" page, and the pricing terms.
 * Each service carries a 24×24 line `icon` (stroke-only, drawn in on reveal).
 * A service with no `price` has no published figure — it renders without one
 * rather than with a guessed number. All prices INR, indicative, scope-based.
 */

export const serviceGroups = [
  {
    id: 'build',
    label: 'Build',
    range: '01 – 10',
    summary: 'The website your customers see, and the software and AI your team runs on.',
    services: [
      { name: 'Website Development', icon: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 8.5h18M6.5 6.2h.01M9 6.2h.01M7 13h6M7 16h10"/>', text: 'Responsive websites with dynamic content.', price: '₹15,000 – ₹40,000' },
      { name: 'Website Admin Panels', icon: '<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>', text: 'Manage your website content yourself.', price: '₹45,000 – ₹60,000' },
      { name: '3D Website Development', icon: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m12 12 8-4.5M12 12v9M12 12 4 7.5"/>', text: '3D visuals, animation and interaction.', price: '₹70,000 – ₹1,00,000' },
      { name: 'Web Application Development', icon: '<rect x="3" y="3" width="7.5" height="9" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="5" rx="1.5"/><rect x="13.5" y="11" width="7.5" height="10" rx="1.5"/><rect x="3" y="15" width="7.5" height="6" rx="1.5"/>', text: 'Platforms, dashboards, portals and tools.', price: '₹50,000 – ₹70,000' },
      { name: 'Mobile App Development', icon: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>', text: 'Scoped by platform, features and backend.', price: '₹70,000 – ₹7,00,000' },
      { name: 'CRM Development', icon: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18.5 14.8c1.6.8 2.6 2.5 3 5.2"/>', text: 'Leads, customers, follow-ups and sales workflows.', price: '₹15,000 – ₹60,000' },
      { name: 'WhatsApp Chatbots & Automation', icon: '<path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/><path d="M9 10h6M9 13.5h4"/>', text: 'Enquiries, lead capture and bookings.', price: 'From ₹15,000' },
      { name: 'AI Voice Calling Agents', icon: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/>', text: 'AI voice agents for customer calls.' },
      { name: 'Multi-Agent AI Infrastructure', icon: '<circle cx="12" cy="5" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/><circle cx="12" cy="12" r="2"/><path d="M12 7v3M10.4 13.2l-3.8 3.4M13.6 13.2l3.8 3.4"/>', text: 'Coordinated AI agents behind workflows.', price: 'Priced on complexity' },
      { name: 'Workflow Automation', icon: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 9M20 4v5h-5M20 12a8 8 0 0 1-13.7 5.6L4 15M4 20v-5h5"/>', text: 'Repeatable processes automated end to end.' },
    ],
  },
  {
    id: 'grow',
    label: 'Connect & Grow',
    range: '11 – 20',
    summary: 'Getting found, getting enquiries, and connecting your systems to everything else.',
    services: [
      { name: 'Booking & Enquiry Systems', icon: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4M8.5 15.5l2 2 4.5-4.5"/>', text: 'Capture enquiries and manage bookings.' },
      { name: 'SEO Services', icon: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.8-4.8M7.5 12.5l2-2 1.5 1.5 2.5-3"/>', text: 'Technical, on-page, content and local SEO.', price: '₹5,000 – ₹25,000' },
      { name: 'Generative Engine Optimization', icon: '<path d="M11 3c.4 3.6 2.4 5.6 6 6-3.6.4-5.6 2.4-6 6-.4-3.6-2.4-5.6-6-6 3.6-.4 5.6-2.4 6-6z"/><path d="M18 14.5c.2 1.6 1 2.4 2.5 2.5-1.5.1-2.3.9-2.5 2.5-.2-1.6-1-2.4-2.5-2.5 1.5-.1 2.3-.9 2.5-2.5z"/>', text: 'Visibility in AI-generated answers.' },
      { name: 'Google Business Profile', icon: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>', text: 'Setup and optimisation for local visibility.', price: '₹2,000 – ₹3,000' },
      { name: 'Google Ads Management', icon: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>', text: 'Campaign setup and management.', price: 'Custom pricing · ad spend separate' },
      { name: 'Meta Ads Management', icon: '<path d="M3 10v4h3l7 5V5L6 10z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>', text: 'Facebook and Instagram campaigns.', price: 'Custom pricing · ad spend separate' },
      { name: 'Logo & Brand Identity Design', icon: '<path d="M4 20l3.5-1 11-11a2.1 2.1 0 0 0-3-3l-11 11z"/><path d="M14 6.5l3 3M4 20h16"/>', text: 'A logo built on your brand identity.', price: '₹3,000 – ₹5,000' },
      { name: 'Custom Software Development', icon: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>', text: 'Software built around your workflow.', price: 'Priced on complexity' },
      { name: 'Website-to-WhatsApp Integrations', icon: '<rect x="2.5" y="4" width="11" height="9" rx="1.5"/><path d="M13.5 8.5H17M15.5 6.5l2 2-2 2"/><path d="M14 20.5l.9-2.6A5 5 0 1 1 17 20z"/>', text: 'Website enquiries straight to WhatsApp.' },
      { name: 'API & Third-Party Integrations', icon: '<path d="M9 2.5v5M15 2.5v5M6 7.5h12v3a6 6 0 0 1-12 0zM12 16.5v5"/>', text: 'Your systems connected to other services.' },
    ],
  },
];

/** The three website packages, in escalating order. */
export const websitePackages = [
  {
    name: 'Premium Dynamic Website',
    price: '₹15,000 – ₹40,000',
    features: ['Responsive design', 'Modern page layouts', 'Contact & enquiry forms', 'Basic on-page SEO', 'Dynamic content where required'],
  },
  {
    name: 'Website with Admin Panel',
    price: '₹45,000 – ₹60,000',
    features: ['Content management', 'Admin dashboard', 'Editable website sections', 'Structured data management', 'Scalable architecture'],
  },
  {
    name: '3D Website Development',
    price: '₹70,000 – ₹1,00,000',
    features: ['Immersive visual experiences', '3D elements & animations', 'Interactive storytelling', 'Premium visual presentation'],
  },
];

export const pricingTerms = [
  'All prices are indicative and quoted in INR.',
  'Final pricing depends on scope, features, integrations and design complexity.',
  'Domain, hosting, paid APIs, third-party tools and ad budgets are charged separately.',
  'Maintenance and support are quoted to the agreed scope.',
  'Timelines and payment milestones are confirmed before work begins.',
];

/** The six-step summary of how an engagement runs (the full process page has thirteen). */
export const howWeWork = ['Discover', 'Strategize', 'Design', 'Develop', 'Test & Launch', 'Support & Improve'];

export const audiences = [
  ['B2B', 'Business to business'],
  ['B2C', 'Business to consumer'],
  ['D2C', 'Direct to consumer'],
];
