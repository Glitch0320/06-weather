// add current date to header

// SELECT FORM ELEMS and Display Divs
cityInput = $('header').children().eq(1);
historyResults = $('header').children().eq(5);
search = $('header').children().eq(2);
submit = $('header').children().eq(3);
currentDiv = document.querySelector('main').children[0];
forecastDiv = document.querySelector('main').children[1];
var lat = '';
var long = '';

// LOCAL STORAGE
let history = localStorage.getItem('history');
history = history ? JSON.parse(history) : [];

// show history
history.forEach( city => {

    addToDOM('button', city, historyResults);

});

// FUNCTIONS

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
    currUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&APPID=3c4a8622d9bece109edad25f2ea3818a&units=imperial`;
    foreUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&APPID=3c4a8622d9bece109edad25f2ea3818a&units=imperial`;
    getData(currUrl, foreUrl)
}

const forecast = [];

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
    
    if (tag === 'button') {
        appendTo.append(`<button class="hstry m-1" type="button">${content.toUpperCase()}</button>`)
    } else {
        const elem = document.createElement(tag)
        elem.textContent = content
        appendTo.appendChild(elem)
    }

  }

function display(day, type) {

    // date
    domDay = day.date;
    // description
    icon = document.createElement('img')
    icon.setAttribute('src', `http://openweathermap.org/img/wn/${day.description}@2x.png`)
    // stats
    domTemp = day.temperature;
    domHumidity = day.humidity;
    domWind = day.wind;

    if (type === 'current') {
        addToDOM('h3', moment().format('dddd, MMMM Do, YYYY'), currentDiv);
        let curr = document.createElement('section');
        currentDiv.appendChild(curr);
        curr.setAttribute('class', 'col col-6 p-1 border border-3 border-success rounded-3');
        addToDOM('span', 'Current Weather', curr);
        curr.appendChild(icon);
        addToDOM('span', 'Temperature: ' + domTemp, curr);
        addToDOM('span', 'Humidity: ' + domHumidity, curr);
        addToDOM('span', 'Wind Speed: ' + domWind, curr);
    } else {
        let fore = document.createElement('section');
        forecastDiv.appendChild(fore);
        fore.setAttribute('class', 'col p-1 m-1 border border-3 border-success rounded-3');
        addToDOM('span', domDay, fore)
        fore.appendChild(icon);
        addToDOM('span', 'Temperature: ' + domTemp, fore);
        addToDOM('span', 'Humidity: ' + domHumidity, fore);
        addToDOM('span', 'Wind Speed: ' + domWind, fore);
    }
    
}

class day {
    constructor (date, description, temperature, humidity, wind) {
        this.date = date;
        this.description = description;
        this.temperature = temperature;
        this.humidity = humidity;
        this.wind = wind;
    }
}

function getData(currUrl, foreUrl) {

// CURRENT Weather
fetch(currUrl)
.then( response => response.json() )
.then( block => {

    addToDOM('h2', block.name, currentDiv);

    const date = moment.unix(block.dt).format('dddd');
    const description = block.weather[0].icon;
    const temperature = Math.round(block.main.temp);
    const humidity = block.main.humidity;
    const wind = Math.round(block.wind.speed);
    const obj = new day(date, description, temperature, humidity, wind);

    // display to dom
    display(obj, 'current');

});

// FORECAST
fetch(foreUrl)
.then( response => response.json() )
.then( data => {

    // clear forecast
    forecast.splice(0)

    // TODO: Increment day every time
    thisDate = moment()
    thisDate.add(1, 'days')

    let avgIndex = 0;
    let temp = {
        descriptions: [],
        temperature: 0,
        humidity: 0,
        wind: 0
    }

    // this will start at index 271 for example
    today = moment().format('DDDD')
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
                dayOfWeek = thisDate.format('dddd');
                description = findMost(temp.descriptions);
                temperature = Math.round(temp.temperature / avgIndex);
                humidity = Math.round(temp.humidity / avgIndex);
                wind = Math.round(temp.wind / avgIndex);
                let averageOfToday = new day(dayOfWeek, description, temperature, humidity, wind);
                forecast.push(averageOfToday);
                thisDate.add(1, 'days');

                temp = {
                    descriptions: [],
                    temperature: 0,
                    humidity: 0,
                    wind: 0
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

// EVENT LISTENERS

// Local Forecast
submit.on('click', () => {

    $('main').children().eq(0).text('')
    $('main').children().eq(1).text('')
    getCoords()

});

// Search City
search.on('click', () => {

    $('main').children().eq(0).text('')
    $('main').children().eq(1).text('')

    var city = cityInput.val();
    console.log(cityInput.val())
    if (!city) {
        alert('Please enter city name.')
        return;
    }

    // TODO: Add city to localStorage
    history.push(city)
    localStorage.setItem('history', JSON.stringify(history))

    // Show History
    historyResults.text('')
    history.forEach( city => {

        addToDOM('button', city, historyResults);
    
    });

    // search by city name
    currUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&limit=5&appid=3c4a8622d9bece109edad25f2ea3818a&units=imperial`;
    foreUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&limit=5&appid=3c4a8622d9bece109edad25f2ea3818a&units=imperial`;
    getData(currUrl, foreUrl)

});

$('.hstry').on('click', (e) => {

    $('main').children().eq(0).text('')
    $('main').children().eq(1).text('')

    // Call getData with current city name
    city = e.target.innerHTML;
    currUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&limit=5&appid=3c4a8622d9bece109edad25f2ea3818a&units=imperial`;
    foreUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&limit=5&appid=3c4a8622d9bece109edad25f2ea3818a&units=imperial`;
    getData(currUrl, foreUrl)

});

$('header').children().eq(6).on('click', () => {

    // Clear History
    history = [];
    localStorage.setItem('history', history);
    historyResults.text('');

});