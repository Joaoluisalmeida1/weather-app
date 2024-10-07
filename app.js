async function fetchWeather(location) {
    const apiKey = '9HGEHAXJGF3BCD933BM7HNM7E';
    try {
        const response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?key=${apiKey}&unitGroup=metric&include=current,days`);
        
        // If the response is not OK, throw an error
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Full API Response:', data); // Log the entire response to inspect it
        return processWeatherData(data);
    } catch (error) {
        console.error('Error fetching weather data:', error); // Log the error for more details
        throw error; // Re-throw the error to be caught in the form submission handler
    }
}

function processWeatherData(data) {
    const current = data.currentConditions;
    const today = data.days[0]; // today's weather
    const forecast = data.days.slice(1, 8); // next 7 days
    
    const timezone = data.timezone; // Get timezone from API response
    
    // Correctly format local time using the API's timezone
    const localTime = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: timezone
    }).format(new Date());

    console.log('Forecast Data:', forecast); // Log the forecast data

    return {
        location: data.resolvedAddress,
        tempC: current.temp,
        tempF: (current.temp * 9/5) + 32,
        condition: current.conditions,
        humidity: current.humidity,
        wind: current.windspeed,
        localTime: localTime, // Use the current time with the correct timezone
        sunrise: new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: timezone
        }).format(new Date(today.sunriseEpoch * 1000)),
        sunset: new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: timezone
        }).format(new Date(today.sunsetEpoch * 1000)),
        isDay: current.sunsetEpoch > current.datetimeEpoch,
        forecast: forecast // return the forecast data
    };
}



function updateBackground(condition, isDay) {
    const currentTime = new Date();
    const sunriseText = document.getElementById('sunrise').textContent;
    const sunsetText = document.getElementById('sunset').textContent;

    const [sunriseHours, sunriseMinutes, sunriseSeconds] = sunriseText.split(':');
    const sunriseTime = new Date();
    sunriseTime.setHours(sunriseHours, sunriseMinutes, sunriseSeconds);

    const [sunsetHours, sunsetMinutes, sunsetSeconds] = sunsetText.split(':');
    const sunsetTime = new Date();
    sunsetTime.setHours(sunsetHours, sunsetMinutes, sunsetSeconds);

    // Log the weather condition to ensure it matches our expectations
    console.log('Weather Condition:', condition);

    // Create copies of sunrise and sunset times for comparison
    const sunriseEnd = new Date(sunriseTime.getTime());
    sunriseEnd.setHours(sunriseEnd.getHours() + 1); // Sunrise ends 1 hour after sunrise time

    const sunsetEnd = new Date(sunsetTime.getTime());
    sunsetEnd.setHours(sunsetEnd.getHours() + 1); // Sunset ends 1 hour after sunset time

    let imageUrl = '';

    // Determine if it's sunrise, sunset, day or night
    if (currentTime >= sunriseTime && currentTime <= sunriseEnd) {
        imageUrl = 'images/sunrise.jpg'; // During sunrise (1-hour window)
    } else if (currentTime >= sunsetTime && currentTime <= sunsetEnd) {
        imageUrl = 'images/sunset.jpg'; // During sunset (1-hour window)
    } else if (isDay) {
        // Daytime backgrounds
        if (condition.toLowerCase().includes('clear')) {
            imageUrl = 'images/sunny-day.jpg';
        } else if (condition.toLowerCase().includes('cloudy') || condition.toLowerCase().includes('partially cloudy')) {
            imageUrl = 'images/cloudy-day.jpg';
        } else if (condition.toLowerCase().includes('rain')) {
            imageUrl = 'images/rainy.jpg';
        } else if (condition.toLowerCase().includes('snow')) {
            imageUrl = 'images/snowy.jpg';
        }
    } else {
        // Nighttime backgrounds
        if (condition.toLowerCase().includes('clear')) {
            imageUrl = 'images/clear-night.jpg';
        } else if (condition.toLowerCase().includes('cloudy') || condition.toLowerCase().includes('partially cloudy')) {
            imageUrl = 'images/cloudy-night.jpg';
        } else if (condition.toLowerCase().includes('rain')) {
            imageUrl = 'images/rainy-night.jpg';
        } else if (condition.toLowerCase().includes('snow')) {
            imageUrl = 'images/snowy.jpg';
        }
    }

    // Apply the background image
    if (imageUrl) {
        document.body.style.backgroundImage = `url('${imageUrl}')`;
        console.log(`Background updated to: ${imageUrl}`); // Log for debugging
    } else {
        console.warn('No matching background found for the given condition and time.');
    }
}




function displayWeather(weather) {
    document.getElementById('city-name').textContent = weather.location;
    document.getElementById('weather-condition').textContent = weather.condition;
    document.getElementById('temp').textContent = weather.tempC.toFixed(1);
    document.getElementById('unit').textContent = 'C';
    document.getElementById('humidity').textContent = weather.humidity;
    document.getElementById('wind').textContent = weather.wind;
    document.getElementById('local-time').textContent = weather.localTime;
    document.getElementById('sunrise').textContent = weather.sunrise;
    document.getElementById('sunset').textContent = weather.sunset;

    // Call updateBackground here after all data has been displayed
    updateBackground(weather.condition, weather.isDay);
    
    // Show the main weather info and forecast
    document.getElementById('weather-info').classList.remove('hidden');
    displayForecast(weather.forecast); // Display forecast below main info
}




// Display 7-day forecast
function displayForecast(forecast) {
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = ''; // Clear previous forecast

    if (!forecast || forecast.length === 0) {
        console.warn('No forecast data available');
        return;
    }

    console.log('Displaying forecast:', forecast); // Log the forecast data

    forecast.forEach(day => {
        const forecastDay = document.createElement('div');
        forecastDay.classList.add('forecast-day');
        const date = new Date(day.datetimeEpoch * 1000).toLocaleDateString();

        forecastDay.innerHTML = `
            <p class="date">${date}</p>
            <p class="conditions">${day.conditions}</p>
            <p class="temperature">${day.tempmin.toFixed(1)}°C - ${day.tempmax.toFixed(1)}°C</p>
        `;
        forecastContainer.appendChild(forecastDay);
    });

    // Ensure forecast container is visible
    document.getElementById('forecast-container').classList.remove('hidden');
}



// Celsius/Fahrenheit toggle
let isCelsius = true;
document.getElementById('toggleTemp').addEventListener('click', () => {
    const tempElement = document.getElementById('temp');
    const currentTemp = parseFloat(tempElement.textContent);

    if (isCelsius) {
        tempElement.textContent = ((currentTemp * 9/5) + 32).toFixed(1);
        document.getElementById('unit').textContent = 'F';
    } else {
        tempElement.textContent = ((currentTemp - 32) * 5/9).toFixed(1);
        document.getElementById('unit').textContent = 'C';
    }

    isCelsius = !isCelsius;
});

// Handle form submission
document.getElementById('locationForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const location = document.getElementById('location').value;

    // Show loading
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('weather-info').classList.add('hidden');
    document.getElementById('forecast-container').classList.add('hidden'); // Hide forecast while loading

    try {
        const weather = await fetchWeather(location);
        displayWeather(weather);
    } catch (error) {
        // Only show the alert if a real error occurs
        console.error('Failed to fetch weather data:', error);
        alert('Failed to fetch weather data. Please check your location input.');
    }

    // Hide loading
    document.getElementById('loading').classList.add('hidden');
});

