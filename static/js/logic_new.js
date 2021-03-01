
//adding all the tile layers as baseamps
var graymap_background = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?" +
 "access_token=pk.eyJ1IjoiYXBhdGVsMTk4NSIsImEiOiJja2p6dWk5ZnYwYjRxMzBwa2M2Zm00ZnduIn0.G7XuS-JO1NyEj15Oi0fqMA");
var satellitemap_background = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?" +
 "access_token=pk.eyJ1IjoiYXBhdGVsMTk4NSIsImEiOiJja2p6dWk5ZnYwYjRxMzBwa2M2Zm00ZnduIn0.G7XuS-JO1NyEj15Oi0fqMA");
var outdoors_background = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?" +
 "access_token=pk.eyJ1IjoiYXBhdGVsMTk4NSIsImEiOiJja2p6dWk5ZnYwYjRxMzBwa2M2Zm00ZnduIn0.G7XuS-JO1NyEj15Oi0fqMA");


// ****MAP and Components********
var map = L.map("mapid", {
 center: [0, 0],
 zoom: 2,
 layers: [graymap_background, satellitemap_background, outdoors_background]
});
graymap_background.addTo(map);

//adding the overlay layers with the data(i.e. tectonic plates and significant earthquakes)
var tectonics = new L.LayerGroup();
var earthquakes = new L.LayerGroup();
var basemaps = {
 Satellite: satellitemap_background,
 Grayscale: graymap_background,
 Outdoors: outdoors_background
};
var overlayMaps = {
 "Tectonic Plates": tectonics,
 "Earthquakes": earthquakes
};
// control which layers are visible.
L
 .control
 .layers(basemaps, overlayMaps)
 .addTo(map);

 //getting the data from geojson
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson", function(data) {
 function styleInfo(feature) {
   return {
     opacity: 1,
     fillOpacity: 1,
     fillColor: getColor(feature.properties.mag),
     color: "#000000",
     radius: getRadius(feature.properties.mag),
     stroke: true,
     weight: 0.5
   };
 }
 function getColor(magnitude) {
   switch (true) {
     case magnitude > 8:
       return "#EA2C2C";
     case magnitude > 7:
       return "#EA822C";
     case magnitude > 6:
       return "#EE9C00";
     case magnitude > 5:
       return "#EECC00";
     case magnitude > 4:
       return "#D4EE00";
     default:
       return "#98EE00";
   }
 }

 //assigning the magnitude as the radius of marker (too small;  multiplye by 2 to increase the size)
 function getRadius(magnitude) {
   if (magnitude === 0) {
     return 1;
   }
   return magnitude * 2;
 }
 L.geoJson(data, {
   pointToLayer: function(feature, latlng) {
     return L.circleMarker(latlng);
   },
   style: styleInfo,
   onEachFeature: function(feature, layer) {
     layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
   }
 }).addTo(earthquakes);
 earthquakes.addTo(map);

 //adding the legend for the colors to the map
 var legend = L.control({
   position: "topleft"
 });
 legend.onAdd = function() {
   var div = L
     .DomUtil
     .create("div", "info legend");
   var grades = [4, 5, 6, 7, 8];
   var colors = [
     "#98EE00",
     "#D4EE00",
     "#EECC00",
     "#EE9C00",
     "#EA822C",
     "#EA2C2C"
   ];
   for (var i = 0; i < grades.length; i++) {
     div.innerHTML += "<i style='background: " + colors[i] + "'></i> " +
       grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
   }
   return div;
 };
 legend.addTo(map);

 //this is step 2, not working, adding the plate tectonics layers
 d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json",
   function(platedata) {
     L.geoJson(platedata, {
       color: "orange",
       weight: 2
     })
     .addTo(tectonics);
     // add the tectonicplates layer to the map.
     tectonics.addTo(map);
   });
});