var day = $("#day");
var time = $("#time");
var today = moment();
var input = $("#city-search");
var form = $("#form");
var apikey = "&appid=ea2e27e3a4ddb3ac5ad50ed170e71c47";
var oneCall = "https://api.openweathermap.org/data/2.5/onecall?";
var weather = "https://api.openweathermap.org/data/2.5/weather?q=";
var oneCallUrl = "";
var weatherUrl = "";
var recentSearches = $("#recent-searches");
var recentArr = [];
var lat;
var lon;
var coords;
var city;

// initialize function that grabs recent searches from local storage
function init() {
  var stored = JSON.parse(localStorage.getItem("recentArr"));
  if (stored != null) {
    recentArr = stored;
    for (let i = 0; i < 10; i++) {
      var element = $("<button>");
      element.addClass("city-btn", "btn-secondary");
      element.css("display", "block");
      element.text(recentArr[i]);
      recentSearches.append(element);
    }
  }
}

// puts live clock in the header
function setTime() {
  // sets the date
  day.text(moment().format("MMM Do, YYYY"));
  // sets the live time
  time.text(moment().format("h:mm:ss a"));
  timerInterval = setInterval(function () {
    time.text(moment().format("h:mm:ss a"));
  }, 1000);
}

function setRecents(city) {
  // check if we already have 10 stored searches, if yes then remove oldest one from both list and stored array
  if (recentSearches.childElementCount > 9) {
    recentSearches.children[9].remove();
    recentArr.pop();
    console.log("remove");
  }
  // create new li with city and insert it at top of old searches
  var newBtn = document.createElement("button");
  newBtn.textContent = city;
  recentSearches.append(newBtn);
  // update array for LS
  recentArr.unshift(city);
  localStorage.setItem("recentArr", JSON.stringify(recentArr));
  console.log("test")
}

// handle form submit
form.submit(function (e) {
  e.preventDefault();
  var temp = input.val();
  // generate API call
  apiCall(temp);
  setRecents(temp);
});

function apiCall(city) {
  weatherUrl = generateUrl(city, weather);
  fetch(weatherUrl)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      setCurrent(data);
      // set location variables first
      city = data.name;
      lon = data.coord.lon;
      lat = data.coord.lat;
      coords = "lat=" + lat + "&lon=" + lon;
      // get weather API fetch URL
      oneCallUrl = generateUrl(coords, oneCall);
      fetch(oneCallUrl)
        .then(function (response2) {
          return response2.json();
        })
        .then(function (data2) {
          setForecast(data2);
        });
    });
}

// creat fetch url by adding onto base url with parameters
function generateUrl(location, baseUrl) {
  baseUrl += location;
  baseUrl += apikey;
  return baseUrl;
}

function setCurrent(data) {
  // change city name
  $("#current-title").html(
    `${data.name} (${moment().format("MM/DD/YY")}) <img src="http://openweathermap.org/img/w/${
      data.weather[0].icon
    }.png"> `
  );
  $("#temp").text("Temp: " + convert(data.main.temp) + " F");
  // set temp and humidity
  $("#humidity").text("Humidity: " + data.main.humidity + "%");
  $("#wind").text("Wind: " + data.wind.speed + "mph");
  // refresh city name (idk why i have to do this, but city is undefined at this point)
  city = data.name;
}

function convert(temp) {
  // get temp
  // convert to F
  // round
  var faren = Math.round((temp - 273) * 1.8 + 32);
  return faren
}

// set 5 day forecast
function setForecast(data) {
  for (let i = 1; i < 6; i++) {
    // get next 5 days
    var date = moment().add(i, "days").calendar();
    // grab first word only
    var words = date.split(" ");
    document.getElementById("day-"+i+"-title").textContent = words[0];
    // set each card
    $(`#day-${i}-subtitle`).html(`<img src="http://openweathermap.org/img/w/${data.daily[i].weather[0].icon}.png"> `);    
    document.getElementById("day-"+i+"-temp").textContent = "Temperature: " + convert(data.daily[i].temp.day) + " F";
    document.getElementById("day-"+i+"-wind").textContent = "Wind: " + data.daily[i].wind_speed + " mph";
    document.getElementById("day-"+i+"-humidity").textContent = "Humidity: " + data.daily[i].humidity + "%";
  }
  // set uv index here becuase its not in first api call
  document.getElementById("uv").textContent = "UV Index: " + data.current.uvi;
}

// click event for my recent search buttons
$(document).on("click", ".city-btn", function (event) {
  var city = event.target.textContent;
  apiCall(city);
});

// default seattle weather
apiCall("Seattle");
setTime();
init();


