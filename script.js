/* Reverse gelocading from BigDataCloud */
/* Forward geocoding from Geoapify */
//https://freepngimg.com/png/23529-weather-hd/icon
//https://favicon.io/emoji-favicons/cloud
// Register the service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/serviceworker.js');
}


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

// get activity from bored api
function fetchData(latitude, longitude) {
	fetch('https://api.openweathermap.org/data/2.5/onecall?lat=' + latitude + '&lon=' + longitude + '&exclude=minutely,alerts&appid=d2b5c98a42a7264dbd990eb4fa88af01')
		.then(response => response.json())
		.then(data => updatePage(data) 
	);
}

function fetchGeocode() {
	let input = document.getElementById("input").value;
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
			updateLocation(data)
		}
	);
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
}

function showError(error) {
	console.log(error.code);
}

function updatePage(data) {
  let currentData = data.current
  let hourlyData = data.hourly
	let dailyData = data.daily
  let todaysData = dailyData[0]
  
  let date = new Date();
  let nextDay = new Date(date)
  
  // Current Weather
  document.getElementById("currentConditionsTime").innerHTML = new Date().toLocaleTimeString();
  document.getElementById("currentConditionsTemp").innerHTML = kelvinToCelcius(currentData.temp) + "°";
  document.getElementById("currentConditionsDesc").innerHTML = capitalizeWords(currentData.weather[0].description);
  document.getElementById("currentConditionsIcon").src = "https://openweathermap.org/img/wn/" + currentData.weather[0].icon + "@4x.png";
  // Precipitation is updated in weather data loop
  
  // Today's Forecast
  document.getElementById("todaysWeatherMorningTemp").innerHTML = kelvinToCelcius(todaysData.temp.morn) + "°";
  document.getElementById("todaysWeatherAfternoonTemp").innerHTML = kelvinToCelcius(todaysData.temp.day) + "°";
  document.getElementById("todaysWeatherEveningTemp").innerHTML = kelvinToCelcius(todaysData.temp.eve) + "°";
  document.getElementById("todaysWeatherNightTemp").innerHTML = kelvinToCelcius(todaysData.temp.night) + "°";
  
  for (let v of document.getElementsByClassName("todaysWeatherIcon")) {
    v.src = "https://openweathermap.org/img/wn/" + currentData.weather[0].icon + "@2x.png";
  }
  // Openweathermap API does not have morning/afternoon/evening/night icons
  // Using current weather icon for all
  
  // Weather Data
  for (let i in currentData) {
    let elements = document.getElementsByClassName(i);
    for (let v of elements) {
      v.innerHTML = formatData(i, currentData[i]);
    }
  }
  
  for (let v of document.getElementsByClassName("pop")) {
    v.innerHTML = formatData("pop", hourlyData[0].pop)
  }
  
  // Daily Forecast
  for (let i = 0; i < 7; i++) {
    if (i !== 0) {
      nextDay.setDate(date.getDate() + i);
      document.getElementById("dailyWeather" + i + "Header").innerHTML = formatDate(nextDay.getDay());
      
    }
    document.getElementById("dailyWeather" + i + "Temp").innerHTML = formatData("temp", dailyData[i].temp.min) + "/" + formatData("temp", dailyData[i].temp.max);
    document.getElementById("dailyWeather" + i + "Icon").src = "https://openweathermap.org/img/wn/" + dailyData[i].weather[0].icon + "@2x.png";
    document.getElementById("dailyWeather" + i + "Precip").innerHTML = formatData("pop", dailyData[i].pop);
  }
	fetchLocationByCoord(data.lat, data.lon);
	
}

function updateLocation(data) {
  let locationElements = document.getElementsByClassName("locationElem");
	let location = (data.city ? data.city : data.locality);
	
  for (let v of locationElements) {
    v.innerText = location + ", " + data.principalSubdivision + ", " + data.countryName;
  }
}

function formatData(data, value) {
  switch(data) {
    case "pop":
      return Math.round(value * 100) + "%";
    case "humidity":
      return value + "%";
    case "temp":
      return kelvinToCelcius(value) + "°";
    case "dew_point":
      return kelvinToCelcius(value) + "°";
    case "pressure":
      return value + "hPa";
    case "visibility":
      return metresToKilometre(value) + "km";
    case "wind_speed":
      return metrePerSecondToKilometrePerHour(value) + "km/h";
    case "clouds":
      return value + "%";
    case "rain":
      return value["1h"] + "mm";
    case "snow":
      return
    case "uvi":
      return value;
    default:
      return value;
  }
}

function formatDate(day) {
  switch (day) {
    case 0:
      return "Sunday";
    case 1:
      return "Monday";
    case 2:
      return "Tuesday";
    case 3:
      return "Wednesday";
    case 4:
      return "Thursday";
    case 5:
      return "Friday";
    case  6:
      return "Saturday";
    default:
      return day;
  }
}

function capitalizeWords(string) {
    return string.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

function kelvinToCelcius(kelvin) {
	return Math.round(kelvin - 273.15);
}

function metresToKilometre(metre) {
  return Math.round(metre / 100) / 10
}

function metrePerSecondToKilometrePerHour(metre) {
  return Math.round(metre * 3.6 * 10) / 10
}