function reveal() {

    document.querySelectorAll(".reveal").forEach(el => {

        let top = el.getBoundingClientRect().top;

        if (top < window.innerHeight - 100) {

            el.classList.add("active");

        }

    });

}

window.addEventListener("scroll", reveal);

function toggleCard(card){

    card.classList.toggle("active");

}

function startScan(){

    let progress=document.getElementById("progress");

    let status=document.getElementById("scanStatus");

    let results=document.getElementById("scanResults");

    let steps=[

        "Initializing...",

        "Checking SSL...",

        "Scanning Endpoints...",

        "Analyzing Vulnerabilities...",

        "Generating Report..."

    ];

    let i=0;

    results.style.display="none";

    let interval=setInterval(()=>{

        if(i<steps.length){

            status.innerText=steps[i];

            progress.style.width=((i+1)/steps.length)*100+"%";

            i++;

        } else {

            clearInterval(interval);

            status.innerText="Scan Complete ✔";

            results.style.display="block";

        }

    },900);

}

function animateValue(id,start,end,duration){

    let range=end-start;

    let current=start;

    let increment=end>start?1:-1;

    let stepTime=Math.abs(Math.floor(duration/range));

    let timer=setInterval(()=>{

        current+=increment;

        document.getElementById(id).innerText=current.toLocaleString();

        if(current==end){

            clearInterval(timer);

        }

    },stepTime);

}

function animateValue(id, start, end, duration){

    let startTime = null;

    function animation(currentTime){

        if(!startTime) startTime = currentTime;

        const progress = Math.min((currentTime - startTime) / duration, 1);

        const current = Math.floor(progress * (end - start) + start);

        document.getElementById(id).innerText = current.toLocaleString();

        if(progress < 1){

            requestAnimationFrame(animation);

        }

    }

    requestAnimationFrame(animation);

}

const today = new Date().getDate();

const scans = 8 + (today * 3);

const threats = 4 + (today % 8);

const alerts = 1 + (today % 4);

animateValue("sites", 0, scans, 2500);

animateValue("threats", 0, threats, 2200);

animateValue("alerts", 0, alerts, 1800);
