import { useEffect, useState } from "react";

export default function Home() {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    fetch("/api/data")
      .then((res) => res.json())
      .then((data) => setWeather(data));
  }, []);

  if (!weather) {
    return <p>Chargement...</p>;
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Météo</h1>

      <h2>
        {weather.name}, {weather.country}
      </h2>

      <p>🌡 Température : {weather.main.temp}°C</p>
      <p>💨 Vent : {weather.wind.speed} km/h</p>
      <p>🌥 {weather.weather[0].description}</p>
    </div>
  );
}