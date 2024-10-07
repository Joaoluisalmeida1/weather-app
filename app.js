
// Fetch weather data based on location
async function fetchWeather(location) {
    const apiKey = '9HGEHAXJGF3BCD933BM7HNM7E';
    const response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?key=${apiKey}&unitGroup=metric`);
    const data = await response.json();
    return processWeatherData(data);
}

// Process the weather data
function processWeatherData(data) {
    const current = data.currentConditions;
    return {
        location: data.resolvedAddress,
        tempC: current.temp,
        tempF: (current.temp * 9/5) + 32,
        condition: current.conditions,
        isDay: current.sunsetEpoch > current.datetimeEpoch
    };
}

// Display weather information
function displayWeather(weather) {
    document.getElementById('city-name').textContent = weather.location;
    document.getElementById('weather-condition').textContent = weather.condition;
    document.getElementById('temp').textContent = weather.tempC.toFixed(1);
    document.getElementById('unit').textContent = 'C';

    // Update the background based on weather and time of day
    updateBackground(weather.condition, weather.isDay);

    document.getElementById('weather-info').classList.remove('hidden');
}

// Update the background image based on the weather condition
function updateBackground(condition, isDay) {
    let imageUrl = '';
    if (condition.includes('Clear')) {
        imageUrl = isDay ? 'sunny-day.jpg' : 'clear-night.jpg';
    } else if (condition.includes('Cloudy')) {
        imageUrl = 'cloudy.jpg';
    } else if (condition.includes('Rain')) {
        imageUrl = 'rainy.jpg';
    } else if (condition.includes('Snow')) {
        imageUrl = 'snowy.jpg';
    } else {
        imageUrl = 'default.jpg'; // fallback image
    }

    document.body.style.backgroundImage = `url('${imageUrl}')`;
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

    try {
        const weather = await fetchWeather(location);
        displayWeather(weather);
    } catch (error) {
        alert('Failed to fetch weather data. Please check your location input.');
    }

    // Hide loading
    document.getElementById('loading').classList.add('hidden');
});
    