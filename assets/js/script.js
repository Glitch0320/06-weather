// TODO: save city name and coordinates to localStorage

// add city name to header
// add current date to header
// add day(Monday) to forecast days

// SELECT FORM ELEMS and Display Divs
submit = $('header').children().eq(1);
currentDiv = document.querySelector('main').children[0];
forecastDiv = document.querySelector('main').children[1];
var lat = '';
var long = '';
let weekday = moment().format('dddd')

submit.on('click', () => {

    getCoords();

});

function getCoords() {

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(saveCoords);
    } else {
        alert('This browser doesn\'t support geolocation');
    }

} 

function saveCoords(position) {
    lat = position.coords.latitude;
    long = position.coords.longitude;
    getData()
}


//  forecast will be an object containing day objects
// Current weather data will consist of the most current/recent readings on page load
// Days that are part of a five day forecast shall be averages of all of the available readings for that day

// API Weather is updated daily at 1, 4, 7, and 10 am, and 1, 4, 7, and 10pm

const forecast = [];
// 270
const today = moment().format('DDDD');

function findMost(arr) {
    // Return the item found most in an array, if tie, returns first
    let most = 0;
    let val = '';
    for (let i = 0; i < arr.length; i++) {
        let x = 0;
        for (let j = 0; j < arr.length; j++) {
            arr[j] === arr[i] ? x++ : x += 0;
        }
        if (x > most) {
            val = arr[i];
            most = x;
        }
    }
    return val;
}

// THANKS TO GARY
function addToDOM(tag, content, appendTo){
    const elem = document.createElement(tag)
    elem.textContent = content
    appendTo.appendChild(elem)
  }

function display(day, type) {

    // description
    icon = document.createElement('img')
    icon.setAttribute('src', `http://openweathermap.org/img/wn/${day.description}@2x.png`)
    // temp
    domTemp = day.temperature;
    domHumidity = day.humidity;
    domWind = day.wind;

    if (type === 'current') {
        let curr = document.createElement('section');
        currentDiv.appendChild(curr);
        curr.setAttribute('class', 'col col-6 p-1 border border-3 border-success rounded-3');
        curr.appendChild(icon);
        addToDOM('span', 'Temperature: ' + domTemp, curr);
        addToDOM('span', 'Humidity: ' + domHumidity, curr);
        addToDOM('span', 'Wind Speed: ' + domWind, curr);
    } else {
        let fore = document.createElement('section');
        forecastDiv.appendChild(fore);
        fore.setAttribute('class', 'col p-1 m-1 border border-3 border-success rounded-3');
        fore.appendChild(icon);
        addToDOM('span', 'Temperature: ' + domTemp, fore);
        addToDOM('span', 'Humidity: ' + domHumidity, fore);
        addToDOM('span', 'Wind Speed: ' + domWind, fore);
    }
    
}

class day {
    constructor (description, temperature, humidity, wind) {
        this.description = description;
        this.temperature = temperature;
        this.humidity = humidity;
        this.wind = wind;
    }
}

function getData() {

// CURRENT DAY
// weather? will be current weather
fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&APPID=3c4a8622d9bece109edad25f2ea3818a&units=imperial`)
.then( response => response.json() )
.then( block => {

    const description = block.weather[0].icon;
    const temperature = Math.round(block.main.temp);
    const humidity = block.main.humidity;
    const wind = Math.round(block.wind.speed);
    const obj = new day(description, temperature, humidity, wind);

    // display to dom
    display(obj, 'current');

});

// FORECAST
fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&APPID=3c4a8622d9bece109edad25f2ea3818a&units=imperial`)
.then( response => response.json() )
.then( data => {

    let avgIndex = 0;
    let temp = {
        descriptions: [],
        temperature: 0,
        humidity: 0,
        wind: 0,
    }

    // this will start at index 271 for example
    currentDay = parseInt(today) + 1;

    // For each day(multiple blocks) average all values for that day then add to forecast array
    data.list.forEach( (increment) => {

        incrementDay = parseInt(moment.unix(increment.dt).format('DDDD'))

        // current weather doesn't need to be included
        if ( incrementDay != today ) {

            // current day will = 270 until incrementday moves to 271, then currentday = 271
            if ( incrementDay === currentDay ) {

                temp.descriptions.push(increment.weather[0].icon);
                temp.temperature += increment.main.temp;
                temp.humidity += increment.main.humidity;
                temp.wind += increment.wind.speed;
                avgIndex++;

            } else {

                // average the last day and add it to days, then add this increment to temp, then add one to currentday
                description = findMost(temp.descriptions);
                temperature = Math.round(temp.temperature / avgIndex);
                humidity = Math.round(temp.humidity / avgIndex);
                wind = Math.round(temp.wind / avgIndex);
                let averageOfToday = new day(description, temperature, humidity, wind);
                forecast.push(averageOfToday);

                temp = {
                    descriptions: [],
                    temperature: 0,
                    humidity: 0,
                    wind: 0,
                }

                currentDay++;
                avgIndex = 0;

            }

        }

    });

    // display to dom
    for (let i = 0; i < forecast.length; i++) {

        display(forecast[i], 'forecast');

    }

});

}