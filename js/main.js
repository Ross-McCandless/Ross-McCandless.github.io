var mybutton = document.getElementById("scrollTopBtn");
var signbox = document.getElementById("signbox");
var arrowdown = document.getElementById("arrow-down");
window.onscroll = function () { scrollFunction() };
function scrollFunction() {
    if (document.body.scrollTop > screen.height || document.documentElement.scrollTop > screen.height) {
        mybutton.style.display = "block";
    }
    else if (document.body.scrollTop > (screen.height / 6) || document.documentElement.scrollTop > (screen.height / 6)) {
        signbox.style.display = "none";
        arrowdown.style.display = "none";
    }
    else {
        mybutton.style.display = "none";
    }
}
function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}
function callbackFunc(entries, observer) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = 1;
            entry.target.classList.add('zoom-in');
        }
    });
}
let options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.25
};
let observer = new IntersectionObserver(callbackFunc, options);
for (i = 1; i <= 8; i++) {
    let proj = `proj${i}`
    observer.observe(document.getElementById(proj));
}
// wake Heroku app for the GRT Unofficial Tracker by sending trying to fetch it.
function wakeUp() {
    const proxyurl = 'https://warm-badlands-51415.herokuapp.com/';
    const url = "http://webapps.regionofwaterloo.ca/api/grt-routes/api/vehiclepositions";
    let response = fetch(proxyurl + url, {
        headers: new Headers({
            'X-Requested-With': 'XMLHttpRequest'
        })
    });
    if (response.ok) {
        console.log("nudged Heroku")
    }
}
setTimeout(wakeUp, 1000);