🌦️ Weather App (Open-Meteo + JavaScript)

Este proyecto es una implementación básica en JavaScript que permite obtener el clima actual de una ciudad utilizando la API pública de Open-Meteo.

Está diseñado como ejemplo educativo para entender:

Uso de fetch para consumir APIs
Manejo de errores
Procesamiento de datos JSON
Integración básica con HTML

Requisitos

No necesitas instalar dependencias externas.

Solo necesitas:

Un navegador moderno (Chrome, Edge, Firefox)
(Recomendado) VS Code + extensión Live Server


🚀 Instalación y ejecución
1. Clonar o crear el proyecto

Estructura mínima:

/proyecto
  ├── index.html
  └── weather.js
2. Configurar el HTML

Asegúrate de incluir el script correctamente:

<script type="module" src="weather.js"></script>
3. Ejecutar el proyecto

⚠️ Importante: No abras el archivo con doble clic (file://).

Usa un servidor local:

Opción recomendada (VS Code):
Instala Live Server
Click derecho en index.html
Selecciona Open with Live Server
🧠 Descripción de la función principal
getWeatherByCity(city)

Obtiene información del clima actual de una ciudad en dos pasos:

Convierte el nombre de la ciudad en coordenadas (lat/lon)
Consulta el clima usando esas coordenadas
🔧 Parámetros
Parámetro	Tipo	Obligatorio	Descripción
city	string	✅ Sí	Nombre de la ciudad a consultar
Ejemplo válido:
getWeatherByCity("Madrid");
Ejemplo inválido:
getWeatherByCity("");        // Vacío
getWeatherByCity(123);       // Tipo incorrecto
📤 Valor de retorno

La función devuelve una Promesa (Promise) que resuelve a un objeto JSON.

✅ Caso exitoso
{
  "city": "Madrid",
  "temperature": 25,
  "description": "Cielo despejado"
}
❌ Caso de error
{
  "error": true,
  "message": "No se encontró la ciudad especificada."
}
💡 Ejemplo de uso
getWeatherByCity("Madrid")
  .then(data => {
    if (data.error) {
      console.error(data.message);
    } else {
      console.log("Ciudad:", data.city);
      console.log("Temperatura:", data.temperature);
      console.log("Clima:", data.description);
    }
  })
  .catch(error => {
    console.error("Error inesperado:", error);
  });
🌐 APIs utilizadas
1. Geocoding API (Open-Meteo)

Convierte nombre de ciudad en coordenadas:

https://geocoding-api.open-meteo.com/v1/search?name={city}
2. Weather API (Open-Meteo)

Obtiene el clima:

https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true
⚠️ Manejo de errores

La función contempla los siguientes casos:

Ciudad inválida o no encontrada
Error en la respuesta de la API
Problemas de red
Datos meteorológicos no disponibles
🧪 Casos de prueba sugeridos
✅ Casos válidos
Entrada	Resultado esperado
"Madrid"	Datos correctos
"New York"	Datos correctos
"Tokyo"	Datos correctos
❌ Casos inválidos
Entrada	Resultado esperado
""	Error de validación
"asdfghjkl"	Ciudad no encontrada
null	Error de validación
123	Error de tipo
🌐 Casos de fallo de red

Simular:

Desconectar internet
Cambiar URL de la API manualmente

Resultado esperado:

{
  "error": true,
  "message": "Error al obtener datos..."
}
📌 Buenas prácticas para el equipo
Siempre validar inputs antes de llamar la función
Manejar tanto .then como .catch
No asumir que la API siempre responde correctamente
Mantener separada la lógica (JS) de la UI (HTML)
🔄 Posibles mejoras futuras
Interfaz con input y botón
Soporte para múltiples ciudades
Mostrar más datos (humedad, viento, etc.)
Internacionalización (idiomas)
Cache de resultados
