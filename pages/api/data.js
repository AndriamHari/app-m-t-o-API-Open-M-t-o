import config from "../../config.json";

let latestWeather = null;

async function fetchWeather() {
  const { city } = config;

  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}`
  );
  const geoData = await geoRes.json();

  if (!geoData.results || geoData.results.length === 0) {
    throw new Error("Ville non trouvée dans config.json");
  }

  const { latitude, longitude, name, country } = geoData.results[0];

  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
  );
  const weatherData = await weatherRes.json();

  latestWeather = {
    name,
    country,
    main: {
      temp: weatherData.current_weather.temperature,
    },
    wind: {
      speed: weatherData.current_weather.windspeed,
    },
    weather: [
      {
        description: getWeatherDescription(weatherData.current_weather.weathercode),
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

function getWeatherDescription(code) {
  const codes = {
    0: "Ciel clair",
    1: "Principalement dégagé",
    2: "Partiellement nuageux",
    3: "Couvert",
    45: "Brouillard",
    48: "Brouillard givrant",
    51: "Bruine légère",
    53: "Bruine modérée",
    55: "Bruine dense",
    61: "Pluie légère",
    63: "Pluie modérée",
    65: "Pluie forte",
    71: "Neige légère",
    73: "Neige modérée",
    75: "Neige forte",
    80: "Averses légères",
    81: "Averses modérées",
    82: "Averses fortes",
    95: "Orage",
  };

  return codes[code] || `Code météo : ${code}`;
}

// premier chargement
fetchWeather().catch((error) => {
  console.error("Erreur initiale météo :", error.message);
});

// rafraîchissement toutes les heures
setInterval(() => {
  fetchWeather().catch((error) => {
    console.error("Erreur refresh météo :", error.message);
  });
}, 3600000);

export default async function handler(req, res) {
  try {
    if (!latestWeather) {
      await fetchWeather();
    }

    return res.status(200).json(latestWeather);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}