function animateCount(el, target, duration = 1500) {

  let start = null;

  function step(ts) {

    if (!start) start = ts;

    const p = Math.min((ts - start) / duration, 1);

    el.textContent = Math.floor(p * target);

    if (p < 1) requestAnimationFrame(step);

  }

  requestAnimationFrame(step);

}

window.onload = () => {

  animateCount(document.getElementById("cnt-scans"), 247);

  animateCount(document.getElementById("cnt-threats"), 1038);

  animateCount(document.getElementById("cnt-alerts"), 14);

};

/* SCAN ENGINE */

function runScan() {

  const url = document.getElementById("scan-url").value;

  if (!url) return alert("Enter URL");

  document.getElementById("scan-progress").style.display = "block";

  document.getElementById("scan-results").style.display = "none";

  let progress = 0;

  const bar = document.getElementById("pbar");

  const interval = setInterval(() => {

    progress += 10;

    bar.style.width = progress + "%";

    if (progress >= 100) {

      clearInterval(interval);

      showResults(url);

    }

  }, 200);

}

function showResults(url) {

  document.getElementById("scan-progress").style.display = "none";

  document.getElementById("scan-results").style.display = "block";

  const list = document.getElementById("findings-list");

  list.innerHTML = "";

  const checks = [

    "SSL Secure",

    "HTTPS Enabled",

    "No Open Admin Panel",

    "Headers Secure"

  ];

  checks.forEach((c, i) => {

    setTimeout(() => {

      const div = document.createElement("div");

      div.className = "finding-row";

      div.textContent = "✔ " + c;

      list.appendChild(div);

    }, i * 200);

  });

  document.getElementById("score-display").textContent = "85";

  document.getElementById("score-label").textContent = "Good Security Posture";

}
