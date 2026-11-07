import { prefersReducedMotion } from '../core/env.js';

/**
 * Lynq handoff simulator — a zero-backend preview of what Lynq does with an
 * enquiry, rendered by render.js (renderLynqSimulator) on the home and Lynq
 * pages. Two channels:
 *
 *   WhatsApp chat   a four-message exchange plays out with typing dots
 *   Voice call      the same enquiry as a phone call, spoken aloud with the
 *                   browser's own speech synthesis (caller and Lynq in
 *                   different voices; Hindi lines in a Hindi voice where the
 *                   browser has one), with a call timer, a waveform for
 *                   whoever is talking and a live transcript. Mute and replay
 *                   are on the call. Without speech support it still plays,
 *                   silently, at speaking pace.
 *
 * Either way the detected language, the CRM fields, the lead score and the
 * calendar slot fill in as the conversation gives them away. Switching
 * scenario or channel cancels what's playing. Nothing is sent anywhere; the
 * scenarios are illustrative and the page says so. Sound only ever starts
 * from a click (a scenario, the channel switch or "Play the call").
 */

const SCENARIOS = {
  'real-estate': {
    contact: 'Ravi · +91 98xxx xx210',
    time: '10:45 PM',
    lang: 'Kannada + English',
    industry: 'real-estate',
    messages: [
      ['in', 'Namaskara! JP Nagar alli 30×40 plot price eshtu? Sunday site visit sigutta?'],
      ['out', 'Namaskara Ravi! 30×40 plots in JP Nagar Phase 9 start at ₹1.2 Cr. What budget are you looking at?'],
      ['in', 'Around 1.3 Cr. Sunday morning is best for us.'],
      ['out', 'Done ✅ Sunday 10:30 AM site visit booked with Arjun. Location pin and brochure sent here.'],
    ],
    voice: {
      lang: 'en-IN',
      lines: [
        ['in', 'Hello, I saw your JP Nagar plots. What is the price for a thirty by forty?'],
        ['out', 'Namaskara, thanks for calling! Thirty by forty plots in JP Nagar Phase nine start at one point two crore. What budget are you working with?'],
        ['in', 'Around one point three crore. Can we see it this Sunday morning?'],
        ['out', 'Done. Your site visit is booked for Sunday at ten thirty with Arjun, and I have sent the location to your WhatsApp.'],
      ],
    },
    fields: { Name: 'Ravi', Budget: '₹1.3 Cr', Intent: '30×40 plot · site visit' },
    score: 94,
    slot: 'Sun · 10:30 AM · Site visit with Arjun',
  },
  resort: {
    contact: 'Meera · +91 99xxx xx478',
    time: '2:07 AM',
    lang: 'English',
    industry: 'resort',
    messages: [
      ['in', 'Hi! Is a pool villa free this weekend for two? It’s our anniversary 🙂'],
      ['out', 'Happy anniversary! The Pool Villa is open Sat–Sun. Couple package with a candlelight dinner: ₹18,500 for 2 nights.'],
      ['in', 'Perfect. Can you hold it till morning? We’ll pay by 10.'],
      ['out', 'Held till 10:00 AM ✅ Payment link sent. I’ll remind you at 9:00.'],
    ],
    voice: {
      lang: 'en-IN',
      lines: [
        ['in', 'Hi, sorry for calling so late. Is the pool villa free this weekend? It is our anniversary.'],
        ['out', 'Happy anniversary! The pool villa is open on Saturday and Sunday. The couple package with a candlelight dinner is eighteen thousand five hundred rupees for two nights.'],
        ['in', 'Perfect. Can you hold it till the morning? We will pay by ten.'],
        ['out', 'It is held until ten A M. I have sent the payment link to your WhatsApp, and I will remind you at nine.'],
      ],
    },
    fields: { Name: 'Meera', Budget: '₹18,500', Intent: 'Pool villa · anniversary weekend' },
    score: 91,
    slot: 'Sat check-in · hold until 10:00 AM',
  },
  healthcare: {
    contact: 'Priya · +91 97xxx xx902',
    time: '8:12 AM',
    lang: 'Hindi + English',
    industry: 'other',
    messages: [
      ['in', 'Namaste, aaj dermatologist ka appointment mil sakta hai?'],
      ['out', 'Namaste! Dr. Sana (Dermatology) has slots today at 4:30 PM and 6:00 PM. Kaunsa time chalega?'],
      ['in', '4:30 theek hai. Name: Priya Sharma.'],
      ['out', 'Confirmed ✅ 4:30 PM with Dr. Sana. Clinic location and a prep note sent. Reminder one hour before.'],
    ],
    voice: {
      lang: 'hi-IN',
      lines: [
        ['in', 'नमस्ते, क्या आज डर्मेटोलॉजिस्ट का अपॉइंटमेंट मिल सकता है?'],
        ['out', 'नमस्ते! डॉक्टर सना के पास आज साढ़े चार बजे और छह बजे के स्लॉट हैं। कौन सा समय ठीक रहेगा?'],
        ['in', 'साढ़े चार बजे ठीक है। मेरा नाम प्रिया शर्मा है।'],
        ['out', 'कन्फर्म हो गया। साढ़े चार बजे डॉक्टर सना के साथ। लोकेशन और रिमाइंडर आपके व्हाट्सऐप पर भेज दिया है।'],
      ],
      // For browsers without a Hindi voice: the same call in romanised Hinglish, read in English.
      alt: {
        lang: 'en-IN',
        lines: [
          ['in', 'Namaste, kya aaj dermatologist ka appointment mil sakta hai?'],
          ['out', 'Namaste! Doctor Sana ke paas aaj saadhe chaar baje aur chhe baje ke slots hain. Kaunsa time theek rahega?'],
          ['in', 'Saadhe chaar baje theek hai. Mera naam Priya Sharma hai.'],
          ['out', 'Confirm ho gaya. Saadhe chaar baje Doctor Sana ke saath. Location aur reminder aapke WhatsApp par bhej diya hai.'],
        ],
      },
    },
    fields: { Name: 'Priya Sharma', Budget: 'Consultation', Intent: 'Same-day dermatology' },
    score: 96,
    slot: 'Today · 4:30 PM · Dr. Sana',
  },
};

const speech = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window ? window.speechSynthesis : null;

const wait = (ms, signal) =>
  new Promise((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => { clearTimeout(t); reject(new Error('aborted')); }, { once: true });
  });

/** Two different voices for a language (caller, Lynq), falling back to English. */
function voicesFor(lang) {
  const all = speech?.getVoices() ?? [];
  const exact = all.filter((v) => v.lang?.replace('_', '-').toLowerCase() === lang.toLowerCase());
  const family = all.filter((v) => v.lang?.toLowerCase().startsWith(lang.slice(0, 2)));
  const english = all.filter((v) => v.lang?.toLowerCase().startsWith('en'));
  const pool = exact.length ? exact : family.length ? family : english;
  return { caller: pool[1] ?? pool[0] ?? null, lynq: pool[0] ?? null };
}

export default function lynqSim(root) {
  const $ = (sel) => root.querySelector(sel);
  const pills = [...root.querySelectorAll('[data-scenario]')];
  const modes = [...root.querySelectorAll('[data-sim-mode]')];
  const log = $('[data-sim-log]');
  const call = $('[data-sim-call]');
  const callState = $('[data-sim-call-state]');
  const callWho = $('[data-sim-call-who]');
  const callTimer = $('[data-sim-call-timer]');
  const wave = $('[data-sim-wave]');
  const transcript = $('[data-sim-transcript]');
  const replay = $('[data-sim-replay]');
  const mute = $('[data-sim-mute]');
  const channel = $('[data-sim-channel]');
  const contact = $('[data-sim-contact]');
  const time = $('[data-sim-time]');
  const lang = $('[data-sim-lang]');
  const fields = $('[data-sim-fields]');
  const score = $('[data-sim-score]');
  const scoreBar = $('[data-sim-score-bar]');
  const slot = $('[data-sim-slot]');
  const cta = $('[data-sim-cta]');
  let controller = null;
  let scenario = pills[0].dataset.scenario;
  let mode = 'chat';
  let muted = false;
  let clock = 0;

  if (!speech) mute.hidden = true;
  speech?.getVoices(); // starts the browser loading its voice list

  /* --- Shared: the CRM side ------------------------------------------------------ */
  function reset(s) {
    controller?.abort();
    speech?.cancel();
    clearInterval(clock);
    log.replaceChildren();
    transcript.replaceChildren();
    contact.textContent = s.contact;
    time.textContent = s.time;
    callWho.textContent = s.contact;
    callTimer.textContent = '00:00';
    wave.dataset.who = '';
    lang.textContent = 'Detecting…';
    lang.classList.remove('is-on');
    fields.querySelectorAll('dd').forEach((dd) => { dd.textContent = '—'; dd.classList.remove('is-on'); });
    score.textContent = '—';
    scoreBar.style.scale = '0 1';
    slot.textContent = 'Waiting…';
    slot.classList.remove('is-on');
    cta.href = `/contact.html?product=lynq&industry=${s.industry}`;
  }
  function fill(s, key) {
    const dd = fields.querySelector(`[data-field="${key}"]`);
    dd.textContent = s.fields[key];
    dd.classList.add('is-on');
  }
  // What the CRM learns after message i of the four.
  function learn(s, i) {
    if (i === 0) {
      lang.textContent = mode === 'voice' ? `${s.lang} · voice` : s.lang;
      lang.classList.add('is-on');
      fill(s, 'Name');
    }
    if (i === 1) fill(s, 'Intent');
    if (i === 2) {
      fill(s, 'Budget');
      score.textContent = `HOT (${s.score}/100)`;
      scoreBar.style.scale = `${s.score / 100} 1`;
    }
    if (i === 3) {
      slot.textContent = s.slot;
      slot.classList.add('is-on');
    }
  }

  /* --- Chat --------------------------------------------------------------------------- */
  function bubble(dir, text) {
    const li = document.createElement('li');
    li.className = `sim__msg sim__msg--${dir}`;
    li.textContent = text;
    log.append(li);
    log.scrollTop = log.scrollHeight;
  }
  function typing(dir) {
    const li = document.createElement('li');
    li.className = `sim__msg sim__msg--${dir} sim__typing`;
    li.setAttribute('aria-hidden', 'true');
    li.innerHTML = '<span></span><span></span><span></span>';
    log.append(li);
    log.scrollTop = log.scrollHeight;
    return li;
  }
  async function runChat(s, signal) {
    if (prefersReducedMotion) {
      s.messages.forEach(([dir, text], i) => { bubble(dir, text); learn(s, i); });
      return;
    }
    for (const [i, [dir, text]] of s.messages.entries()) {
      const dots = typing(dir);
      await wait(dir === 'out' ? 900 : 650, signal);
      dots.remove();
      bubble(dir, text);
      learn(s, i);
      await wait(500, signal);
    }
  }

  /* --- Voice ---------------------------------------------------------------------------- */
  function say(text, who, voiceLang, signal) {
    return new Promise((resolve, reject) => {
      const pace = Math.max(1500, text.length * 60); // silent fallback at speaking pace
      if (!speech || muted) {
        const t = setTimeout(resolve, pace);
        signal.addEventListener('abort', () => { clearTimeout(t); reject(new Error('aborted')); }, { once: true });
        return;
      }
      const u = new SpeechSynthesisUtterance(text);
      const v = voicesFor(voiceLang);
      u.lang = voiceLang;
      u.voice = who === 'out' ? v.lynq : v.caller;
      u.rate = who === 'out' ? 1.03 : 0.97;
      u.pitch = who === 'out' ? 1.12 : 0.88;
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        clearTimeout(guard);
        resolve();
      };
      // Some browsers never fire `end`; don't let the call hang on it.
      const guard = setTimeout(finish, pace + 4000);
      u.onend = finish;
      u.onerror = finish;
      signal.addEventListener('abort', () => { done = true; clearTimeout(guard); speech.cancel(); reject(new Error('aborted')); }, { once: true });
      speech.speak(u);
    });
  }
  function line(dir, text) {
    const li = document.createElement('li');
    li.className = `sim__line sim__line--${dir}`;
    li.innerHTML = `<span>${dir === 'out' ? 'Lynq AI' : 'Caller'}</span>`;
    li.append(document.createTextNode(text));
    transcript.append(li);
    transcript.scrollTop = transcript.scrollHeight;
  }
  async function runVoice(s, signal) {
    callState.textContent = 'Incoming call…';
    call.dataset.state = 'ringing';
    replay.hidden = true;
    await wait(prefersReducedMotion ? 0 : 1400, signal);
    callState.textContent = 'Lynq answered';
    call.dataset.state = 'live';
    const began = Date.now();
    clock = setInterval(() => {
      const sec = Math.floor((Date.now() - began) / 1000);
      callTimer.textContent = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
    }, 500);
    // A Hindi call needs a Hindi voice; without one, play the romanised version.
    const hasVoice = (speech?.getVoices() ?? []).some((v) => v.lang?.toLowerCase().startsWith(s.voice.lang.slice(0, 2)));
    const script = !hasVoice && s.voice.alt ? s.voice.alt : s.voice;
    for (const [i, [dir, text]] of script.lines.entries()) {
      wave.dataset.who = dir;
      line(dir, text);
      await say(text, dir, script.lang, signal);
      wave.dataset.who = '';
      learn(s, i);
      await wait(350, signal);
    }
    clearInterval(clock);
    callState.textContent = 'Call ended · summary saved to CRM';
    call.dataset.state = 'ended';
    replay.textContent = '↻ Replay the call';
    replay.hidden = false;
  }

  /* --- Control -------------------------------------------------------------------------- */
  async function run() {
    const s = SCENARIOS[scenario];
    pills.forEach((p) => p.setAttribute('aria-selected', String(p.dataset.scenario === scenario)));
    modes.forEach((m) => m.setAttribute('aria-pressed', String(m.dataset.simMode === mode)));
    root.dataset.mode = mode;
    log.hidden = mode === 'voice';
    call.hidden = mode !== 'voice';
    channel.textContent = mode === 'voice' ? 'Phone · Lynq AI answering' : 'WhatsApp · Lynq AI replying';
    reset(s);
    controller = new AbortController();
    try {
      await (mode === 'voice' ? runVoice(s, controller.signal) : runChat(s, controller.signal));
    } catch {
      /* switched scenario or channel mid-play */
    }
  }

  pills.forEach((p) => p.addEventListener('click', () => { scenario = p.dataset.scenario; run(); }));
  modes.forEach((m) => m.addEventListener('click', () => { mode = m.dataset.simMode; run(); }));
  replay.addEventListener('click', run);
  mute.addEventListener('click', () => {
    muted = !muted;
    mute.setAttribute('aria-pressed', String(muted));
    mute.textContent = muted ? 'Unmute' : 'Mute';
    if (muted) speech?.cancel(); // the line in progress finishes silently
  });

  // Play the chat once when the simulator first comes into view (sound only ever starts from a click).
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    if (mode === 'chat') run();
  }, { threshold: 0.35 });
  io.observe(root);
  // Leaving the page mid-call: stop talking.
  window.addEventListener('pagehide', () => speech?.cancel());
}
