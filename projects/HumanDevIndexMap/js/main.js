var slider = document.getElementById("RangeElem");
var output = document.getElementById("currentYear");
output.innerHTML = slider.value; // Display the default slider value

// Update the current slider value (each time you drag the slider handle)
year = 2004;
slider.oninput = function () {
    output.innerHTML = this.value;
    year = this.value;
    geojson.resetStyle();
}

bounds = new L.LatLngBounds(new L.LatLng(90, -180), new L.LatLng(-65, 180));

var map = L.map('mapid', {
    zoomControl: false,
    "tap": false,
    minZoom: 2,
    maxZoom: 5,
    maxBounds: bounds,
    maxBoundsViscosity: 1.0
}).setView([65, 0], 2);

function getColor(x) {
    return x >= 0.9 ? "#004529" :
        x >= 0.8 ? "#006837" :
            x >= 0.7 ? "#238443" :
                x >= 0.6 ? "#41ab5d" :
                    x >= 0.5 ? "#78c679" :
                        x >= 0.4 ? "#addd8e" :
                            x >= 0.3 ? "#d9f0a3" :
                                x >= 0.2 ? "#f7fcb9" :
                                    x >= 0.1 ? "#ffffe5" :
                                        "#4c4c4c";

}

function styler(feature) {
    return {
        fillColor: getColor(parseFloat(feature.properties[year])),
        weight: 1,
        opacity: 1,
        color: 'black',
        fillOpacity: 1
    };
};

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 2,
        color: 'red',
        dashArray: ''
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    info.update(layer.feature.properties);

}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}


function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight
    });
}

geojson = L.geoJSON(myGeoJSON, {
    style: styler,
    onEachFeature: onEachFeature
}).addTo(map);

var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'hoverinfo');
    this.update();
    return this._div;
};

info.update = function (props) {
    this._div.innerHTML = (props ?
        '<b>' + props.CNTRY_NAME + '<br>' + (props[year] ? props[year] : 'No Data') + '</b>'
        : 'Hover over any country<br> to see its HDI value'

    )
};
info.addTo(map);

var InfoBox = L.control({ position: 'bottomleft' });
InfoBox.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'summaryinfo');
    div.innerHTML = '<p><b><big>Human Development Index (<a href="http://hdr.undp.org/en/content/human-development-index-hdi" target="_blank">HDI</a>) Map</big></b><br><br>- Drag red slider at the top to change the year.<br>- Hover over countries to see its HDI value.<br>- Click Play Slideshow button to see a timelapse from 1990 to 2019.<br><br> Made by <a href="https://www.linkedin.com/in/rossmccandless/">Ross McCandless</a></p>'
    return div;
};
InfoBox.addTo(map);

var legend = L.control({ position: 'bottomright' });
legend.onAdd = function () {
    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
        labels = ['Legend'];
    for (var i = 0; i < grades.length - 1; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i]) + '"></i> ' +
            grades[i] + (grades[i + 1] ? ' &ndash; ' + grades[i + 1] + '<br>' : '');
    }
    return div;
};
legend.addTo(map);


function playSlider() {
    document.getElementById("Btn").disabled = true;
    document.getElementById("currentYear").innerHTML = 1990;
    geojson.resetStyle();
    var tid = setInterval(function () {
        currentYear = document.getElementById("currentYear").innerHTML;
        if (currentYear < 2019) {
            currentYear++;
            document.getElementById("currentYear").innerHTML = currentYear;
            document.getElementById("RangeElem").value = currentYear;
            year = currentYear
            geojson.resetStyle();
        }
    }, 1000); //delay is in milliseconds 


    setTimeout(function () {
        clearInterval(tid); //clear above interval after 30 seconds
        document.getElementById("Btn").disabled = false;
    }, 30000);
}
