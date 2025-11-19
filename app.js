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


        //function to update time using timezone of location
        function updateTime() {
            const timezone = data.location.tz_id;

            const options = {
                timeZone: timezone,
                hour12: false,
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            };

            const formatter = new Intl.DateTimeFormat([], options);

            return formatter.format(new Date());
        }

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
        feels_like_text.forEach(element => element.textContent = data.current.feelslike_c);
        temp_unit_elements.forEach(element => { element.textContent = "°C" });
        location_current_time.forEach(element => element.textContent = updateTime());
        greetings_text.forEach(element => element.textContent = getGreetings(currentHour));
        sunrise_text.textContent = "";
        sunset_text.textContent = "";
        sunrise_amOrPm_text.textContent = "";
        sunset_amOrPm_text.textContent = "";

        // Update the time every second
        setInterval(() => {
            const time = updateTime();
            location_current_time.forEach(el => el.textContent = time);
        }, 1000);



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

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////





function clock(timeStamp) {
    const date = new Date(timeStamp * 1000);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();

    setInterval(() => {
        return `${hours}:${minutes}:${seconds}`;
    }, 1000);

}

function amOrPm(timeStamp) {
    const date = new Date(timeStamp * 1000);
    let hours = date.getHours();
    let amOrPm = hours >= 12 ? "PM" : "AM";


    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return amOrPm;
}



/*

function getLocationTime() {


    // Get the epoch time from API (only once)
    let localTime = data.location.localtime_epoch * 1000;

    // Convert to Date object
    let currentTime = new Date(localTime);

    // Function that updates the time by +1 second
    function updateTime() {
        currentTime.setSeconds(currentTime.getSeconds() + 1);

        const hours = zeroPadding(currentTime.getHours());
        const minutes = zeroPadding(currentTime.getMinutes());
        const seconds = zeroPadding(currentTime.getSeconds());

        return `${hours}:${minutes}:${seconds}`;
    }

    updateTime();               // Run immediately
    setInterval(updateTime, 1000); // Update live every second
}






       // call this once after you get `data.location.localtime_epoch`
function startClockFromEpoch(epochSeconds) {
  // Clear any previous interval if you might restart the clock
  if (window.__weatherClockInterval) clearInterval(window.__weatherClockInterval);

  // Create a Date from the epoch once
  const currentTime = new Date(epochSeconds * 1000);

  function zeroPadding(unit) {
    unit = unit.toString();
    return unit.length < 2 ? "0" + unit : unit;
  }

  function tick() {
    // advance the Date by one second
    currentTime.setSeconds(currentTime.getSeconds() + 1);

    const hours = zeroPadding(currentTime.getHours());
    const minutes = zeroPadding(currentTime.getMinutes());
    const seconds = zeroPadding(currentTime.getSeconds());

    location_current_time.forEach(el => el.textContent = `${hours}:${minutes}:${seconds}`);
  }

  // render immediately and then every second
  tick();
  window.__weatherClockInterval = setInterval(tick, 1000);
}
        setInterval(() => startClockFromEpoch(data.location.localtime_epoch), 1000);


        */