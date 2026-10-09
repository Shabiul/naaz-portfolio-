/**
 * Company facts — the single source of truth for anything that appears in more
 * than one place (contact details, guarantees, product plans).
 *
 * Sourced from real Naaz AI Labs collateral: the Lynq pricing proposal (May
 * 2026), the WhatsApp automation proposal, and proposal NAL-2026-014.
 * If a detail changes, change it here — not in eight HTML files.
 */

export const company = {
  name: 'Naaz AI Labs',
  founder: 'Mohammed Rayhan',
  founderRole: 'Founder & CEO',
  email: 'hello@naazailabs.com',
  emailShort: 'hello@naazailabs.com',
  location: 'JP Nagar, Bengaluru',
  region: 'Karnataka, India',
  hours: 'Mon–Sat · 10am–7pm IST',
  site: 'www.naazailabs.com',
  product: 'lynq.naazailabs.com',
  linkedin: 'https://www.linkedin.com/company/naaz-ai-labs',
  instagram: 'https://www.instagram.com/naazailabs',
};

/**
 * Leadership beyond the founder. Names and titles are given; the taglines
 * describe the remit of each role, nothing more — no invented tenure,
 * former employers, or numbers.
 */
export const team = [
  {
    name: 'Mohammed Rayan',
    role: 'CTO',
    initials: 'MR',
    tagline: 'Owns how every system is architected — built to last, not just to demo.',
  },
  {
    name: 'Tasmia Kouser',
    role: 'Branch Head',
    initials: 'TK',
    tagline: 'Runs delivery and the client relationship end to end, project to project.',
  },
  {
    name: 'Shabiul Hasnain Siddiqui',
    role: 'Technical Head',
    initials: 'SH',
    tagline: 'Leads the build team — code review, quality, and getting it shipped.',
  },
];

/**
 * Commitments that appear on the proposals as contractual terms. These are
 * real promises the business already makes in writing, which is exactly why
 * they belong on the site — they are the strongest trust signal available.
 */
export const guarantees = [
  {
    value: '7',
    unit: 'days',
    label: 'To go live',
    detail: 'From advance payment to a working system on your own WhatsApp number.',
  },
  {
    value: '0',
    unit: '',
    label: 'Lock-in',
    detail: 'Monthly plans cancel with 15 days written notice. No annual trap.',
  },
  {
    value: '100',
    unit: '%',
    label: 'Refund if not live',
    detail: 'If the system does not go live, you pay nothing. In writing, on every proposal.',
  },
  {
    value: '6',
    unit: '',
    label: 'Indian languages',
    detail: 'English, Hindi, Kannada, Tamil and more — detected automatically mid-conversation.',
  },
];

/**
 * Lynq — the productised platform. Distinct from the bespoke industry builds
 * in industries.js: this is a fixed monthly subscription, not a project.
 * Prices exclude GST (18%), matching the proposal.
 */
export const lynqPlans = [
  {
    name: 'Receptionist',
    channel: 'Chat only',
    price: '₹11,999',
    annual: '₹10,199',
    setup: '₹4,999 · waived on annual',
    summary: 'AI chatbot on WhatsApp and your website.',
    features: [
      'WhatsApp AI chatbot, 24/7',
      'Website chat widget',
      'Auto-answers FAQs from your documents',
      'Captures leads to CRM automatically',
      'Books appointments via chat',
      'Appointment reminders sent automatically',
      'Shared team inbox',
      'Personal setup by our team',
    ],
    limits: [
      ['WhatsApp AI replies', '5,000 / mo'],
      ['Broadcast messages', '1,500 / mo'],
      ['Contacts', '1,000'],
      ['Knowledge base', '25 docs'],
      ['Voice minutes', 'Not included'],
      ['Languages', 'Hindi'],
    ],
  },
  {
    name: 'Sales Associate',
    channel: 'Chat + Voice',
    price: '₹29,999',
    annual: '₹25,499',
    setup: '₹14,999 · waived on annual',
    summary: 'Chat plus AI phone calls that qualify and close.',
    popular: true,
    features: [
      'Everything in Receptionist',
      'AI answers and makes phone calls',
      'Scores leads Hot / Warm / Cold automatically',
      'Sales pipeline and deal tracking',
      'Outbound call campaigns',
      'Onboarding call with the founder',
    ],
    limits: [
      ['WhatsApp AI replies', '8,000 / mo'],
      ['Broadcast messages', '4,000 / mo'],
      ['Contacts', '25,000'],
      ['Knowledge base', '500 docs'],
      ['Voice minutes', '1,000 / mo'],
      ['Languages', 'Hindi, Tamil, Kannada'],
    ],
  },
  {
    name: 'Sales Manager',
    channel: 'All channels',
    price: '₹74,999',
    annual: '₹63,749',
    setup: '₹49,999',
    summary: 'A full AI workforce — chat, voice, and automation.',
    enterprise: true,
    features: [
      'Everything in Sales Associate',
      'Multiple AI agents working together',
      'Unlimited contacts and broadcasts',
      'White-label — your brand, your domain',
      'Custom AI trained on your data',
      'Dedicated success manager',
      'We build your workflows for you',
    ],
    limits: [
      ['WhatsApp AI replies', 'Unlimited'],
      ['Broadcast messages', 'Unlimited'],
      ['Contacts', 'Unlimited'],
      ['Knowledge base', 'Unlimited'],
      ['Voice minutes', '3,000 / mo'],
      ['Languages', '6 languages'],
    ],
  },
];
