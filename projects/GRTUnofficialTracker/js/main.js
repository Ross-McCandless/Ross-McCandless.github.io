var map = L.map("mapid", { zoomControl: false, "tap": false }).setView([43.452969, -80.495064], 13);
baseMap = L.esri.basemapLayer('DarkGray').addTo(map);

var InfoBox = L.control({ position: 'topleft' });

InfoBox.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend');
    div.innerHTML = '<p class="Info"><img class="logo" src="./icons/logo.png" alt="logo not found" height="95" width="181"><br>Search LIVE GRT Bus locations.<br>- Select a Route in the bottom left<br>- Click on Bus icon to view info<br>- Scroll or Pinch to Zoom <br><br>Made by: <a href="https://www.linkedin.com/in/rossmccandless/" target="_blank">Ross McCandless</a></p>';
    return div;
};
InfoBox.addTo(map);

function getSelectValue() {
    var selectedRoute = document.getElementById("list").value;
    map.eachLayer((layer) => {
        if (layer != baseMap) {
            layer.remove();
        }
    });
    Main("GRT_GTFS/trips.txt", "GRT_GTFS/shapes.txt", selectedRoute);
}

function Main(tripsTxtFile, shapesTxtFile, chosenRoute) {
    Promise.all([
        fetch(tripsTxtFile).then(x => x.text()),
        fetch(shapesTxtFile).then(x => x.text())
    ]).then(([tripsTxtResp, shapesTxtResp]) => {
        const gtfsArrayToGeojsonFeatures = (gtfsArray) => {
            return gtfsArray.map((gtfsObject) => {
                switch (gtfsObject.vehicle.trip.route_id) {
                    case chosenRoute:
                        value = readArrayWriteRouteLine([gtfsObject.vehicle.trip.trip_id]);
                        return {
                            type: "Feature",
                            properties: {
                                route: gtfsObject.vehicle.trip.route_id,
                                route_start: gtfsObject.vehicle.trip.start_time,
                                route_date: gtfsObject.vehicle.trip.start_date,
                                trip_id: gtfsObject.vehicle.trip.trip_id,
                                route_name: value[0]
                            },
                            geometry: {
                                type: "Point",
                                coordinates: [
                                    gtfsObject.vehicle.position.longitude,
                                    gtfsObject.vehicle.position.latitude
                                ]
                            }
                        };
                    default:
                        return false
                };
            });
        };

        const pbfToGeojson = async () => {
            const proxyurl = 'https://warm-badlands-51415.herokuapp.com/';
            const url = "http://webapps.regionofwaterloo.ca/api/grt-routes/api/vehiclepositions";
            let response = await fetch(proxyurl + url, {
                headers: new Headers({
                    'X-Requested-With': 'XMLHttpRequest'
                })

            });
            if (response.ok) {
                const bufferRes = await response.arrayBuffer();
                const pbf = new Pbf(new Uint8Array(bufferRes));
                const obj = FeedMessage.read(pbf);
                // check to see if the route even has buses on the road before running gtfsArrayToGeojsonFeatures function on a array of items matching chosenRoute
                notFound = true;
                filteredEntityArray = [];
                for (var i = 0; i < obj.entity.length; i++) {
                    if (obj.entity[i].vehicle.trip.route_id == chosenRoute) {
                        filteredEntityArray.push(obj.entity[i]);
                        notFound = false;
                    }
                }
                if (notFound) {
                    alert("No Buses currently on the road for Route " + chosenRoute + ". Check www.grt.ca for schedule information.");
                }
                else {
                    return {
                        type: "FeatureCollection",
                        features: gtfsArrayToGeojsonFeatures(filteredEntityArray)
                    };
                }

            } else {
                console.error("error:", response.status);
            }
        };

        var currentLocationGeoJSON;
        const currentLocationLayer = L.geoJSON(currentLocationGeoJSON, {
            pointToLayer: function (feature, latlng) {
                var smallIcon = new L.Icon({
                    iconSize: [27, 27],
                    popupAnchor: [1, -24],
                    iconUrl: 'icons/bus.png'
                });
                return L.marker(latlng, { icon: smallIcon });
            }
        }).addTo(map);

        const updateCurrentLocationLayer = async (currentLocationLayer) => {
            const locations = await pbfToGeojson();
            currentLocationLayer.addData(locations);
            currentLocationLayer.bindTooltip('Click for more info', {
                direction: 'center',
                offset: L.point(0, -30)
            });
            function onClickBus() {
                currentLocationLayer.unbindTooltip();
            }
            currentLocationLayer.on('click', onClickBus);
        };

        updateCurrentLocationLayer(currentLocationLayer);

        currentLocationLayer.bindPopup(function (currentLocationLayer) {
            return "Route: " + currentLocationLayer.feature.properties.route + " " + currentLocationLayer.feature.properties.route_name + "<br />Route Started @: " + currentLocationLayer.feature.properties.route_start + " " + currentLocationLayer.feature.properties.route_date;
        }).addTo(map);

        var current_position;
        var userLocationIcon = new L.Icon({
            iconSize: [35, 35],
            iconAnchor: [13, 27],
            popupAnchor: [1, -24],
            iconUrl: 'icons/userIcon-yellow.svg'
        });
        function onLocationFound(e) {
            current_position = L.marker(e.latlng, { icon: userLocationIcon }).addTo(map);
        }
        map.on('locationfound', onLocationFound);
        map.locate();

        function readArrayWriteRouteLine(trip_id_Array) {
            function createArray(fileResp) {
                txtArray = fileResp.split('\n').map(function (ln) {
                    return ln.split(',');
                });
                return txtArray;
            }
            let stopCoordinates = [];
            let route_name_array = [];
            var tripsTxtArray = createArray(tripsTxtResp);
            var shapesTxtArray = createArray(shapesTxtResp);
            for (var i = 0; i < tripsTxtArray.length; i++) {
                var route_id = tripsTxtArray[i][0];
                trip_id = tripsTxtArray[i][2];
                if (route_id === chosenRoute && trip_id_Array.includes(trip_id)) {
                    var route_name = tripsTxtArray[i][3];
                    route_name_array.push(route_name);
                    var shape_id = tripsTxtArray[i][6];
                    for (var j = 0; j < shapesTxtArray.length; j++) {
                        var shape_id2 = shapesTxtArray[j][0];
                        if (shape_id === shape_id2) {
                            var shape_lat = parseFloat(shapesTxtArray[j][1]);
                            var shape_lon = parseFloat(shapesTxtArray[j][2]);
                            stopCoordinates.push([shape_lon, shape_lat]);
                        }
                    };

                }
            }

            var myStyle = {
                "color": "#226DE6",
                "weight": 4
            };
            var routeLineString = {
                "type": "LineString",
                "coordinates": stopCoordinates
            }
            const routeLineLayer = L.geoJSON(routeLineString, { style: myStyle }).addTo(map);
            map.fitBounds(routeLineLayer.getBounds());

            return route_name_array;
        }
    })
};