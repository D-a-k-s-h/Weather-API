const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector('[data-searchWeather]');
const grantAccessContainer = document.querySelector('.grant-location-container');
const searchForm = document.querySelector('[data-searchForm]');
const loadingScreen = document.querySelector('.loading-container');
const userInfoContainer = document.querySelector('.user-info-container');
const errorPage = document.querySelector('.error-page');

let currentTab = userTab;
const API_KEY = "14e600a49c963462171ffd57508359ad";
currentTab.classList.add('current-tab');
grantAccessContainer.classList.add('active');


//switching tabs

function switchTab(clickedTab){

    if(clickedTab != currentTab){
        currentTab.classList.remove('current-tab');
        currentTab = clickedTab;
        currentTab.classList.add('current-tab');

        //making search weather tab visible
        if(!searchForm.classList.contains('active')){
            //if input tag and button is invisible make it visible
            grantAccessContainer.classList.remove('active');
            userInfoContainer.classList.remove('active');
            searchForm.classList.add('active');
        }
        //switching to your weather tab
        else{
            //we are in search weather tab we want to switch to make weather tab visible
            searchForm.classList.remove('active');
            //make details searched invisible as well
            userInfoContainer.classList.remove('active');
            
            getfromSessionStorage();
        }
    }

};


userTab.addEventListener('click',() => {
    switchTab(userTab);
});

searchTab.addEventListener('click',() => {
    switchTab(searchTab);
});


function getfromSessionStorage(){
    const localCoordinates = sessionStorage.getItem('user-coordinates');
    if(!localCoordinates){
        //if local coordinates are not found then we have to grant the access
        grantAccessContainer.classList.add('active');
    }
    else{
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates){
    const {lat,lon} = coordinates;
    //make grant access screen invisible
    grantAccessContainer.classList.remove('active');
    //make loading gif visible
    loadingScreen.classList.add('active');

    try{
        const respond = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        const data = await respond.json();

        //make loading screen invisible
        loadingScreen.classList.remove('active');
        userInfoContainer.classList.add('active');
        renderWeatherInfo(data);
    }
    catch(err){
        loadingScreen.classList.remove('active');
        // errorPage.classList.add('active');
        alert('unable to fetch data');
    }
}

function renderWeatherInfo(weatherInfo){

    const cityName = document.querySelector('[data-cityName]');
    const countryIcon = document.querySelector('[data-countryIcon]');
    const weatherDesc = document.querySelector('[data-weatherDesc]');
    const weatherIcon = document.querySelector('[data-weatherIcon]');
    const temp = document.querySelector('[data-temp]');
    const windSpeed = document.querySelector('[data-windspeed]');
    const humidity = document.querySelector('[data-humidity]');
    const cloudiness = document.querySelector('[data-cloudiness]');

    //fetching details from json object and displaying it in UI
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    weatherDesc.innerText = `${weatherInfo?.weather?.[0]?.main}`;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${(weatherInfo?.main?.temp/10).toFixed(2)} °C`;
    windSpeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity} %`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all} %`;
}

function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        alert('Location Access Needed');
    }
}

function showPosition(position){
    
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    };

    sessionStorage.setItem('user-coordinates',JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);

}

const grantAccessButton = document.querySelector('[data-grantAccess]');
grantAccessButton.addEventListener('click',getLocation);

let searchInput = document.querySelector('[data-searchInput]');

searchForm.addEventListener('submit',(e) => {
    e.preventDefault();
    if(searchInput.value === ""){
        return;
    }
    else{
        fetchSearchWeatherInfo(searchInput.value);
    }

});

async function fetchSearchWeatherInfo(city) {

    loadingScreen.classList.add('active');
    userInfoContainer.classList.remove('active');
    grantAccessContainer.classList.remove('active');

    try{
        const respond = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`);
        const data = await respond.json();

        loadingScreen.classList.remove('active');
        if(data?.name == undefined){
            userInfoContainer.classList.remove('active');
            errorPage.classList.add('active');
        }
        else{
            errorPage.classList.remove('active');
            renderWeatherInfo(data);
            userInfoContainer.classList.add('active');
        }
    }
    catch(err){
        loadingScreen.classList.remove('active');
        errorPage.classList.add('active');
    }
}