// Initialize map
const map = L.map("map").setView([28.6139, 77.2090], 13); // default Delhi

// Add OpenStreetMap tiles
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "© OpenStreetMap"
}).addTo(map);

// Function to add cafe markers
function addCafeMarker(lat, lon, name) {
  const marker = L.circleMarker([lat, lon], {
    radius: 8,
    color: "red",
    fillColor: "white",
    fillOpacity: 0.8
  }).addTo(map);

  marker.bindPopup(`<b>${name}</b><br><button onclick="saveCafe('${name}')">Save Cafe</button>`);
}

// Save cafe feature
function saveCafe(name) {
  const list = document.getElementById("savedCafesList");
  const li = document.createElement("li");
  li.textContent = name;
  list.appendChild(li);
}

// Find cafes near current location
function findCafesNearMe() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      map.setView([lat, lon], 15);

      // Overpass query: cafes within 1km
      const query = `[out:json];
        node(around:1000, ${lat}, ${lon})["amenity"="cafe"];
        out;`;

      fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query
      })
        .then(res => res.json())
        .then(data => {
          console.log("Nearby cafes data:", data); // debug log
          if (data.elements.length === 0) {
            alert("No cafes found nearby.");
          }
          data.elements.forEach(cafe => {
            addCafeMarker(cafe.lat, cafe.lon, cafe.tags.name || "Unnamed Cafe");
          });
        })
        .catch(err => console.error(err));
    });
  } else {
    alert("Geolocation not supported.");
  }
}

// Find cafes by city
function findCafesByCity() {
  const city = document.getElementById("cityInput").value;
  if (!city) {
    alert("Please enter a city name.");
    return;
  }

  // Use Nominatim to convert city name → coordinates
  fetch(`https://nominatim.openstreetmap.org/search?city=${city}&format=json`)
    .then(res => res.json())
    .then(locations => {
      if (locations.length === 0) {
        alert("City not found.");
        return;
      }

      const lat = locations[0].lat;
      const lon = locations[0].lon;
      map.setView([lat, lon], 14);

      // Overpass query: cafes within 2km
      const query = `[out:json];
        node(around:2000, ${lat}, ${lon})["amenity"="cafe"];
        out;`;

      fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: query
      })
        .then(res => res.json())
        .then(data => {
          console.log("Cafes in city:", data); // debug log
          if (data.elements.length === 0) {
            alert("No cafes found in this city.");
          }
          data.elements.forEach(cafe => {
            addCafeMarker(cafe.lat, cafe.lon, cafe.tags.name || "Unnamed Cafe");
          });
        });
    });
}
