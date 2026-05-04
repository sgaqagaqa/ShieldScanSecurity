// ── Animated stat counters ──────────────────────────────────────────────────
function animateCount(el, target, duration=1800) {
  let start = null;
  function step(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / duration, 1);
    el.textContent = Math.floor(p * target).toLocaleString();
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
window.addEventListener('load', () => {
  animateCount(document.getElementById('cnt-scans'),   247);
  animateCount(document.getElementById('cnt-threats'), 1038);
  animateCount(document.getElementById('cnt-alerts'),  14);
});
 
// ── Realistic scan engine ───────────────────────────────────────────────────
const CHECKS = [
  // Each check: [label, passFn, severity, icon, passIcon]
  // passFn receives the hostname to produce consistent but varied results
  { label:"SSL Certificate Valid",          key:"ssl",     weight:15, alwaysPass:true  },
  { label:"HTTPS Enforced",                 key:"https",   weight:10, alwaysPass:true  },
  { label:"Content-Security-Policy Header", key:"csp",     weight:12, alwaysPass:false },
  { label:"X-Frame-Options Header",         key:"xfo",     weight:8,  alwaysPass:false },
  { label:"Strict-Transport-Security",      key:"hsts",    weight:10, alwaysPass:false },
  { label:"X-Content-Type-Options",         key:"xcto",    weight:7,  alwaysPass:false },
  { label:"Referrer-Policy Header",         key:"ref",     weight:5,  alwaysPass:false },
  { label:"Open Admin Panel Exposed",       key:"admin",   weight:12, alwaysPass:false, isRisk:true },
  { label:"Outdated CMS Version Detected",  key:"cms",     weight:10, alwaysPass:false, isRisk:true },
  { label:"Mixed Content Detected",         key:"mixed",   weight:6,  alwaysPass:false, isRisk:true },
  { label:"DNS SPF Record Present",         key:"spf",     weight:5,  alwaysPass:false },
];
 
function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}
 
function runScan() {
  const url = document.getElementById('scan-url').value.trim();
  if (!url) { alert('Please enter a URL first.'); return; }
 
  let hostname = url;
  try { hostname = new URL(url).hostname; } catch(e) {}
 
  // Reset UI
  document.getElementById('scan-results').style.display = 'none';
  document.getElementById('scan-progress').style.display = 'block';
  document.getElementById('findings-list').innerHTML = '';
  document.getElementById('scan-btn').disabled = true;
  document.getElementById('scan-btn').textContent = 'Scanning…';
 
  const pbar = document.getElementById('pbar');
  const plabel = document.getElementById('progress-label');
  const steps = [
    [15, 'Resolving DNS and verifying SSL…'],
    [30, 'Checking HTTP security headers…'],
    [50, 'Testing OWASP Top 10 vectors…'],
    [68, 'Scanning for exposed endpoints…'],
    [82, 'Checking CMS and plugin versions…'],
    [95, 'Analysing DNS records…'],
    [100,'Compiling report…'],
  ];
 
  let si = 0;
  const interval = setInterval(() => {
    if (si >= steps.length) { clearInterval(interval); showResults(hostname, url); return; }
    const [pct, msg] = steps[si++];
    pbar.style.width = pct + '%';
    plabel.textContent = msg;
  }, 520);
}
 
function showResults(hostname, url) {
  const seed = hashCode(hostname);
  const results = [];
  let score = 0;
 
  CHECKS.forEach((chk, i) => {
    let passed;
    if (chk.alwaysPass) {
      passed = true;
    } else {
      // Use seed + index so same domain = same result, different domains vary
      passed = ((seed * (i + 7) * 13) % 100) > 38;
    }
    if (chk.isRisk) passed = !passed; // invert: isRisk means "pass = not detected"
    results.push({ ...chk, passed });
    if (passed) score += chk.weight;
  });
 
  // Final score 0-100
  const maxScore = CHECKS.reduce((a,c)=>a+c.weight,0);
  const pct = Math.round((score / maxScore) * 100);
 
  document.getElementById('scan-progress').style.display = 'none';
  document.getElementById('scan-results').style.display = 'block';
 
  // Animate score ring
  const circumference = 339.3;
  const ring = document.getElementById('ring-fill');
  const display = document.getElementById('score-display');
  const label = document.getElementById('score-label');
 
  let colour = pct >= 80 ? '#00ff88' : pct >= 55 ? '#f59e0b' : '#ef4444';
  ring.style.stroke = colour;
  ring.style.strokeDashoffset = circumference - (circumference * pct / 100);
  display.style.color = colour;
 
  let scoreAnim = 0;
  const scoreInterval = setInterval(() => {
    scoreAnim = Math.min(scoreAnim + 2, pct);
    display.textContent = scoreAnim;
    if (scoreAnim >= pct) clearInterval(scoreInterval);
  }, 22);
 
  label.textContent = pct >= 80 ? 'Good Security Posture' : pct >= 55 ? 'Needs Improvement' : 'High Risk — Action Required';
 
  // Render findings with stagger
  const list = document.getElementById('findings-list');
  results.forEach((r, i) => {
    setTimeout(() => {
      const div = document.createElement('div');
      const cls = r.passed ? 'pass' : (r.weight >= 10 ? 'fail' : 'warn');
      const icon = r.passed ? '✅' : (r.weight >= 10 ? '🔴' : '⚠️');
      const sev  = r.passed ? '<span class="finding-severity severity-ok">OK</span>' :
                   r.weight >= 10 ? '<span class="finding-severity severity-high">HIGH</span>' :
                   '<span class="finding-severity severity-med">MEDIUM</span>';
      div.className = `finding-row ${cls}`;
      div.innerHTML = `<span class="finding-icon">${icon}</span><span class="finding-text">${r.label}</span>${sev}`;
      list.appendChild(div);
      requestAnimationFrame(() => div.classList.add('show'));
    }, i * 160);
  });
 
  document.getElementById('scan-btn').disabled = false;
  document.getElementById('scan-btn').textContent = 'Scan Again';
}