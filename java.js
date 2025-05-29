const apiKey = "6ea198f672bbcdea0ba26e006d082d29"; // kendi API anahtarını yaz

function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return alert("Şehir gir!");

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&lang=tr&units=metric`)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== 200) {
        document.getElementById("weatherResult").innerHTML = "Şehir bulunamadı.";
        return;
      }

      const weather = data.weather[0].main.toLowerCase();
      const temp = data.main.temp;
      const desc = data.weather[0].description;

      document.getElementById("weatherResult").innerHTML = `
        ${city.toUpperCase()} | ${desc} | ${temp}°C
      `;

      changeBackground(weather);
      getForecast(city);
    })
    .catch(() => {
      document.getElementById("weatherResult").innerHTML = "Veri alınamadı.";
    });
}

function changeBackground(weather) {
  const video = document.getElementById("bg-video");
  const source = video.querySelector("source");

  let src = "clear.mp4";
  if (weather.includes("cloud")) src = "clouds.mp4";
  else if (weather.includes("rain")) src = "rain.mp4";
  else if (weather.includes("snow")) src = "snow.mp4";
  else if (weather.includes("thunder")) src = "thunderstorm.mp4";
  else if (weather.includes("clear")) src = "clear.mp4";

  source.src = src;
  video.load();
  video.play().catch(e => console.log("Video oynatılmadı:", e));
}

// FAVORİLER
function addFavorite() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return;

  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  if (!favorites.includes(city)) {
    favorites.push(city);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    renderFavorites();
  }
}

function renderFavorites() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const container = document.getElementById("favorites");
  container.innerHTML = "";

  favorites.forEach((city) => {
    const item = document.createElement("div");
    item.classList.add("fav-item");

    const btn = document.createElement("button");
    btn.textContent = city;
    btn.onclick = () => {
      document.getElementById("cityInput").value = city;
      getWeather();
    };

    const del = document.createElement("span");
    del.textContent = "❌";
    del.classList.add("delete-btn");
    del.onclick = () => removeFavorite(city);

    item.appendChild(btn);
    item.appendChild(del);
    container.appendChild(item);
  });
}

function removeFavorite(city) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites = favorites.filter(c => c !== city);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavorites();
}

function toggleFavorites() {
  const favBox = document.getElementById("favorites");
  favBox.classList.toggle("show");
  favBox.classList.toggle("hidden");
}

// 5 GÜNLÜK TAHMİN
function getForecast(city) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=tr`)
    .then(res => res.json())
    .then(data => {
      const forecastEl = document.getElementById("forecast");
      forecastEl.innerHTML = "<h3>5 Günlük Tahmin</h3>";

      const daily = {};

      data.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];
        const hour = item.dt_txt.split(" ")[1];

        if (hour === "12:00:00") {
          daily[date] = item;
        }
      });

      Object.keys(daily).slice(0, 5).forEach(date => {
        const item = daily[date];
        const temp = Math.round(item.main.temp);
        const desc = item.weather[0].description;
        const icon = item.weather[0].icon;

        forecastEl.innerHTML += `
          <div class="forecast-day">
            <div>${new Date(date).toLocaleDateString("tr-TR", { weekday: 'short' })}</div>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" />
            <div>${desc}</div>
            <div>${temp}°C</div>
          </div>
        `;
      });
    })
    .catch(() => {
      document.getElementById("forecast").innerHTML = "Tahmin alınamadı.";
    });
}

window.onload = () => {
  renderFavorites();
};
