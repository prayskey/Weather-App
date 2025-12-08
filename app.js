const search_input = document.querySelector(".search-bar");
const search_btn = document.querySelector(".search-btn");
const location_suggestions_box = document.querySelector(".location-suggestions-box");
const location_btn = document.querySelectorAll(".location-btn");
const temperature_text = document.querySelector(".big-temperature-text");
const user_city_text = document.querySelectorAll(".user_city");
const user_country_text = document.querySelectorAll(".user_country");
const location_current_time = document.querySelectorAll(".location_current_time");
const feels_like_text = document.querySelectorAll(".feels-like-text");
const humidity_text = document.querySelector(".humidity-text");
const wind_speed_text = document.querySelector(".wind-speed-text");
const hourlyForcastContainer = document.querySelector(".hourly-forcast-container");
const wind_direction_text = document.querySelector(".wind-direction-text");
const visibility_text = document.querySelector(".visibility-text");
const sunrise_text = document.querySelector(".sunrise-text");
const sunset_text = document.querySelector(".sunset-text");
const precipitation_text = document.querySelector(".precipitation-text");
const weather_condition_text = document.querySelector(".weather-condition-text"); // e.g., "Sunny", "Cloudy"
const setting_icon = document.querySelector(".lucide-settings-icon");
const greetings_text = document.querySelectorAll(".greetings-text");
const temp_unit_elements = document.querySelectorAll(".temp_unit");
const futureForcastContainer = document.querySelector(".future-forcast");
const sunrise_amOrPm_text = document.querySelector(".sunrise_amOrPm_text");
const sunset_amOrPm_text = document.querySelector(".sunset_amOrPm_text");

// Class to represent hourly weather data
class HourlyData {
    constructor(time, conditionText, temp_c, temp_f, conditionIcon) {
        this.time = time;
        this.conditionText = conditionText;
        this.temp_c = temp_c;
        this.temp_f = temp_f;
        this.conditionIcon = conditionIcon;
    }
    createHourlyForcastCard() {
        const card = document.createElement("div");
        card.className = "hour-card flex h-40 w-40 shrink-0 flex-col items-center justify-between rounded-2xl p-3 font-bold shadow-2xl shadow-gray-400 h-50 w-50";
        card.innerHTML = `
            <p class="hour-time text-sm mb-2">${this.time}</p>
            <img src="${this.conditionIcon}" alt="${this.conditionText}" class="hour-icon mb-2" />
            <p class="hour-condition text-center text-sm mb-2">${this.conditionText}</p>
            <p class="hour-temp text-lg font-semibold">${this.temp_c}°C</p>
        `;
        return card;
    }

}

// Class to represent daily weather data
class DailyData {
    static dayCounter = 0;
    constructor(date, conditionText, maxTempC, minTempC, conditionIcon) {
        this.date = date;
        this.conditionText = conditionText;
        this.maxTempC = maxTempC;
        this.minTempC = minTempC;
        this.conditionIcon = conditionIcon;
    }
    createDailyForcastCard() {
        const card = document.createElement("div");
        card.className = "day-card flex h-40 shrink-0 flex-col text-[20px] w-full items-center space-y-2 rounded-2xl p-3 font-bold shadow-2xl shadow-gray-400";
        card.innerHTML = `
            <div class="w-full px-4 flex space-x-5 justify-center">
                <p class="day-date text-center text-sm mb-2">${this.day()}</p>
                <p class="day-date text-center text-sm mb-2">${this.date}</p>
            </div>           
            <div class="flex w-full px-4 justify-between items-center">              
               <div>
                <p class="day-temp text-lg font-semibold">Max: ${this.maxTempC}°C</p>
                <p class="day-temp text-lg font-semibold">Min: ${this.minTempC}°C</p>
                </div>
                <img src="${this.conditionIcon}" alt="${this.conditionText}" class="day-icon mb-2" />
                <p class="day-condition text-center text-sm mb-2">${this.conditionText}</p> 
            </div>        
        `;
        return card;
    }

    // Get day of week from date
    day() {
        // Increment dayCounter and calculate day name
        DailyData.dayCounter++;
        // Get day name
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        if (DailyData.dayCounter === 1) return "Today";
        else return daysOfWeek[new Date(this.date).getDay()];        
    }
    static resetDayCounter() {
        DailyData.dayCounter = 0;
    }
    
};

const apiKey = "33aa39b727fa4ea9b8b172149250611"; //My API key
let country = null; // current location of the user

// Variable to hold the interval ID for updating time
let clockInterval = null;


window.addEventListener("load", getcurrentLocationProperties);

// Fetch weather data from the API
async function fetchWeatherData(lat, lon) {
    try {

        const apiURL = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=7&aqi=no&alerts=no`;
        const response = await fetch(apiURL);

        if (!response.ok) {
            throw new Error("Network response was not ok! \n Could not fetch forecast data.");
        };

        const data = await response.json();

        // Update the UI with fetched data
        updateWeatherUI(data);

        // Clear previous cards before appending new ones
        hourlyForcastContainer.innerHTML = "";

        // Update hourly forecast for the current day
        fetchHourlyForcast(0, lat, lon);

        // Fetch daily forcast data
        fetchDailyforcast(data.forecast.forecastday);

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

    const suggestions = await response.json(); // Array of location objects

    return suggestions;
}

// Render suggestions in the suggestions box
function renderLocationSuggestions(suggestions) {
    location_suggestions_box.innerHTML = ""; // Clear previous
    if (suggestions.length === 0) {
        location_suggestions_box.classList.add("hidden");
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
            location_suggestions_box.classList.add("hidden");
            search_input.value = `${loc.name}, ${loc.country}`;
        });
        location_suggestions_box.appendChild(div);
    });
    location_suggestions_box.classList.remove("hidden");
}

// Listen for input and show suggestions
search_input.addEventListener("input", async function () {
    const query = this.value.trim();
    if (query.length < 2) {
        location_suggestions_box.classList.add("hidden");
        return;
    }
    try {
        const suggestions = await fetchLocationSuggestions(query);
        renderLocationSuggestions(suggestions);
    } catch (e) {
        location_suggestions_box.classList.add("hidden");
        console.error(e);
    }
});

// Hide suggestions when clicking outside
document.addEventListener("click", function (e) {
    if (!location_suggestions_box.contains(e.target) && e.target !== search_input) {
        location_suggestions_box.classList.add("hidden");
    }
});

// Event listener for search button
search_btn.addEventListener("click", async function () {
    const query = search_input.value.trim();
    if (query) {
        try {
            const suggestions = await fetchLocationSuggestions(query);
            if (suggestions.length > 0) {
                const loc = suggestions[0];
                fetchWeatherData(loc.lat, loc.lon);
                search_input.value = `${loc.name}, ${loc.country}`;
            } else {
                alert("Location not found.");
            }
        } catch (e) {
            console.error(e);
            alert("Failed to fetch location data.");
        }
        location_suggestions_box.classList.add("hidden");
    }
});

// Update weather UI
function updateWeatherUI(data) {
    const currentHour = parseInt(data.location.localtime.split(" ")[1].split(":")[0]);
    const locationTimezone = data.location.tz_id;

    // Update the UI elements with the fetched data
    temperature_text.innerHTML = `${data.current.temp_c}<span class="temp_unit">°C</span>`;
    feels_like_text.textContent = Math.round(data.current.feelslike_c);
    humidity_text.textContent = data.current.humidity;
    wind_speed_text.textContent = data.current.wind_mph;
    wind_direction_text.textContent = data.current.wind_dir;
    visibility_text.textContent = data.current.vis_km;
    precipitation_text.textContent = data.current.precip_mm;
    weather_condition_text.textContent = data.current.condition.text;
    user_city_text.forEach(element => element.textContent = data.location.name);
    user_country_text.forEach(element => element.textContent = data.location.country);
    feels_like_text.forEach(element => element.textContent = data.current.feelslike_c);
    temp_unit_elements.forEach(element => { element.textContent = "°C" });
    greetings_text.forEach(element => element.textContent = getGreetings(currentHour));
    sunrise_text.textContent = data.forecast.forecastday[0].astro.sunrise;
    sunset_text.textContent = data.forecast.forecastday[0].astro.sunset;
    sunrise_amOrPm_text.textContent = "";
    sunset_amOrPm_text.textContent = "";

    // Clear previous interval
    if (clockInterval) clearInterval(clockInterval);

    // Start new interval
    clockInterval = setInterval(() => {
        const time = updateTime(locationTimezone);
        location_current_time.forEach(element => element.textContent = time);
    }, 1000);

}

// Event listener for location button
location_btn.forEach(e => e.addEventListener("click", getcurrentLocationProperties));

// Update future day hourly forecast
async function fetchHourlyForcast(dayIndex, lat, lon) {
    try {
        const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=${dayIndex + 1}&aqi=no&alerts=no`);
        if (!response.ok) {
            throw new Error("Network response was not ok! \n Could not fetch forecast data.");
        }

        const data = await response.json();
        const hourData = data.forecast.forecastday[dayIndex].hour;

        hourData.forEach(hour => {
            const hourCard = new HourlyData(hour.time.split(" ")[1], hour.condition.text, hour.temp_c, hour.temp_f, hour.condition.icon);

            hourlyForcastContainer.appendChild(hourCard.createHourlyForcastCard());
        })


    } catch {
        console.error("There was a problem fetching the hourly forecast data.");
    }
}

// Fetch daily forecast data
function fetchDailyforcast(forecastdays) {
    // Clear previous cards before appending new ones
    futureForcastContainer.innerHTML = "";

    forecastdays.forEach(day => {
        const card = new DailyData(day.date, day.day.condition.text, day.day.maxtemp_c, day.day.mintemp_c, day.day.condition.icon);

        // Append the created card to the future forecast container
        futureForcastContainer.appendChild(card.createDailyForcastCard());
    });
    DailyData.resetDayCounter();
}