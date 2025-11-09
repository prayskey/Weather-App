const apiKey = "33aa39b727fa4ea9b8b172149250611"; //My API key
const city = "London"; // change to the city you want

async function fetchWeatherData() {
    try {
        const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}&aqi=no`);
        if(!response.ok) {
            throw new Error("Network response was not ok!");
        }
        const data = await response.json();
        console.log(data);
    } catch {
        console.error("There was a problem fetching the weather data.");
    }
}
fetchWeatherData();