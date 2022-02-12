function errorHandler(alertType, error) {
    if (alertType = "NoFilm") {
        alert("No search results. Try another film or show.");
    }
    else if (alertType = "NoLocation") {
        alert("No filming locations found for this film/show.");
    }
    console.log(error);
}

// creates a Location Url from imdb film search results scrape data
function createLocationUrl(data) {
    try {
        let titlePathName = $(data).find("#main .findList .findResult a")[0].pathname;
        const locationUrl = "https://www.imdb.com" + titlePathName + "locations?";
        return locationUrl;
    }
    catch (err) { errorHandler("NoFilm", err); }
}

// creates an array of locations from imdb location array scrape data
function createLocationNameArray(locationsArray) {
    locationsNameArray = []
    for (i = 0; i < locationsArray.length; i++) {
        locationsNameArray.push(locationsArray[i].innerText);
    }
    return locationsNameArray;
}

// creates a MapQuest bulk geocoder api request from an array of locations
function createMapQuestRequestUrl(locationsNameArray) {
    let KEY = 'U15ymjRxUkerS6zBAs8qZesoFNoLUjq7';
    let mapQuestRequestUrl = `http://www.mapquestapi.com/geocoding/v1/batch?key=${KEY}`
    for (i = 0; i < locationsNameArray.length; i++) {
        locationName = locationsNameArray[i].replaceAll(" ", "+");
        mapQuestRequestUrl += `&location=${locationName}`
    }
    return mapQuestRequestUrl
}

// global variable to keep track of markers currently visible
let visibleMarkers = new Array();
let infowindow;

// given a latLng object and a map it'll plot a marker
function addMarker(latLng, address, map) {
    var marker = new google.maps.Marker({
        position: latLng,
        map: map,
    });

    infowindow = new google.maps.InfoWindow();

    google.maps.event.addListener(marker, 'click', function () {
        infowindow.setContent(address);
        infowindow.open(map, marker);
    });

    visibleMarkers.push(marker);
};

// removes all markers currently on the map
function removeMarkers() {
    for (let i = 0; i < visibleMarkers.length; i++) {
        visibleMarkers[i].setMap(null);
    }
    visibleMarkers = [];
}

// callback main function that initializes the map
function initMap() {
    const searchBtn = document.getElementById('searchBtn');
    const searchContent = document.getElementById('searchContent');
    const resultDiv = document.getElementById('resultDiv');
    const resultIMG = document.getElementById('resultIMG');
    const resultName = document.getElementById('resultName');

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 2,
        center: { lat: 30.75, lng: -30.00 },
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControlOptions: {
            position: google.maps.ControlPosition.LEFT_BOTTOM,
        },
        zoomControlOptions: {
            position: google.maps.ControlPosition.LEFT_BOTTOM,
        }

    });

    map.controls[google.maps.ControlPosition.TOP_CENTER].push(searchContent);
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(searchBtn);
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(resultDiv);

    // scrapes imdb for location names connected to film and then bulk geocodes them using MapQuest api
    google.maps.event.addDomListener(searchBtn, "click", () => {
        const url = 'https://www.imdb.com/find?q=';
        const proxyurl = 'https://warm-badlands-51415.herokuapp.com/';
        const searchContentValue = document.getElementById('searchContent').value;
        let searchFilm = searchContentValue.replaceAll(" ", "+");
        $.ajax({
            url: proxyurl + url + searchFilm,
            cache: false,
            async: false,
            dataType: "html",
            success: function (data) {
                let locationUrl = createLocationUrl(data);
                $.ajax({
                    url: proxyurl + locationUrl,
                    cache: false,
                    async: false,
                    dataType: "html",
                    success: function (data) {
                        try {
                            let locationsArray = $(data).find("#filming_locations dt a");
                            let locationsNameArray = createLocationNameArray(locationsArray);
                            let mapQuestRequestUrl = createMapQuestRequestUrl(locationsNameArray);
                            resultIMG.src = $(data).find(".subpage_title_block img")[0].src
                            resultName.innerText = $(data).find(".subpage_title_block h3 a")[0].text + " " + $(data).find(".subpage_title_block h3 span")[0].textContent.trim()
                            resultDiv.hidden = false;
                            $.ajax({
                                url: mapQuestRequestUrl,
                                cache: false,
                                async: false,
                                dataType: "json",
                                success: function (data) {
                                    try {
                                        mqResultsArray = data.results;
                                        let latLngArray = [];
                                        let addressArray = [];
                                        for (i = 0; i < mqResultsArray.length; i++) {
                                            latLngArray.push(mqResultsArray[i].locations[0].latLng);
                                            address = (mqResultsArray[i].locations[0].street != "" ? mqResultsArray[i].locations[0].street + ", " : "") +
                                                (mqResultsArray[i].locations[0].adminArea5 != "" ? mqResultsArray[i].locations[0].adminArea5 + ", " : "") +
                                                (mqResultsArray[i].locations[0].adminArea3 != "" ? mqResultsArray[i].locations[0].adminArea3 + ", " : "") +
                                                mqResultsArray[i].locations[0].adminArea1
                                            addressArray.push(address);
                                        }
                                        removeMarkers() // remove existing markers before adding new ones
                                        var bounds = new google.maps.LatLngBounds();
                                        for (i = 0; i < latLngArray.length; i++) {
                                            addMarker(latLngArray[i], addressArray[i], map);
                                            bounds.extend(latLngArray[i]);
                                        }
                                        map.fitBounds(bounds); //auto-zoom
                                        map.panToBounds(bounds); //auto-center
                                    }
                                    catch (err) { errorHandler("NoLocation", err); }
                                },
                                error: function (err) { errorHandler("NoLocation", err); }
                            })
                        }
                        catch (err) { errorHandler("NoLocation", err); }
                    },
                    error: function (err) { errorHandler("NoLocation", err); }
                })
            },
            error: function (err) { errorHandler("NoFilm", err); }
        })
    })
}