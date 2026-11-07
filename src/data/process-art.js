/**
 * Process page illustrations and the "what you get" lines, one per phase, in
 * the same order as processSteps.
 *
 * Each picture is a flat vector scene on a 320×220 canvas, in the brand palette.
 * Class key (see process.css): n midnight · s steel · g mid-steel · l light steel ·
 * p pale steel · i ivory · w white · e espresso · k skin · ln outline stroke.
 * Pieces pop in one after another when the step scrolls into view; .bob floats.
 */

export const processMeta = [
  { time: '1–2 days', gets: ['Goals brief', 'Process map'] },
  { time: '2–3 days', gets: ['Competitor review', 'Customer insights'] },
  { time: '2 days', gets: ['Requirements list', 'Risk register'] },
  { time: '3–5 days', gets: ['Every screen, mapped', 'Sign-off before code'] },
  { time: '3–5 days', gets: ['User flows', 'Edge-case states'] },
  { time: '1 week', gets: ['Design system', 'Every component, every state'] },
  { time: '3–5 days', gets: ['Clickable prototype', 'User feedback'] },
  { time: '2–3 weeks', gets: ['Responsive build', 'Accessible by default'] },
  { time: '2–4 weeks', gets: ['APIs and data', 'AI layer, integrations'] },
  { time: '1 week', gets: ['Cross-device passes', 'Security checks'] },
  { time: '1 day', gets: ['Zero-downtime release', 'Backups and rollback'] },
  { time: 'Ongoing', gets: ['Usage dashboards', 'Monthly iteration'] },
  { time: 'Ongoing', gets: ['Maintenance', 'A team that knows you'] },
];

export const processArt = [
  // 01 Discovery — a shopfront under a magnifying glass
  `<circle class="p bg" cx="160" cy="112" r="98"/><ellipse class="sh" cx="140" cy="186" rx="86" ry="9"/>
   <rect class="w" x="62" y="98" width="130" height="86" rx="4"/><rect class="p" x="72" y="130" width="40" height="54"/><rect class="n" x="78" y="136" width="28" height="48" rx="2"/><rect class="p" x="124" y="122" width="58" height="36" rx="3"/><rect class="l" x="130" y="128" width="46" height="24" rx="2"/>
   <path class="s" d="M54 100l10-30h116l10 30z"/><path class="i" d="M76 70h20l-4 30H72zM116 70h20l-2 30h-20zM156 70h20l2 30h-20z"/><path class="n" d="M54 100h136v6a11 11 0 0 1-22 0 11 11 0 0 1-22 0 11 11 0 0 1-22 0 11 11 0 0 1-22 0 11 11 0 0 1-22 0 11 11 0 0 1-12-6z"/>
   <g class="bob"><circle class="p" cx="224" cy="112" r="38"/><circle class="ln" cx="224" cy="112" r="38"/><path class="ln w" d="M202 100a26 26 0 0 1 20-18"/><path class="e" d="M250 140l28 32a8 8 0 0 1-12 10l-30-30z"/><circle class="s" cx="266" cy="52" r="6"/><path class="g" d="M280 78l4 9 9 4-9 4-4 9-4-9-9-4 9-4z"/></g>`,
  // 02 Research — a chart card, a map pin and a donut
  `<circle class="p bg" cx="160" cy="112" r="98"/><ellipse class="sh" cx="160" cy="188" rx="92" ry="9"/>
   <rect class="w" x="52" y="52" width="176" height="122" rx="12"/><rect class="l" x="68" y="66" width="52" height="8" rx="4"/><rect class="p" x="68" y="80" width="30" height="6" rx="3"/>
   <rect class="l" x="72" y="130" width="22" height="30" rx="3"/><rect class="g" x="102" y="112" width="22" height="48" rx="3"/><rect class="s" x="132" y="122" width="22" height="38" rx="3"/><rect class="n" x="162" y="96" width="22" height="64" rx="3"/><rect class="s" x="192" y="108" width="22" height="52" rx="3"/>
   <path class="ln e" d="M76 112l32-26 30 14 32-30 40 12"/><circle class="e" cx="76" cy="112" r="4.5"/><circle class="e" cx="108" cy="86" r="4.5"/><circle class="e" cx="138" cy="100" r="4.5"/><circle class="e" cx="170" cy="70" r="4.5"/>
   <g class="bob"><path class="n" d="M250 36a24 24 0 0 1 24 24c0 20-24 44-24 44s-24-24-24-44a24 24 0 0 1 24-24z"/><circle class="i" cx="250" cy="60" r="9"/></g>
   <g class="bob2"><circle class="s" cx="262" cy="148" r="26"/><path class="i" d="M262 148V122a26 26 0 0 1 26 26z"/><circle class="w" cx="262" cy="148" r="12"/></g>`,
  // 03 Business Analysis — a clipboard and a pie chart
  `<circle class="p bg" cx="160" cy="112" r="98"/><ellipse class="sh" cx="150" cy="190" rx="88" ry="9"/>
   <rect class="e" x="66" y="38" width="124" height="150" rx="12"/><rect class="w" x="76" y="54" width="104" height="124" rx="6"/><rect class="n" x="104" y="30" width="48" height="20" rx="8"/>
   <rect class="s" x="86" y="72" width="16" height="16" rx="4"/><path class="ln i" d="M89 80l4 4 7-9"/><rect class="l" x="110" y="76" width="58" height="8" rx="4"/>
   <rect class="s" x="86" y="100" width="16" height="16" rx="4"/><path class="ln i" d="M89 108l4 4 7-9"/><rect class="l" x="110" y="104" width="46" height="8" rx="4"/>
   <rect class="p" x="86" y="128" width="16" height="16" rx="4"/><rect class="p" x="110" y="132" width="52" height="8" rx="4"/>
   <g class="bob"><circle class="g" cx="228" cy="128" r="42"/><path class="n" d="M228 128V86a42 42 0 0 1 36 62z"/><path class="s" d="M228 128l36 20a42 42 0 0 1-36 22z"/><circle class="i" cx="228" cy="128" r="12"/><circle class="e" cx="262" cy="64" r="7"/><circle class="l" cx="280" cy="86" r="4"/></g>`,
  // 04 Wireframes — a browser of grey boxes and a pencil
  `<circle class="p bg" cx="160" cy="112" r="98"/><ellipse class="sh" cx="160" cy="190" rx="100" ry="9"/>
   <rect class="w" x="42" y="40" width="210" height="140" rx="12"/><path class="n" d="M42 52a12 12 0 0 1 12-12h186a12 12 0 0 1 12 12v14H42z"/><circle class="l" cx="58" cy="53" r="4"/><circle class="g" cx="72" cy="53" r="4"/><circle class="p" cx="86" cy="53" r="4"/>
   <rect class="p" x="58" y="80" width="88" height="52" rx="6"/><path class="ln g" d="M58 80l88 52M146 80l-88 52"/>
   <rect class="l" x="160" y="82" width="76" height="9" rx="4"/><rect class="p" x="160" y="98" width="62" height="9" rx="4"/><rect class="p" x="160" y="114" width="70" height="9" rx="4"/>
   <rect class="p" x="58" y="144" width="56" height="22" rx="6"/><rect class="p" x="122" y="144" width="56" height="22" rx="6"/><rect class="s" x="186" y="144" width="50" height="22" rx="11"/>
   <g class="bob"><path class="e" d="M262 70l16 16-70 70-20 6 6-20z"/><path class="l" d="M262 70l16 16-8 8-16-16z"/><path class="n" d="M188 162l-6 20 20-6z"/></g>`,
  // 05 UX Design — a flow of decisions
  `<circle class="p bg" cx="160" cy="112" r="98"/><ellipse class="sh" cx="160" cy="192" rx="100" ry="8"/>
   <path class="ln s" d="M104 84h30M202 84h34M168 116v26"/><path class="s" d="M136 84l-8-6v12zM238 84l-8-6v12zM168 142l-6-8h12z"/>
   <rect class="n" x="40" y="62" width="64" height="44" rx="22"/><circle class="i" cx="62" cy="82" r="7"/><path class="i" d="M52 98a10 10 0 0 1 20 0z"/><rect class="l" x="80" y="78" width="16" height="6" rx="3"/>
   <path class="s" d="M168 52l34 32-34 32-34-32z"/><path class="ln i" d="M160 80a8 8 0 1 1 8 10v4"/><circle class="i" cx="168" cy="102" r="2.5"/>
   <rect class="w" x="238" y="62" width="58" height="44" rx="8"/><rect class="g" x="246" y="70" width="42" height="8" rx="4"/><rect class="l" x="246" y="84" width="30" height="6" rx="3"/>
   <rect class="g" x="136" y="146" width="64" height="34" rx="17"/><path class="ln i" d="M156 163h24m-5-5l5 5-5 5"/>
   <g class="bob"><circle class="e" cx="62" cy="34" r="7"/><circle class="l" cx="260" cy="40" r="5"/></g>`,
  // 06 UI Design — swatches, type and a button
  `<circle class="p bg" cx="160" cy="112" r="98"/><ellipse class="sh" cx="160" cy="190" rx="98" ry="9"/>
   <rect class="w" x="44" y="40" width="232" height="140" rx="14"/>
   <circle class="n" cx="82" cy="78" r="20"/><circle class="s" cx="128" cy="78" r="20"/><circle class="i sw" cx="174" cy="78" r="20"/><circle class="e" cx="220" cy="78" r="20"/>
   <text class="tp" x="62" y="152" font-size="44">Aa</text><rect class="l" x="64" y="160" width="52" height="7" rx="3.5"/>
   <rect class="n" x="146" y="122" width="108" height="38" rx="19"/><path class="ln i" d="M176 141h40m-8-8l8 8-8 8"/>
   <g class="bob"><path class="s" d="M256 34l24 24-52 52-28 4 4-28z"/><path class="n" d="M200 114l-4 24 24-4z"/><circle class="e" cx="284" cy="150" r="7"/></g>`,
  // 07 Prototype — two linked phone screens and a tap
  `<circle class="p bg" cx="160" cy="112" r="98"/><ellipse class="sh" cx="160" cy="192" rx="100" ry="8"/>
   <rect class="n" x="52" y="48" width="84" height="138" rx="16"/><rect class="i" x="59" y="62" width="70" height="110" rx="8"/><rect class="l" x="66" y="70" width="56" height="26" rx="5"/><rect class="p" x="66" y="104" width="26" height="26" rx="5"/><rect class="p" x="96" y="104" width="26" height="26" rx="5"/><rect class="s" x="66" y="140" width="56" height="22" rx="11"/>
   <rect class="g" x="184" y="64" width="84" height="138" rx="16"/><rect class="w" x="191" y="78" width="70" height="110" rx="8"/><circle class="s" cx="226" cy="106" r="18"/><path class="ln i" d="M218 106l6 6 12-14"/><rect class="l" x="203" y="136" width="46" height="8" rx="4"/><rect class="p" x="209" y="152" width="34" height="8" rx="4"/>
   <path class="ln s dash" d="M140 116c20-8 24 8 40 0"/><path class="s" d="M182 116l-8-6v12z"/>
   <g class="tap"><circle class="rip" cx="98" cy="150" r="12"/><circle class="rip r2" cx="98" cy="150" r="12"/><path class="e" d="M92 142l-2 30 9-8 6 12 6-3-6-12 11-2z"/></g>`,
  // 08 Frontend — a laptop with code and floating components
  `<circle class="p bg" cx="160" cy="112" r="98"/><ellipse class="sh" cx="160" cy="192" rx="110" ry="8"/>
   <rect class="n" x="66" y="58" width="188" height="116" rx="10"/><rect class="scr" x="74" y="66" width="172" height="100" rx="5"/>
   <rect class="s" x="84" y="78" width="38" height="7" rx="3.5"/><rect class="l" x="128" y="78" width="54" height="7" rx="3.5"/><rect class="g" x="96" y="94" width="62" height="7" rx="3.5"/><rect class="p" x="164" y="94" width="40" height="7" rx="3.5"/><rect class="l" x="96" y="110" width="30" height="7" rx="3.5"/><rect class="s" x="132" y="110" width="70" height="7" rx="3.5"/><rect class="g" x="84" y="126" width="48" height="7" rx="3.5"/><rect class="cur" x="138" y="124" width="5" height="11" rx="1"/>
   <path class="n" d="M44 176h232l-10 14H54z"/><rect class="l" x="130" y="176" width="60" height="5" rx="2.5"/>
   <g class="bob"><rect class="w" x="226" y="28" width="62" height="40" rx="10"/><path class="ln s" d="M246 40l-8 8 8 8M268 40l8 8-8 8"/></g>
   <g class="bob2"><rect class="s" x="32" y="48" width="48" height="30" rx="8"/><circle class="i" cx="48" cy="63" r="6"/><rect class="i" x="58" y="59" width="14" height="7" rx="3.5"/></g>`,
  // 09 Backend — servers, a database and a cloud
  `<circle class="p bg" cx="160" cy="112" r="98"/><ellipse class="sh" cx="160" cy="192" rx="104" ry="8"/>
   <rect class="n" x="44" y="60" width="96" height="34" rx="8"/><rect class="g" x="44" y="100" width="96" height="34" rx="8"/><rect class="n" x="44" y="140" width="96" height="34" rx="8"/>
   <circle class="led" cx="60" cy="77" r="4"/><circle class="led l2" cx="74" cy="77" r="4"/><rect class="l" x="96" y="73" width="34" height="8" rx="4"/>
   <circle class="i" cx="60" cy="117" r="4"/><circle class="led l3" cx="74" cy="117" r="4"/><rect class="p" x="96" y="113" width="34" height="8" rx="4"/>
   <circle class="led l2" cx="60" cy="157" r="4"/><circle class="i" cx="74" cy="157" r="4"/><rect class="l" x="96" y="153" width="34" height="8" rx="4"/>
   <path class="ln s dash" d="M142 117h40"/>
   <g class="bob"><path class="w" d="M196 96a22 22 0 0 1 8-42 28 28 0 0 1 52 8 20 20 0 0 1 2 38z"/><path class="ln l" d="M214 72h30M214 84h20"/></g>
   <path class="g" d="M212 150v28c0 8 12 12 26 12s26-4 26-12v-28z"/><ellipse class="s" cx="238" cy="150" rx="26" ry="10"/><path class="ln l" d="M212 166c0 6 12 10 26 10s26-4 26-10"/>`,
  // 10 Testing — a shield with a tick, a bug and a checklist
  `<circle class="p bg" cx="160" cy="112" r="98"/><ellipse class="sh" cx="146" cy="192" rx="84" ry="8"/>
   <path class="n" d="M130 34l62 20v48c0 38-26 62-62 76-36-14-62-38-62-76V54z"/><path class="s" d="M130 46l50 16v40c0 30-20 50-50 62-30-12-50-32-50-62V62z"/><path class="ln i tick" d="M104 108l20 20 38-44"/>
   <g class="bob"><rect class="w" x="212" y="70" width="76" height="98" rx="10"/><rect class="s" x="222" y="84" width="14" height="14" rx="3"/><rect class="l" x="244" y="88" width="34" height="7" rx="3.5"/><rect class="s" x="222" y="108" width="14" height="14" rx="3"/><rect class="l" x="244" y="112" width="28" height="7" rx="3.5"/><rect class="p" x="222" y="132" width="14" height="14" rx="3"/><rect class="p" x="244" y="136" width="30" height="7" rx="3.5"/></g>
   <g class="bob2"><ellipse class="e" cx="248" cy="40" rx="14" ry="17"/><path class="ln e" d="M236 30l-12-7M260 30l12-7M234 42h-14M262 42h14M236 54l-12 8M260 54l12 8"/><path class="ln n" d="M232 22l32 38"/></g>`,
  // 11 Deployment — a rocket lifting off a cloud
  `<circle class="p bg" cx="160" cy="112" r="98"/><ellipse class="sh" cx="160" cy="194" rx="96" ry="8"/>
   <path class="w" d="M70 190a26 26 0 0 1 4-52 34 34 0 0 1 64 6 22 22 0 0 1 4 46z"/><path class="w" d="M180 190a24 24 0 0 1 2-44 30 30 0 0 1 56 8 20 20 0 0 1 4 36z"/>
   <g class="rocket"><path class="fl" d="M152 138c0 20 8 34 8 34s8-14 8-34z"/>
   <path class="s" d="M130 116l-18 28 22-4zM190 116l18 28-22-4z"/><path class="w" d="M160 36c28 20 36 56 28 98h-56c-8-42 0-78 28-98z"/><path class="l" d="M160 36c-6 14-8 60-4 98h-24c-8-42 0-78 28-98z"/><circle class="n" cx="160" cy="82" r="15"/><circle class="p" cx="160" cy="82" r="9"/><rect class="e" x="140" y="118" width="40" height="8" rx="4"/></g>
   <circle class="g" cx="76" cy="62" r="4"/><path class="s" d="M258 48l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"/><circle class="e" cx="252" cy="104" r="3.5"/>`,
  // 12 Optimisation — a dashboard with a rising chart and a gauge
  `<circle class="p bg" cx="160" cy="112" r="98"/><ellipse class="sh" cx="160" cy="192" rx="102" ry="8"/>
   <rect class="w" x="44" y="46" width="232" height="132" rx="14"/>
   <path class="p" d="M60 160l44-30 36 12 52-42 44-14v74H60z"/><path class="ln s" d="M60 160l44-30 36 12 52-42 44-14"/><circle class="n" cx="104" cy="130" r="4.5"/><circle class="n" cx="140" cy="142" r="4.5"/><circle class="n" cx="192" cy="100" r="4.5"/>
   <rect class="l" x="60" y="60" width="64" height="8" rx="4"/>
   <g class="bob"><path class="l" d="M226 112a28 28 0 0 1 56 0z"/><path class="s" d="M226 112a28 28 0 0 1 36-27l-8 27z"/><circle class="n" cx="254" cy="112" r="6"/><path class="ln n" d="M254 112l12-20"/></g>
   <g class="bob2"><circle class="n" cx="262" cy="46" r="18"/><path class="ln i" d="M262 54V38m-8 8l8-8 8 8"/></g>`,
  // 13 Support — a person in a headset and chat bubbles
  `<circle class="p bg" cx="160" cy="112" r="98"/><ellipse class="sh" cx="160" cy="194" rx="82" ry="8"/>
   <path class="s" d="M92 196a68 56 0 0 1 136 0z"/><path class="n" d="M142 140l18 22 18-22z"/><path class="i" d="M148 142l12 14 12-14z"/>
   <circle class="k" cx="160" cy="104" r="34"/><path class="e" d="M126 100a34 34 0 0 1 68 0c-10-14-30-20-44-12-10 2-18 6-24 12z"/><circle class="n" cx="148" cy="106" r="3"/><circle class="n" cx="172" cy="106" r="3"/><path class="ln n" d="M150 120a14 12 0 0 0 20 0"/>
   <path class="ln n" d="M124 106a36 36 0 0 1 72 0"/><rect class="n" x="116" y="100" width="12" height="24" rx="6"/><rect class="n" x="192" y="100" width="12" height="24" rx="6"/><path class="ln n" d="M198 122c0 14-12 20-26 20"/><circle class="s" cx="170" cy="142" r="5"/>
   <g class="bob"><rect class="w" x="212" y="52" width="76" height="40" rx="14"/><circle class="s" cx="232" cy="72" r="4.5"/><circle class="g" cx="250" cy="72" r="4.5"/><circle class="l" cx="268" cy="72" r="4.5"/></g>
   <g class="bob2"><rect class="n" x="36" y="64" width="64" height="36" rx="14"/><path class="ln i" d="M52 82h32"/></g>
   <path class="s heart" d="M262 132c-8-12-24-4-16 8l16 14 16-14c8-12-8-20-16-8z"/>`,
];
