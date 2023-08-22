// DOM elements
var searchBar = document.getElementById('searchBar');
var searchBtn = document.getElementById('searchBtn');
var searchResults = document.getElementById('searchResults');
var currentWeather = document.getElementById('currentWeather');
var forecastContainer = document.getElementById('forecastContainer');

// Initialize search history from local storage
var searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];

// Default coordinates (Phoenix, AZ)
var defaultLatitude = 33.448248;
var defaultLongitude = -112.121191;

// Load search history and current weather on page load
loadSearchHistory();
getWeather(defaultLatitude, defaultLongitude);

// Load search history into the UI
function loadSearchHistory() {
    searchResults.innerHTML = "";
    for (var i = 0; i < Math.min(searchHistory.length, 8); i++) {
        var searchItem = document.createElement('button');
        searchItem.classList.add('search-history-item');
        searchItem.textContent = searchHistory[i];
        searchItem.addEventListener('click', function() {
            getCityWeather(this.textContent);
        });
        searchResults.appendChild(searchItem);
    }
}

// Save a city to search history in local storage
function saveToSearchHistory(city) {
    if (!searchHistory.includes(city)) {
        searchHistory.push(city);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
        loadSearchHistory();
    }
}

// Fetch current weather for a given city
function getCityWeather(cityName) {
    var locationUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&appid=d2f6e3e2fab9ee8cf44524cc1fb2e7e9`;

    fetch(locationUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (locationData) {
            var latitude = locationData[0].lat;
            var longitude = locationData[0].lon;
            getWeather(latitude, longitude);
            getFiveDayForecast(latitude, longitude);
            saveToSearchHistory(cityName);
        });
}

// Fetch weather data from OpenWeatherMap API
function getWeather(latitude, longitude) {
    var weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=d2f6e3e2fab9ee8cf44524cc1fb2e7e9&units=imperial`;

    fetch(weatherUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (weatherData) {
            displayWeather(weatherData);
        });
}

// Fetch five-day forecast data from OpenWeatherMap API
function getFiveDayForecast(latitude, longitude) {
    var forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=d2f6e3e2fab9ee8cf44524cc1fb2e7e9&units=imperial`;

    fetch(forecastUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (forecastData) {
            displayFiveDayForecast(forecastData.list);
        });
}

// Display current weather data
function displayWeather(weatherData) {
    currentWeather.innerHTML = `
        <h2 class="city-name">${weatherData.name}</h2>
        <img class="weather-icon" src="https://openweathermap.org/img/wn/${weatherData.weather[0].icon}.png" alt="Weather Icon">
        <p class="temperature">Temperature: ${weatherData.main.temp}°F</p>
        <p class="wind-speed">Wind Speed: ${weatherData.wind.speed} MPH</p>
        <p class="humidity">Humidity: ${weatherData.main.humidity}%</p>
    `;
}

// Display five-day forecast data
function displayFiveDayForecast(forecastData) {
    forecastContainer.innerHTML = "";

    for (var i = 7; i < forecastData.length; i += 8) {
        var forecast = forecastData[i];
        var forecastItem = document.createElement('div');
        forecastItem.classList.add('forecast-item');

        forecastItem.innerHTML = `
            <p class="forecast-date">${new Date(forecast.dt * 1000).toLocaleDateString()}</p>
            <img class="forecast-icon" src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="Forecast Icon">
            <p class="forecast-temp">Temp: ${forecast.main.temp}°F</p>
            <p class="forecast-wind">Wind: ${forecast.wind.speed} MPH</p>
            <p class="forecast-humidity">Humidity: ${forecast.main.humidity}%</p>
        `;

        forecastContainer.appendChild(forecastItem);
    }
}

// Event listener for the search button
searchBtn.addEventListener('click', function() {
    var city = searchBar.value.trim();
    if (city !== "") {
        getCityWeather(city);
        searchBar.value = "";
    }
});
