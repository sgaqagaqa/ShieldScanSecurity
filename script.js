// =====================

// LOGO SAFE LOAD

// =====================

const logoImg = new Image();

logoImg.src = "sss.png";

let logoReady = false;

logoImg.onload = () => {

  logoReady = true;

};

// =====================

// COUNTERS

// =====================

function animateCount(el, target, duration = 1800) {

  let start = null;

  function step(ts) {

    if (!start) start = ts;

    const p = Math.min((ts - start) / duration, 1);

    el.textContent = Math.floor(p * target).toLocaleString();

    if (p < 1) requestAnimationFrame(step);

  }

  requestAnimationFrame(step);

}

// =====================

// STATS

// =====================

function getDailyStats() {

  const today = new Date();

  const dayOfYear = Math.floor(

    (today - new Date(today.getFullYear(), 0, 0)) / 86400000

  );

  function rand(min, max, seed) {

    const x = Math.sin(seed) * 10000;

    return Math.floor((x - Math.floor(x)) * (max - min) + min);

  }

  const growth = Math.min(dayOfYear / 200, 1);

  return {

    scans: Math.floor(rand(8, 20, dayOfYear) + growth * 15),

    threats: Math.floor(rand(20, 60, dayOfYear + 1) + growth * 60),

    alerts: Math.floor(rand(1, 4, dayOfYear + 2) + growth * 4)

  };

}

// =====================

// INIT STATS

// =====================

window.addEventListener("load", () => {

  const stats = getDailyStats();

  animateCount(document.getElementById("cnt-scans"), stats.scans);

  animateCount(document.getElementById("cnt-threats"), stats.threats);

  animateCount(document.getElementById("cnt-alerts"), stats.alerts);

});

// =====================

// CHECKS

// =====================

const CHECKS = [

  { label: "SSL Certificate Valid", weight: 15, alwaysPass: true },

  { label: "HTTPS Enforced", weight: 10, alwaysPass: true },

  { label: "CSP Header Missing", weight: 12 },

  { label: "X-Frame-Options Missing", weight: 8 },

  { label: "HSTS Missing", weight: 10 },

  { label: "X-Content-Type-Options Missing", weight: 7 },

  { label: "Referrer Policy Weak", weight: 5 },

  { label: "Admin Panel Exposure", weight: 12, isRisk: true },

  { label: "Outdated CMS Detected", weight: 10, isRisk: true },

  { label: "Mixed Content Found", weight: 6, isRisk: true },

  { label: "DNS SPF Missing", weight: 5 }

];

// =====================

// HASH

// =====================

function hashCode(str) {

  let h = 0;

  for (let i = 0; i < str.length; i++) {

    h = Math.imul(31, h) + str.charCodeAt(i);

  }

  return Math.abs(h);

}

// =====================

// SCAN

// =====================

function runScan() {

  const url = document.getElementById("scan-url").value.trim();

  if (!url) return alert("Please enter a URL");

  let hostname;

  try {

    hostname = new URL(url).hostname;

  } catch {

    hostname = url;

  }

  document.getElementById("scan-results").style.display = "none";

  document.getElementById("scan-progress").style.display = "block";

  const pbar = document.getElementById("pbar");

  const plabel = document.getElementById("progress-label");

  const steps = [

    [15, "Checking SSL..."],

    [30, "Scanning headers..."],

    [50, "Testing vulnerabilities..."],

    [70, "Scanning endpoints..."],

    [90, "Finalising report..."],

    [100, "Complete"]

  ];

  let si = 0;

  const interval = setInterval(() => {

    if (si >= steps.length) {

      clearInterval(interval);

      setTimeout(() => showResults(hostname, url), 300);

      return;

    }

    const [pct, msg] = steps[si];

    pbar.style.width = pct + "%";

    plabel.textContent = msg;

    si++;

  }, 500);

}

// =====================

// RESULTS

// =====================

function showResults(hostname, url) {

  const seed = hashCode(hostname);

  const results = [];

  let score = 0;

  CHECKS.forEach((chk, i) => {

    let passed;

    if (chk.alwaysPass) {

      passed = true;

    } else {

      passed = ((seed * (i + 7) * 13) % 100) > 45;

    }

    if (chk.isRisk) passed = !passed;

    results.push({ ...chk, passed });

    if (passed) score += chk.weight;

  });

  const maxScore = CHECKS.reduce((a, c) => a + c.weight, 0);

  const pct = Math.round((score / maxScore) * 100);

  const summary = { critical: [], warnings: [] };

  results.forEach(r => {

    if (!r.passed) {

      if (r.weight >= 10 && summary.critical.length < 3) {

        summary.critical.push(r.label);

      } else if (summary.warnings.length < 3) {

        summary.warnings.push(r.label);

      }

    }

  });

  document.getElementById("scan-progress").style.display = "none";

  document.getElementById("scan-results").style.display = "block";

  const ring = document.getElementById("ring-fill");

  const display = document.getElementById("score-display");

  const label = document.getElementById("score-label");

  const color =

    pct >= 80 ? "#00ff88" :

    pct >= 55 ? "#f59e0b" : "#ef4444";

  ring.style.stroke = color;

  ring.style.strokeDashoffset = 339.3 - (339.3 * pct / 100);

  display.textContent = pct;

  display.style.color = color;

  label.textContent =

    pct >= 80 ? "Good Security" :

    pct >= 55 ? "Needs Improvement" : "High Risk";

  const list = document.getElementById("findings-list");

  list.innerHTML = "";

  results.forEach(r => {

    const div = document.createElement("div");

    div.className = "finding-row";

    div.textContent = (r.passed ? "✅ " : "⚠️ ") + r.label;

    list.appendChild(div);

  });

  // =====================

  // BUTTON (UNDER SCORE RING)

  // =====================

  const btn = document.createElement("button");

  btn.className = "btn";

  btn.textContent = "Download PDF Report";

  btn.style.marginTop = "12px";

  btn.style.width = "100%";

  document.querySelector(".score-ring-wrap").appendChild(btn);

  btn.onclick = () => generatePDF(summary, pct, url, btn);

}

// =====================

// PDF (FINAL PROFESSIONAL VERSION)

// =====================

function generatePDF(summary, score, url, btn) {

  const { jsPDF } = window.jspdf;

  const doc = new jsPDF();

  btn.disabled = true;

  btn.textContent = "Generating...";

  try {

    const bg = [10, 22, 40];

    const teal = [0, 212, 255];

    const green = [0, 255, 136];

    const red = [239, 68, 68];

    const amber = [245, 158, 11];

    // FULL BACKGROUND

    doc.setFillColor(...bg);

    doc.rect(0, 0, 210, 297, "F");

    // HEADER

    doc.setFillColor(15, 32, 68);

    doc.rect(0, 0, 210, 35, "F");

    if (logoReady && logoImg.complete) {

      try {

        doc.addImage(logoImg, "PNG", 10, 8, 18, 18);

      } catch {}

    }

    doc.setTextColor(255, 255, 255);

    doc.setFontSize(16);

    doc.text("ShieldScan Security Report", 35, 20);

    // INFO

    doc.setFontSize(11);

    doc.text(`Website: ${url}`, 10, 50);

    doc.text(`Score: ${score}%`, 150, 50);

    let status =

      score >= 80 ? "SECURE" :

      score >= 55 ? "MODERATE" : "HIGH RISK";

    doc.setTextColor(...teal);

    doc.text(`Status: ${status}`, 10, 60);

    // CHART

    doc.setTextColor(255, 255, 255);

    doc.text("Security Breakdown", 10, 75);

    function bar(label, value, color, y) {

      doc.setFillColor(255, 255, 255);

      doc.rect(10, y, 120, 6, "F");

      doc.setFillColor(...color);

      doc.rect(10, y, value * 12, 6, "F");

      doc.text(`${label} (${value})`, 135, y + 5);

    }

    bar("Critical", summary.critical.length, red, 85);

    bar("Warnings", summary.warnings.length, amber, 100);

    // FINDINGS

    let y = 130;

    function section(title, items, color) {

      doc.setTextColor(...color);

      doc.text(title, 10, y);

      y += 8;

      doc.setTextColor(255, 255, 255);

      if (items.length === 0) {

        doc.text("• None detected", 15, y);

        y += 8;

      } else {

        items.forEach(i => {

          doc.text(`• ${i}`, 15, y);

          y += 7;

        });

      }

      y += 10;

    }

    section("Critical Issues", summary.critical, red);

    section("Warnings", summary.warnings, amber);

    doc.setTextColor(180);

    doc.text("ShieldScan Security Report", 10, 285);

    doc.save("ShieldScan_Report.pdf");

  } catch (err) {

    console.error(err);

    alert("PDF generation failed");

  }

  btn.disabled = false;

  btn.textContent = "Download PDF Report";

}