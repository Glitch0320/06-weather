fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=43.661340&lon=-94.460580&appid=3c4a8622d9bece109edad25f2ea3818a`)
.then( response => response.json() )
.then( data => console.log(data) );

// here data.list = 40 3 hour increments of information