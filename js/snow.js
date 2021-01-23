/*!
// Snow.js - v0.0.3
// kurisubrooks.com
// Modified by Ross McCandless
*/
var snowMax = 100;
var snowColor = ["#DDD", "#EEE"];
var snowEntity = "&#x2022;";
var snowSpeed = 0.95;
var snowMinSize = 10;
var snowMaxSize = 30;
var snowRefresh = 50;
var snowStyles = "z-index: -1 !important; cursor: default; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; -o-user-select: none; user-select: none;";
var snow = [],
	pos = [],
	coords = [],
	lefr = [],
	marginBottom,
	marginRight;
function randomise(range) {
	rand = Math.floor(range * Math.random());
	return rand;
}
function initSnow() {
	var snowSize = snowMaxSize - snowMinSize;
	marginBottom = window.innerHeight - 5;
	marginRight = window.innerWidth - 15;
	for (i = 0; i <= snowMax; i++) {
		coords[i] = 0;
		lefr[i] = Math.random() * 15;
		pos[i] = 0.03 + Math.random() / 10;
		snow[i] = document.getElementById("flake" + i);
		snow[i].style.fontFamily = "inherit";
		snow[i].size = randomise(snowSize) + snowMinSize;
		snow[i].style.fontSize = snow[i].size + "px";
		snow[i].style.color = snowColor[randomise(snowColor.length)];
		snow[i].style.zIndex = 1000;
		snow[i].sink = snowSpeed * snow[i].size / 5;
		snow[i].posX = randomise(marginRight - snow[i].size);
		snow[i].posY = randomise(2 * marginBottom - marginBottom - 2 * snow[i].size);
		snow[i].style.left = snow[i].posX + "px";
		snow[i].style.top = snow[i].posY + "px";
	}
	moveSnow();
}
function resize() {
	marginBottom = window.innerHeight - 5;
	marginRight = window.innerWidth - 15;
}
function moveSnow() {
	for (i = 0; i <= snowMax; i++) {
		coords[i] += pos[i];
		snow[i].posY += snow[i].sink;
		snow[i].style.left = snow[i].posX + lefr[i] * Math.sin(coords[i]) + "px";
		snow[i].style.top = snow[i].posY + "px";
		if (snow[i].posY >= marginBottom - 2 * snow[i].size || parseInt(snow[i].style.left) > (marginRight - 3 * lefr[i])) {
			snow[i].posX = randomise(marginRight - snow[i].size);
			snow[i].posY = 0;
		}
	}
	setTimeout("moveSnow()", snowRefresh);
}
for (i = 0; i <= snowMax; i++) {
	document.write("<span id='flake" + i + "' style='" + snowStyles + "position:absolute;top:-" + snowMaxSize + "'>" + snowEntity + "</span>");
}
window.addEventListener('resize', resize);
window.addEventListener('load', initSnow);