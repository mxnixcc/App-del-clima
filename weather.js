/* ========================= */
/* 🧠 CACHE (NUEVO - AÑADIDO) */
/* ========================= */

const CACHE_PREFIX = "weather_";
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

function saveToCache(city, data) {
  const cacheData = {
    data,
    timestamp: Date.now()
  };
  localStorage.setItem(CACHE_PREFIX + city.toLowerCase(), JSON.stringify(cacheData));
}

function getFromCache(city) {
  const cached = localStorage.getItem(CACHE_PREFIX + city.toLowerCase());
  if (!cached) return null;

  const parsed = JSON.parse(cached);
  const isExpired = Date.now() - parsed.timestamp > CACHE_DURATION;

  if (isExpired) {
    localStorage.removeItem(CACHE_PREFIX + city.toLowerCase());
    return null;
  }

  return parsed.data;
}

/**
 * Obtiene el clima actual de una ciudad usando Open-Meteo
 */
async function getWeatherByCity(city) {
  try {
    if (!city || typeof city !== "string") {
      throw new Error("Debes proporcionar un nombre de ciudad válido.");
    }

    const cachedData = getFromCache(city);
    if (cachedData) {
      console.log("Usando caché para:", city);
      return cachedData;
    }

    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
    const geoResponse = await fetch(geoUrl);

    if (!geoResponse.ok) {
      throw new Error("Error al obtener datos de geolocalización.");
    }

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("No se encontró la ciudad especificada.");
    }

    const { latitude, longitude, name } = geoData.results[0];

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      throw new Error("Error al obtener datos meteorológicos.");
    }

    const weatherData = await weatherResponse.json();

    if (!weatherData.current_weather) {
      throw new Error("No hay datos meteorológicos disponibles.");
    }

    const { temperature, weathercode } = weatherData.current_weather;

    const weatherDescriptions = {
      0: "Cielo despejado",
      1: "Mayormente despejado",
      2: "Parcialmente nublado",
      3: "Nublado",
      45: "Niebla",
      48: "Niebla con escarcha",
      51: "Llovizna ligera",
      53: "Llovizna moderada",
      55: "Llovizna intensa",
      61: "Lluvia ligera",
      63: "Lluvia moderada",
      65: "Lluvia intensa",
      71: "Nieve ligera",
      73: "Nieve moderada",
      75: "Nieve intensa",
      95: "Tormenta"
    };

    const description = weatherDescriptions[weathercode] || "Clima desconocido";

    const result = {
      city: name,
      temperature: temperature,
      description: description
    };

    saveToCache(city, result);

    return result;

  } catch (error) {
    const cachedData = getFromCache(city);
    if (cachedData) {
      console.log("Fallback a caché para:", city);
      return cachedData;
    }

    return {
      error: true,
      message: error.message
    };
  }
}

/* ========================= */
/* 🆕 MULTI CIUDAD           */
/* ========================= */

async function getWeatherByCities(cities) {
  try {
    if (!Array.isArray(cities) || cities.length === 0) {
      throw new Error("Debes proporcionar un array de ciudades.");
    }

    const promises = cities.map(city => getWeatherByCity(city));
    return await Promise.all(promises);

  } catch (error) {
    return { error: true, message: error.message };
  }
}

/* ========================= */
/* 🆕 PRONÓSTICO 5 DÍAS      */
/* ========================= */

async function getFiveDayForecast(city) {
  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("No se encontró la ciudad.");
    }

    const { latitude, longitude } = geoData.results[0];

    const forecastUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;

    const response = await fetch(forecastUrl);
    const data = await response.json();

    return data.daily;

  } catch (error) {
    return { error: true, message: error.message };
  }
}

/* ========================= */
/* 🖥️ INTERFAZ DE USUARIO     */
/* ========================= */

const input = document.getElementById("citiesInput");
const button = document.getElementById("getWeatherBtn");
const resultsContainer = document.getElementById("results");

button.addEventListener("click", async () => {
  const value = input.value;

  const cities = value
    .split(",")
    .map(city => city.trim())
    .filter(city => city.length > 0);

  if (cities.length === 0) {
    resultsContainer.innerHTML = "<p>Por favor ingresa al menos una ciudad.</p>";
    return;
  }

  resultsContainer.innerHTML = "<p>Cargando...</p>";

  try {
    const results = await getWeatherByCities(cities);

    // 🔥 NUEVO: también obtener pronóstico por ciudad
    const forecasts = await Promise.all(
      cities.map(city => getFiveDayForecast(city))
    );

    resultsContainer.innerHTML = results.map((result, index) => {
      if (result.error) {
        return `<p>❌ ${result.message}</p>`;
      }

      const forecast = forecasts[index];

      let forecastHTML = "";

      if (!forecast.error) {
        forecastHTML = forecast.time.slice(0, 5).map((date, i) => {
          return `
            <li>
              📅 ${date} - 🌡️ ${forecast.temperature_2m_min[i]}° / ${forecast.temperature_2m_max[i]}°
            </li>
          `;
        }).join("");
      }

      return `
        <div>
          <h3>${result.city}</h3>
          <p>🌡️ ${result.temperature} °C</p>
          <p>☁️ ${result.description}</p>
          
          <h4>Pronóstico 5 días:</h4>
          <ul>${forecastHTML}</ul>
        </div>
        <hr/>
      `;
    }).join("");

  } catch (error) {
    resultsContainer.innerHTML = "<p>Error al obtener los datos.</p>";
  }
});