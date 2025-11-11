

const search_bar = document.querySelector(".search-bar");
const search_btn = document.querySelector(".search-btn");
const location_btn = document.querySelector(".location-btn");
const temperature_text = document.querySelector(".big-temperature-text");
const user_city_text = document.querySelector(".user_city");
const user_country_text = document.querySelector(".user_country");
const location_current_time = document.querySelectorAll(".location_current_time");
const feels_like_text = document.querySelectorAll(".feels-like-text");
const humidity_text = document.querySelector(".humidity-text");
const wind_speed_text = document.querySelector(".wind-speed-text");
const wind_direction_text = document.querySelector(".wind-direction-text");
const visibility_text = document.querySelector(".visibility-text");
const sunrise_text = document.querySelector(".sunrise-text");
const sunset_text = document.querySelector(".sunset-text");
const precipitation_text = document.querySelector(".precipitation-text");
const weather_condition_text = document.querySelector(".weather-condition-text"); // e.g., "Sunny", "Cloudy"
const setting_icon = document.querySelector(".lucide-settings-icon");
const greetings_text = document.querySelectorAll(".greetings-text");
const temp_unit_elements = document.querySelectorAll(".temp_unit");
const sunrise_amOrPm_text = document.querySelector(".sunrise_amOrPm_text");
const sunset_amOrPm_text = document.querySelector(".sunset_amOrPm_text");

const apiKey = "33aa39b727fa4ea9b8b172149250611"; //My API key
let country = null; // current location of the user


window.addEventListener("load", getcurrentLocationProperties);

// Fetch weather data from the API
async function fetchWeatherData(lat, lon) {
    try {

        const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=1&aqi=no&alerts=no`);

        if (!response.ok) {
            throw new Error("Network response was not ok! \n Could not fetch forecast data.");
        } else console.log("Forecast data fetched successfully.");

        const data = await response.json();
        const currentHour = parseInt(data.location.localtime.split(" ")[1].split(":")[0]);

        // Update the UI with fetched data
        temperature_text.innerHTML = `${data.current.temp_c}<span class="temp_unit">°C</span>`;
        feels_like_text.textContent = Math.round(data.current.feelslike_c);
        humidity_text.textContent = data.current.humidity;
        wind_speed_text.textContent = data.current.wind_mph;
        wind_direction_text.textContent = data.current.wind_dir;
        visibility_text.textContent = data.current.vis_km;
        precipitation_text.textContent = data.current.precip_mm;
        weather_condition_text.textContent = data.current.condition.text;
        user_city_text.textContent = data.location.name;
        user_country_text.textContent = data.location.country;
        location_current_time.forEach(element => element.textContent = getLocationTime());
        feels_like_text.forEach(element => element.textContent = data.current.feelslike_c);
        temp_unit_elements.forEach(element => { element.textContent = "°C" });
        greetings_text.forEach(element => element.textContent = getGreetings(currentHour));
        sunrise_text.textContent = "";
        sunset_text.textContent = "";
        sunrise_amOrPm_text.textContent = "";
        sunset_amOrPm_text.textContent = "";


        // Get local time of the Api fetch location
        function getLocationTime() {
            function zeroPadding(unit) {
                unit = unit.toString();
                return unit.length < 2 ? "0" + unit : unit;
            }

            const localTime = data.location.localtime_epoch;

            const date = new Date(localTime * 1000).toISOString();
            const timePart = date.split("T")[1].split(".")[0];
            const timeParts = timePart.split(":");
            const hours = zeroPadding(parseInt(timeParts[0]));
            const minutes = zeroPadding(parseInt(timeParts[1]));
            const seconds = zeroPadding(parseInt(timeParts[2]));


            return `${hours}:${minutes}:${seconds}`;
        }

    } catch {
        console.error("There was a problem fetching the weather data.");
    }
}

// Get the current location of the user
function getcurrentLocationProperties() {

    function successcallBack(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        fetchWeatherData(lat, lon);
    }

    function errorCallback(error) {
        console.error(`ERROR ${error.code}: ${error.message}`);
    }

    navigator.geolocation.getCurrentPosition(successcallBack, errorCallback, {
        enableHighAccuracy: true,
        maximumAge: 0
    });



}

// Get greetings based on the current hour
function getGreetings(currentHour) {
    if (currentHour < 12) {
        return "Good Morning";
    } else if (currentHour >= 12 && currentHour < 16) {
        return "Good Afternoon";
    } else {
        return "Good Evening";
    }
}
