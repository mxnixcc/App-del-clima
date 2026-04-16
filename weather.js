/**
 * Obtiene el clima actual de una ciudad usando Open-Meteo
 * @param {string} city - Nombre de la ciudad
 * @returns {Promise<Object>} - Objeto con ciudad, temperatura y descripción
 */
async function getWeatherByCity(city) {
  try {
    // 1. Validar entrada
    if (!city || typeof city !== "string") {
      throw new Error("Debes proporcionar un nombre de ciudad válido.");
    }

    // 2. Obtener latitud y longitud desde la API de geocodificación
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
    const geoResponse = await fetch(geoUrl);

    // Verificar si la respuesta fue exitosa
    if (!geoResponse.ok) {
      throw new Error("Error al obtener datos de geolocalización.");
    }

    const geoData = await geoResponse.json();

    // Verificar si se encontró la ciudad
    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("No se encontró la ciudad especificada.");
    }

    const { latitude, longitude, name } = geoData.results[0];

    // 3. Obtener datos meteorológicos actuales
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
    const weatherResponse = await fetch(weatherUrl);

    if (!weatherResponse.ok) {
      throw new Error("Error al obtener datos meteorológicos.");
    }

    const weatherData = await weatherResponse.json();

    // Verificar si existen datos meteorológicos
    if (!weatherData.current_weather) {
      throw new Error("No hay datos meteorológicos disponibles.");
    }

    const { temperature, weathercode } = weatherData.current_weather;

    // 4. Traducir el código de clima a una descripción simple
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

    // 5. Devolver el resultado en formato JSON
    return {
      city: name,
      temperature: temperature,
      description: description
    };

  } catch (error) {
    // Manejo general de errores
    return {
      error: true,
      message: error.message
    };
  }
}

getWeatherByCity("Madrid")
  .then(data => {
    console.log("Resultado:", data);
  })
  .catch(error => {
    console.error("Error:", error);
  });