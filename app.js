const apiKey = "33aa39b727fa4ea9b8b172149250611"; //My API key

async function fetchWeatherData() {
    const res = await fetch(apiKey);
    console.log(res);

    //const data = res.data();


    
/*
 if (!data.ok) {
        throw new Error("404 Error \n file not found");
    }
*/

   
}

fetchWeatherData();