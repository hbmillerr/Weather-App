/* Reverse gelocading from BigDataCloud */
/* Forward geocoding from Geoapify */

// initialize variables after page loads
window.onload = function() {
	let input = document.getElementById("input");
	
	input.addEventListener("keyup", function(event) {
		if (event.keyCode === 13) {
			event.preventDefault();
			document.getElementById("search").click();
		}
	});
	getLocation();
} // window.onload

// Register the service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/serviceworker.js');
}

// get activity from bored api
function fetchData(latitude, longitude) {
	fetch('https://api.openweathermap.org/data/2.5/onecall?lat=' + latitude + '&lon=' + longitude + '&exclude=minutely,daily,alerts&appid=d2b5c98a42a7264dbd990eb4fa88af01')
		.then(response => response.json())
		.then(data => updatePage(data) 
	);
}

function fetchGeocode() {
	let input = document.getElementById("input").value;
	console.log(input);
	fetch('https://api.geoapify.com/v1/geocode/search?text=' + input + '&limit=1&apiKey=6e108a7a034c488cba79c90f3a632b07')
		.then(response => response.json())
		.then(data => {
			fetchData(data.features[0].properties.lat, data.features[0].properties.lon)
			//updateLocation(data.features[0].properties.formatted);
		}
	);
}

function fetchLocationByCoord(latitude, longitude) {
	fetch('https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=' + latitude + '&longitude=' + longitude + '&localityLanguage=en')
		.then(response => response.json())
		.then(data => {
			console.log(data);
			updateLocation(data)
		}
	);
}

function kelvinToCelcius(kelvin) {
	return Math.floor(kelvin - 273.15);
}

function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(showPosition, showError);
	} else { 
		console.log("Geolocation is not supported by this browser.");
	}
}

function showPosition(position) {
	let latitude = position.coords.latitude;
	let longitude = position.coords.longitude;
	
	fetchData(latitude, longitude);
	console.log(position);
}

function showError(error) {
	console.log(error.code);
}

function updatePage(data) {
	// Update CurrentConditions Card
	console.log(data);
	let locationElem = document.getElementById("currentConditionsLocation");
	let timeElem = document.getElementById("currentConditionsTime");
	let tempElem = document.getElementById("currentConditionsTemp");
	let descElem = document.getElementById("currentConditionsDesc");
	let precipElem = document.getElementById("currentConditionsPrecip");
	let humidityElem = document.getElementById("currentConditionsHumidity");
	let icon = document.getElementById("currentConditionsIcon");
	
	timeElem.textContent = new Date().toLocaleTimeString();
	tempElem.textContent = kelvinToCelcius(data.current.temp) + "°";
	descElem.textContent = capitalizeWords(data.current.weather[0].description);
	precipElem.textContent = "Precipitation: " + data.hourly[0].pop + "%";
	humidityElem.textContent = "Humidity: " + data.current.humidity + "%";
	icon.src = "http://openweathermap.org/img/wn/" + data.current.weather[0].icon + "@2x.png";
	
	fetchLocationByCoord(data.lat, data.lon);
	
}

function updateLocation(data) {
	let locationElem = document.getElementById("currentConditionsLocation")
	let cityName = (data.city ? data.city : data.locality);
	
	
	locationElem.innerHTML = "<i class='material-icons'>location_on</i>" + cityName + ", " + data.principalSubdivision + ", " + data.countryName;
}

function capitalizeWords(string) {
    return string.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};