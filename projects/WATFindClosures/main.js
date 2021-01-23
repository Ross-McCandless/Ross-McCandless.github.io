require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/GeoJSONLayer",
    "esri/widgets/Legend",
    "esri/widgets/Search",
    "esri/widgets/BasemapToggle",
    "dojo/dom-class",
    "dojo/domReady!"

  ], function(Map, 
              MapView, 
              GeoJSONLayer,
              Legend,
              Search,
              BasemapToggle,
              domClass) {

  const currentClosuresTemplate = {
      title: "Current Road Closure Info",
      content: formatCurrentClosuresContent,
      outFields: ["*"]
  };

  function formatCurrentClosuresContent(feature) {
    let street_name = feature.graphic.attributes.STREET_NAME;
    let reason = feature.graphic.attributes.REASON;
    let detour = feature.graphic.attributes.DETOUR;
    let contact = feature.graphic.attributes.CONTACT;
    let details = feature.graphic.attributes.DETAILS;
    let date_to = new Date(feature.graphic.attributes.DATE_TO);
    return "<b>Street Closed:</b> " + street_name + "<br> <b>Closed until:</b> " + date_to.toLocaleString() + "<br> <b>Reason:</b> " + reason + "<br> <b>Detour:</b> " + detour + "<br> <b>Contact:</b> " + contact + "<br> <b>Details:</b> " + details;
  };

  const futureClosuresTemplate = {
      title: "future Road Closure Info",
      content: formatFutureClosuresContent,
      outFields: ["*"]
  };

  function formatFutureClosuresContent(feature) {
    let street_name = feature.graphic.attributes.STREET_NAME;
    let reason = feature.graphic.attributes.REASON;
    let detour = feature.graphic.attributes.DETOUR;
    let contact = feature.graphic.attributes.CONTACT;
    let details = feature.graphic.attributes.DETAILS;
    let date_to = new Date(feature.graphic.attributes.DATE_TO);
    let date_from = new Date(feature.graphic.attributes.DATE_FROM);
    return "<b>Street Closed:</b> " + street_name + "<br> <b>Closed starting:</b> " + date_from.toLocaleString() + "<br> <b>Closed until:</b> " + date_to.toLocaleString() + "<br> <b>Reason:</b> " + reason + "<br> <b>Detour:</b> " + detour + "<br> <b>Contact:</b> " + contact + "<br> <b>Details:</b> " + details;
  };



  const currentClosuresRenderer = {
        type: "simple",
        symbol: {
            type: "simple-line",
            width: 2.0,
            color: "red"
        }
    };

  const futureClosuresRenderer = {
        type: "simple",
        symbol: {
            type: "simple-line",
            width: 2.0,
            color: "orange"
        }
    };

  const currentClosures = "https://opendata.arcgis.com/datasets/4af7c514f77b48db93ce0d0649a31aa9_0.geojson";         
  const futureClosures = "https://opendata.arcgis.com/datasets/eed1cbec419c4ffd9aea5ddfd7290b08_0.geojson";
    
  const currentClosuresLayer = new GeoJSONLayer({
        url: currentClosures,
        popupTemplate: currentClosuresTemplate,
        renderer: currentClosuresRenderer
      });
    
  const futureClosuresLayer = new GeoJSONLayer({
        url: futureClosures,
        popupTemplate: futureClosuresTemplate,
        renderer: futureClosuresRenderer
      });


  var map = new Map({
      basemap: "dark-gray-vector",
      layers: [currentClosuresLayer,
              futureClosuresLayer]
    });

  var view = new MapView({
      container: "viewDiv",
      map: map,
      center: [-80.5214,43.4743],
      zoom: 12
    });

  view.watch('updating', function(evt){
      if(evt === true){
        domClass.add('loadingDiv', 'visible');
      }else{
        domClass.remove('loadingDiv', 'visible');
      }
  })
  
  var toggle = new BasemapToggle({
      view: view, 
      nextBasemap: "gray-vector" 
  });
  view.ui.add(toggle, "bottom-left");

  var legend = new Legend({
  view: view,
  layerInfos: [
      {
      layer: currentClosuresLayer,
      title: "Current Road Closures"
      },
      {
      layer: futureClosuresLayer,
      title: "Future Road Closures"
      }
  ]
  });
  view.ui.add(legend, "bottom-right");

  var search = new Search({
      view: view
    });
  view.ui.add(search, "top-right");

  });