const button = document.querySelector('.button')
const tempSection = document.querySelector('.temperature');
const descSection = document.querySelector('.description');
const iconSection = document.querySelector('.icon');
const API_KEY = process.env.OPEN_WEATHER_MAP_KEY


button.addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(success, fail);
})

const success = (position) => {
    const latitude = position.coords.latitude
    const longitude = position.coords.longitude

    getWeather(latitude, longitude)
}

const fail = () => {
    alert("현재 위치 불러오기 실패")
}

const getWeather = (lat, lon) => {
    fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`
    ).then(res => {
        return res.json();
    }).then(res => {
        console.log(res)
        const temperature = res.main.temp;
        const description = res.weather[0].description;
        const icon = res.weather[0].icon;
        const iconURL = `http://openweathermap.org/img/wn/${icon}@2x.png`;
  
        iconSection.setAttribute('src', iconURL);
        tempSection.innerText = temperature;
        descSection.innerText = description;
    }).catch(e => {
        alert(e)
    })
}