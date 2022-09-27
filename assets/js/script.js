// SELECT FORM ELEMS and Display Divs
submit = $('main').children().eq(0);
var lat = '';
var long = '';

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
    console.log(lat + ' ' + long)
    getData()
}


// days will be an array of objects that can be displayed to the screen.
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
    document.querySelector(appendTo).appendChild(elem)
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

    // date = September 
    const initTime = moment.unix(block.dt).format('MMMM Do YYYY hh:mm:ss a');
    const description = block.weather[0].main;
    const temperature = block.main.temp;
    const humidity = block.main.humidity;
    const wind = block.wind.speed;
    const obj = new day(initTime, description, temperature, humidity, wind);

    // display to dom


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

    // For each day(multiple blocks) average all values for that day then add to days array
    data.list.forEach( (increment, i) => {

        incrementDay = parseInt(moment.unix(increment.dt).format('DDDD'))

        // current weather doesn't need to be included
        if ( incrementDay != today ) {

            // current day will = 270 until incrementday moves to 271, then currentday = 271
            if ( incrementDay === currentDay ) {

                temp.descriptions.push(increment.weather[0].main);
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
    console.log(forecast)

});

}