// Store our API endpoint inside queryUrl
// var queryUrl = "http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2014-01-01&endtime=" +
//   "2014-01-02&maxlongitude=-69.52148437&minlongitude=-123.83789062&maxlatitude=48.74894534&minlatitude=25.16517337";

var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

var tectonicUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
//Define funciton to set circle marker set based on mag
function circleMarkerSize (mag) {
    return mag * 30000;
  }

//Define function to set cicle marker color based on mag
function circleMarkerColor(mag) {
    if (mag <= 1) {
        return "#58D68D";
    } else if (mag <= 2) {
        return "#A7DC5A ";
    } else if (mag <= 3) {
        return "#DAE862";
    } else if (mag <= 4) {
        return "#FAE469";
    } else if (mag <= 5) {
        return "#FABA69";
    } else {
        return "#DC7C62";
    };
  }

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

//second overlay
var tectonicPlates = new L.LayerGroup();

d3.json(tectonicUrl, function(tectonicData) {
    L.geoJson(tectonicData, {
        color: "yellow",
        weight: 2
    })
    .addTo(tectonicPlates);
});


function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" + "<p> Magnitude: " +  feature.properties.mag + "</p>")
  }

 // Define a function to create cicleMarker based on feature lat and lng
  function pointToLayer(feature, latlng) {
    
        return new L.circle(latlng,
          {radius: circleMarkerSize(feature.properties.mag),
          fillColor: circleMarkerColor(feature.properties.mag),
          fillOpacity: 0.8,
          color: "#000000",
          weight: 1,
          opacity: 0.2,
          stroke: true
      })
    
  }
  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: pointToLayer
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/sharonsu94/cjfaegj8s03ls2sphts1zdr4q/tiles/256/{z}/{x}/{y}?" +
  "access_token=pk.eyJ1Ijoic2hhcm9uc3U5NCIsImEiOiJjamV2b3AxaWQwcDc5MzJwc2o0ZjhlNzR1In0." +
  "VjlbqszIZOjTP0T1d-Y9Aw");

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Dark Map": darkmap,
    "Light Map": lightmap,
    "Street Map": streetmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    TectonicPlates: tectonicPlates
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 3,
    layers: [darkmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);


  //Define legend position

  var legend = L.control({position: 'bottomright'});

  //Add legend elements
  legend.onAdd = function (myMap) {
  
      var div = L.DomUtil.create('div', 'info legend'),
          magnitudes = [0, 1, 2, 3, 4, 5];
  
      for (var i = 0; i < magnitudes.length; i++) {
          div.innerHTML +=
              '<i style="background:' + circleMarkerColor(magnitudes[i] + 1) + '"></i> ' + 
      + magnitudes[i] + (magnitudes[i + 1] ? ' - ' + magnitudes[i + 1] + '<br>' : ' + ');
      }
  
      return div;
  };
  
  //Add legend to map
  legend.addTo(myMap);
}
