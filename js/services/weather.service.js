export async function fetchWeatherForDay(day) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${day.lat}&longitude=${day.lon}&daily=temperature_2m_max&timezone=Asia%2FHo_Chi_Minh`;
  const response = await fetch(url);
  const data = await response.json();
  return Math.round(data.daily.temperature_2m_max[0]);
}
