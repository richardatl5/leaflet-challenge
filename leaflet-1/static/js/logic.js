var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"


d3.json(queryUrl, function(data) {

  createFeatures(data.features);
  console.log(data.features)
});

function createFeatures(earthquakeData) {

    function onEachFeature(feature, layer) {
      layer.bindPopup("<h3>" + feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }
  
    function radiusSize(magnitude) {
      return magnitude * 20000;
    }
  
  
    function circleColor(magnitude) {
      if (magnitude < 1) {
        return "#ccff33"
      }
      else if (magnitude < 2) {
        return "#ffff33"
      }
      else if (magnitude < 3) {
        return "#ffcc33"
      }
      else if (magnitude < 4) {
        return "#ff9933"
      }
      else if (magnitude < 5) {
        return "#ff6633"
      }
      else {
        return "#ff3333"
      }
    }

    var earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function(earthquakeData, latlng) {
          return L.circle(latlng, {
            radius: radiusSize(earthquakeData.properties.mag),
            color: circleColor(earthquakeData.properties.mag),
            fillOpacity: 1
          });
        },
        onEachFeature: onEachFeature
      });
    
      createMap(earthquakes);
    }

    function createMap(earthquakes) {

// Define map layers
    
  var airmap = L.tileLayer("https://api.mapbox.com/styles/v1/mfatih72/ck30s2f5b19ws1cpmmw6zfumm/tiles/256/{z}/{x}/{y}?" + 
    "access_token=pk.eyJ1IjoibWZhdGloNzIiLCJhIjoiY2sycnMyaDVzMGJxbzNtbng0anYybnF0MSJ9.aIN8AYdT8vHnsKloyC-DDA", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.air",
    accessToken: API_KEY
  });

  var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mfatih72/ck30rkku519fu1drmiimycohl/tiles/256/{z}/{x}/{y}?" + 
    "access_token=pk.eyJ1IjoibWZhdGloNzIiLCJhIjoiY2sycnMyaDVzMGJxbzNtbng0anYybnF0MSJ9.aIN8AYdT8vHnsKloyC-DDA", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  // Create the faultline layer
  var faultLine = new L.LayerGroup();
  
  // Define a baseMaps object to hold the base layers
  var baseMaps = {
    "Air Map": airmap,
    "Light Map": lightmap,
    "Satellite Map": satellitemap
  };

  // Create overlay object to hold the overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    FaultLines: faultLine
  };

  // Create our map and give it the streetmap and earthquakes layers to display upon load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 4,
    layers: [airmap, earthquakes, faultLine]
  });

  // Create a layer control
  // Pass in the baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Query to retrieve the faultline data
  var faultlinequery = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json";
  
  // Create the faultlines and add them to the faultline layer
  d3.json(faultlinequery, function(data) {
    L.geoJSON(data, {
      style: function() {
        return {color: "orange", fillOpacity: 0}
      }
    }).addTo(faultLine)
  })

// Create legend
var legend = L.control({
    position: "bottomleft"
});

legend.onAdd = function(myMap) {
    var div = L.DomUtil.create("div", "info legend"),
    grades = [0, 1, 2, 3, 4, 5],
    labels = [];

// Create legend
for (var i = 0; i < grades.length; i++) {
    div.innerHTML +=
        '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
}
return div;
};
legend.addTo(myMap);
}

// Create color function
function getColor(magnitude) {
if (magnitude > 5) {
    return 'red'
} else if (magnitude > 4) {
    return 'orange'
} else if (magnitude > 3) {
    return 'yellow'
} else if (magnitude > 2) {
    return 'lightgreen'
} else if (magnitude > 1) {
    return 'green'
} else {
    return 'magenta'
}
};