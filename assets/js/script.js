// days will be an array of objects that can be displayed to the screen.
// Current weather data will consist of the most current/recent readings on page load
// Days that are part of a five day forecast shall be averages of all of the available readings for that day

// API Weather is updated daily at 1, 4, 7, and 10 am, and 1, 4, 7, and 10pm

const days = [];
// 26th
let today = '';

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

class day {
    constructor (initHour, description, temperature, humidity, wind) {
        this.initHour = initHour;
        this.description = description;
        this.temperature = temperature;
        this.humidity = humidity;
        this.wind = wind;
    }
}

// CURRENT DAY
// weather? will be current weather
fetch(`https://api.openweathermap.org/data/2.5/weather?q=Fairmont,mn,us&APPID=3c4a8622d9bece109edad25f2ea3818a&units=imperial`)
.then( response => response.json() )
.then( block => {

    // date = September 
    today = moment.unix(block.dt).format('Do');
    const initTime = moment.unix(block.dt).format('MMMM Do YYYY hh:mm:ss a');
    const description = block.weather[0].main;
    const temperature = block.main.temp;
    const humidity = block.main.humidity;
    const wind = block.wind.speed;
    const obj = new day(initTime, description, temperature, humidity, wind);
    days.push(obj);
    console.log(days[0])
});

// FORECAST
fetch(`https://api.openweathermap.org/data/2.5/forecast?q=Fairmont,mn,us&APPID=3c4a8622d9bece109edad25f2ea3818a&units=imperial`)
.then( response => response.json() )
.then( data => {

    // current day as in 276 or something
    const today = parseInt(moment.unix(data.list[0].dt).format('DDDD'));

    let averages = {
        descriptions: [],
        temperature: 0,
        humidity: 0,
        wind: 0
    }

    // For each day(multiple blocks) average all values for that day then add to days array
    data.list.forEach( (threeHour) => {

        // current weather doesn't need to be included
        if ( moment.unix(threeHour.dt).format('Do') != today ) {

            // Weather is updated daily at 1, 4, 7, and 10 am, and 1, 4, 7, and 10pm
            let initHour = moment.unix(threeHour.dt).format('MMMM Do YYYY hh a');
            console.log(initHour)

        }

    });

});