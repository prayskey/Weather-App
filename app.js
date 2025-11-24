const apiKey = "33aa39b727fa4ea9b8b172149250611"; //My API key

const domUI = {
    searchInput: $(".search-bar"),
    searchBtn: $(".search-btn"),
    locationSuggestionBox: $(".location-suggestions-box"),
    locationBtn: $(".location-btn"),
    temperatureText: $(".big-temperature-text"),
    userCityText: $(".user_city"),
    userCountryText: $(".user_country"),
    currentLocationTime: $(".location_current_time"),
    feelsLikeText: $(".feels-like-text"),
    humidityText: $(".humidity-text"),
    settingsIcon: $(".hamburger-settings"),
    windSpeedText: $(".wind-speed-text"),
    windDirectionText: $(".wind-direction-text"),
    visibilityText: $(".visibility-text"),
    sunriseText: $(".sunrise-text"),
    sunsetText: $(".sunset-text"),
    precipitationText: $(".precipitation-text"),
    weatherConditionText: $(".weather-condition-text"), // e.g., "Sunny", "Cloudy"
    settingsIcon: $(".lucide-settings-icon"),
    greetingsText: $(".greetings-text"),
    tempUnitElements: $(".temp_unit"),
    sunrise_amOrPm_text: $(".sunrise_amOrPm_text"),
    sunset_amOrPm_text: $(".sunset_amOrPm_text")
}

let country = null; // current location of the user
// Variable to hold the interval ID for updating time
let clockInterval = null;


window.addEventListener("load", getcurrentLocationProperties);

// Fetch weather data from the API
async function fetchWeatherData(lat, lon) {
    try {

        const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=33aa39b727fa4ea9b8b172149250611&q=${lat},${lon}&days=1&aqi=no&alerts=no`);

        if (!response.ok) {
            throw new Error("Network response was not ok! \n Could not fetch forecast data.");
        };

        const data = await response.json();

        updateDomUI(data);


    } catch {
        console.error("There was a problem fetching the weather data.");
    }
}

//function to update time using timezone of location
function updateTime(timezone) {
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

// Function to convert 12-hour format to 24-hour format
function convertTo24Hr(time12h) {
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":");

    if (hours === "12") hours = "00";
    if (modifier === "PM") hours = parseInt(hours) + 12;

    return `${hours}:${minutes}`;
}

// Fetch location suggestions from WeatherAPI
async function fetchLocationSuggestions(query) {
    const response = await fetch(
        `https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${encodeURIComponent(query)}`
    );
    if (!response.ok) throw new Error("Failed to fetch location suggestions");

    return await response.json(); // Array of location objects
}

// Render suggestions in the suggestions box
function renderLocationSuggestions(suggestions) {
    domUI.locationSuggestionBox.innerHTML = ""; // Clear previous
    if (suggestions.length === 0) {
        domUI.locationSuggestionBox.classList.add("hidden");
        return;
    }
    suggestions.forEach(loc => {
        const div = document.createElement("div");
        div.className = "w-full cursor-pointer border-b-[1px] border-gray-300 bg-[#f5f5f5] px-4 py-2 text-black hover:bg-[#f0f0f0] flex";
        div.innerHTML = `
            <p class="location-city">${loc.name}</p>, <p class="location-country">${loc.country}</p>
        `;
        div.addEventListener("click", () => {
            // Fetch weather for selected location
            fetchWeatherData(loc.lat, loc.lon);
            domUI.locationSuggestionBox.classList.add("hidden");
            domUI.searchInput.value = `${loc.name}, ${loc.country}`;
        });
        domUI.locationSuggestionBox.appendChild(div);
    });
    domUI.locationSuggestionBox.classList.remove("hidden");
}

// Listen for input and show suggestions
domUI.searchInput.addEventListener("input", async function () {
    const query = this.value.trim();
    if (query.length < 2) {
        domUI.locationSuggestionBox.classList.add("hidden");
        return;
    }
    try {
        const suggestions = await fetchLocationSuggestions(query);
        renderLocationSuggestions(suggestions);
    } catch (e) {
        domUI.locationSuggestionBox.classList.add("hidden");
        console.error(e);
    }
});

// Hide suggestions when clicking outside
document.addEventListener("click", function (e) {
    if (!domUI.locationSuggestionBox.contains(e.target) && e.target !== domUI.searchInput) {
        domUI.locationSuggestionBox.classList.add("hidden");
    }
});

// Event listener for search button
domUI.searchBtn.addEventListener("click", async function () {
    const query = domUI.searchInput.value.trim();
    if (query) {
        try {
            const suggestions = await fetchLocationSuggestions(query);
            if (suggestions.length > 0) {
                const loc = suggestions[0];
                fetchWeatherData(loc.lat, loc.lon);
                domUI.searchInput.value = `${loc.name}, ${loc.country}`;
            } else {
                alert("Location not found.");
            }
        } catch (e) {
            console.error(e);
            alert("Failed to fetch location data.");
        }
        domUI.locationSuggestionBox.classList.add("hidden");
    }
});

// Update the UI with fetched data
function updateDomUI(fetchData) {

    const currentHour = parseInt(fetchData.location.localtime.split(" ")[1].split(":")[0]);
    const locationTimezone = fetchData.location.tz_id;

    domUI.temperatureText.forEach(element => element.innerHTML = `${fetchData.current.temp_c}<span class="temp_unit">°C</span>` );
    domUI.feelsLikeText.forEach(element => element.textContent = Math.round(fetchData.current.feelslike_c));
    domUI.humidityText.forEach(element => element.textContent = fetchData.current.humidity);
    domUI.windSpeedText.forEach(element => element.textContent =  fetchData.current.wind_mph);
    domUI.windDirectionText.forEach(element => element.textContent = fetchData.current.wind_dir);
    domUI.visibilityText.forEach(element => element.textContent =  fetchData.current.vis_km);
    domUI.precipitationText.forEach(element => element.textContent = fetchData.current.precip_mm);
    domUI.weatherConditionText.forEach(element => element.textContent = fetchData.current.condition.text);
    domUI.userCityText.forEach(element => element.textContent = fetchData.location.name);
    domUI.userCountryText.forEach(element => element.textContent = fetchData.location.country);
    domUI.feelsLikeText.forEach(element => element.textContent = fetchData.current.feelslike_c);
    domUI.tempUnitElements.forEach(element => { element.textContent = "°C" });
    domUI.greetingsText.forEach(element => element.textContent = getGreetings(currentHour));
    domUI.sunriseText.forEach(element => element.textContent = fetchData.forecast.forecastday[0].astro.sunrise);
    domUI.sunsetText.forEach(element => element.textContent = fetchData.forecast.forecastday[0].astro.sunset);
    domUI.sunrise_amOrPm_text.forEach(element => element.textContent = "");
    domUI.sunset_amOrPm_text.forEach(element => element.textContent =  "");

    // Clear previous interval
    if (clockInterval) clearInterval(clockInterval);

    // Start new interval
    clockInterval = setInterval(() => {
        const time = updateTime(locationTimezone);
        domUI.currentLocationTime.forEach(element => element.textContent = time);
    }, 1000);
}

// Event listener for location button
domUI.locationBtn.addEventListener("click", getcurrentLocationProperties);
