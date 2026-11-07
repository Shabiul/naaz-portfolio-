/**
 * Careers: the three open roles, taken from the job descriptions HR issued
 * (Sales JD, Marketing campus-hiring JD, Graduate Engineer JD). Wording is
 * condensed, not invented. Compensation is not published in any of them, so
 * none is shown; the page says it is shared during the process.
 *
 * Single source for the visible page (renderCareers) and its JobPosting
 * structured data (renderCareersSchema).
 */

export const careers = {
  apply: { email: 'hello@naazailabs.com', whatsapp: '919448434344' },
  location: 'On-site, Bengaluru, Karnataka',
  perks: [
    ['Real client work', 'Ship for live businesses from your first weeks, not a training sandbox.'],
    ['Agentic AI up close', 'AI agents, voice calling agents, automation and 3D websites, all under one roof.'],
    ['Small team, direct access', 'Work beside the founder, the CTO and the build team every day.'],
    ['Freshers welcome', 'We hire on practical ability and learning speed, not a long list of tools.'],
  ],
};

export const roles = [
  {
    id: 'sde-1',
    title: 'SDE 1',
    fullTitle: 'Software Development Engineer 1 (Graduate Engineer)',
    team: 'Engineering & AI Solutions',
    type: 'Full-time',
    experience: 'Freshers / 0-1 year',
    summary:
      'Build AI agents, websites, custom business software and SEO automation on real client projects. Primary focus is Agentic AI and intelligent automation, backed by hands-on full-stack work.',
    stats: [['Hiring', 'Colleges and freshers'], ['Eligibility', 'Bachelor\'s or final-year*']],
    blocks: [
      {
        h: 'What you will do',
        items: [
          'Develop AI agents that plan and run multi-step tasks using tools, APIs and external services, with validation, retries, logging and human approval where needed.',
          'Integrate large language models into applications, using memory, structured outputs and retrieval workflows where they fit.',
          'Build and maintain responsive websites, web apps and business portals (HTML, CSS, JavaScript, TypeScript, React, Next.js) with backends in Python, FastAPI, Flask or Node.js.',
          'Build CRMs, dashboards, booking systems and workflow tools, with databases, authentication, role-based access, webhooks and scheduled jobs.',
          'Support technical SEO and SEO automation: performance, crawlability, metadata, structured data and Search Console reporting.',
          'Write clean, tested, documented code with Git and GitHub, and use AI coding assistants responsibly.',
        ],
      },
      {
        h: 'What you need',
        items: [
          'Basic to intermediate Python or JavaScript, with fundamentals: data structures, OOP and debugging.',
          'Web basics (HTML, CSS, JavaScript, HTTP), REST APIs and JSON, and basic SQL.',
          'Logical thinking, attention to detail and the ability to read existing code and docs.',
          'Basic Git and GitHub, or the ability to learn quickly.',
        ],
      },
      {
        h: 'A plus',
        items: [
          'Personal projects, hackathons or internships, and a GitHub profile.',
          'React, Next.js, TypeScript, FastAPI, Flask or Node.js.',
          'LLM APIs; LangGraph, LangChain or CrewAI; RAG, embeddings and vector databases.',
          'PostgreSQL, Supabase, Redis, Docker, Vercel or VPS deployments.',
        ],
      },
      {
        h: 'Eligibility',
        items: [
          'Bachelor\'s degree or final-year student in Computer Science, AI, ML, IT or a related field.',
          '*Final-year eligibility depends on the participating college\'s and the company\'s placement requirements.',
        ],
      },
      {
        h: 'Selection process',
        items: [
          'Resume and project screening',
          'Technical assessment',
          'Technical interview',
          'Practical evaluation: a short coding, build, debugging or AI workflow task',
          'Final discussion',
        ],
        ordered: true,
      },
      {
        h: 'Send us',
        items: ['Your updated resume', 'GitHub or portfolio link', 'Details of your projects, and what you built yourself'],
      },
    ],
  },
  {
    id: 'digital-marketing',
    title: 'Digital Marketing & Content Executive',
    fullTitle: 'Digital Marketing & Content Creation Executive',
    team: 'Marketing & Brand Growth',
    type: 'Full-time',
    experience: 'Freshers welcome',
    summary:
      'Research the market, find the angle, write the hook and script, edit the video and learn from the numbers. You grow Naaz AI Labs\' presence with content business owners find useful.',
    stats: [['Hiring', 'Campus hiring'], ['Portfolio', 'Sample edits, reels or scripts']],
    blocks: [
      {
        h: 'What you will do',
        items: [
          'Research competitors and trends across AI, software, automation, SaaS and digital marketing; follow LinkedIn, Instagram and YouTube for topics and formats that fit our audience.',
          'Write hooks, short scripts, headlines, captions and calls to action, turning technical ideas into clear content for business owners.',
          'Edit reels, YouTube Shorts, demos and explainers with subtitles, motion graphics and sound, and repurpose them across platforms.',
          'Keep a content calendar and check product details with the technical team so everything stays accurate.',
          'Track reach, watch time, retention and engagement, compare hooks and formats, and recommend what to change next.',
        ],
      },
      {
        h: 'What you need',
        items: [
          'Real interest in digital marketing, video content, technology and online culture.',
          'Working knowledge of CapCut, Adobe Premiere Pro, DaVinci Resolve or similar.',
          'Good research and writing for hooks, scripts and captions.',
          'An understanding of short-form video on LinkedIn, Instagram and YouTube.',
          'Familiarity with AI tools for research, scripting or editing, and openness to feedback.',
        ],
      },
      {
        h: 'How we judge your work',
        items: [
          'Quality, learning and measurable improvement, not just the number of posts or viral views.',
          'Relevance of your research, strength of hooks and scripts, and steady testing of formats.',
        ],
      },
      {
        h: 'Eligibility',
        items: [
          'Bachelor\'s degree preferred; people from other academic backgrounds with relevant skills may apply.',
          'No prior professional experience needed. Practical ability counts for more than certificates.',
        ],
      },
      {
        h: 'Selection process',
        items: [
          'Resume screening',
          'Portfolio or sample-work review',
          'Creative research task',
          'Practical editing exercise',
          'Interview',
        ],
        ordered: true,
      },
      {
        h: 'Send us',
        items: ['Your resume', 'Sample edits, reels, scripts, college projects or personal content'],
      },
    ],
  },
  {
    id: 'business-development-associate',
    title: 'Business Development Associate',
    fullTitle: 'Business Development Associate (Sales Executive, Technology Solutions & Client Relations)',
    team: 'Sales & Business Development',
    type: 'Full-time',
    experience: 'Freshers and experienced candidates welcome',
    summary:
      'Own the sales journey: find businesses, understand what they need, recommend the right service, negotiate and close, then hand over cleanly to the delivery team.',
    stats: [['Hiring', 'Freshers and experienced'], ['Assessment', 'Mock cold call and sales exercise']],
    blocks: [
      {
        h: 'What you will do',
        items: [
          'Work toward a daily target of 150 connected calls and reach prospects through cold calling, LinkedIn, directories, research and referrals.',
          'Qualify leads on need, budget, decision authority and timeline, and keep a tidy follow-up schedule.',
          'Learn our portfolio (Agentic AI, AI voice agents, automation, custom software, 3D websites, Android apps, CRM, ERP, SEO) and recommend what fits each client.',
          'Capture requirements, check feasibility with the technical team, and make sure proposals match what was discussed.',
          'Prepare proposals and presentations, negotiate within approved pricing, and coordinate contracts, invoicing and advance payments.',
          'Hand over requirements and timelines to delivery, and look for repeat business, referrals and upsell opportunities.',
          'Keep CRM records accurate and send daily reports and pipeline updates.',
        ],
      },
      {
        h: 'What you need',
        items: [
          'Strong verbal communication and active listening.',
          'Confidence in cold calling, negotiation and handling objections.',
          'Good organisation, follow-up discipline and the ability to manage several opportunities.',
          'Basic comfort with CRM tools, spreadsheets and email, and a willingness to learn AI, software and digital growth services.',
        ],
      },
      {
        h: 'How you will be measured',
        items: [
          'Daily connected calls, qualified leads and meetings.',
          'Proposals submitted, deals closed and revenue.',
          'Follow-up completion, CRM accuracy and quality of client handover.',
          'Repeat business and referrals.',
        ],
      },
      {
        h: 'Eligibility',
        items: [
          'Bachelor\'s degree preferred.',
          'Freshers may apply. B2B sales, business development, SaaS or IT services sales, client servicing or technology consulting experience is an advantage.',
        ],
      },
      {
        h: 'Selection process',
        items: ['Interview', 'Mock cold call', 'Client-handling scenario', 'Practical sales exercise'],
        ordered: true,
      },
      {
        h: 'Send us',
        items: ['Your resume', 'A line on any sales, client or outreach work you have done'],
      },
    ],
  },
];
