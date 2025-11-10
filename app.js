const search_bar = document.querySelector(".search-bar");
const search_btn = document.querySelector(".search-btn");
const location_btn = document.querySelector(".location-btn");
const temperature_text = document.querySelector(".big-temperature-text");
const feels_like_text = document.querySelector(".feels-like-text");
const humidity_text = document.querySelector(".humidity-text");
const wind_speed_text = document.querySelector(".wind-speed-text");
const wind_direction_text = document.querySelector(".wind-direction-text");
const visibility_text = document.querySelector(".visibility-text");
const sunrise_text = document.querySelector(".sunrise-text");
const sunset_text = document.querySelector(".sunset-text");
const precipitation_text = document.querySelector(".precipitation-text");
const weather_condition_text = document.querySelector(".weather-condition-text");
const setting_icon = document.querySelector("lucide-settings-icon");
const greetings_text = document.querySelector(".greetings-text");
const temp_unit_elements = document.querySelectorAll(".temp_unit");


const apiKey = "33aa39b727fa4ea9b8b172149250611"; //My API key
let country = null; // current location of the user


window.addEventListener("load", getcurrentLocation);

//fetchWeatherData();


// Fetch weather data from the API
async function fetchWeatherData(lat, lon) {
    try {
        // console.log(lat, lon);

        const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}&aqi=no`);

        console.log(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}&aqi=no`)

        if (!response.ok) {
            throw new Error("Network response was not ok!");
        }
        const data = await response.json();
        console.log(data);
    } catch {
        console.error("There was a problem fetching the weather data.");
    }
}

// Get the current location of the user
function getcurrentLocation() {

    navigator.geolocation.getCurrentPosition(successcallBack, errorCallback, {
        enableHighAccuracy: true,
        maximumAge: 0
    });

    function successcallBack(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        fetchWeatherData(lat, lon);

        console.log(`Latitude: ${lat}, Longitude: ${lon}`);
    }
    function errorCallback(error) {
        console.error(`ERROR ${error.code}: ${error.message}`);
    }

}