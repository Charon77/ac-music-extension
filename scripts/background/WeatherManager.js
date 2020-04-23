// Handles fetching the new weather and notifying a callback when it changes

'use strict';

function WeatherManager() {
	let self = this;

	let timeout;
	let callback;

	let provider;

	let weather;

	let country;
	let zip;
	let city;

	let apiKeys = {};

	this.registerChangeCallback = function (cb) {
		callback = cb;
	};

	this.setZip = function (newZip) {
		zip = newZip;
	};

	this.setCountry = function (newCountry) {
		country = newCountry;
		restartCheckLoop();
	};

	this.setCity = function (newCity) {
		city = newCity;
		restartCheckLoop();
	}

	this.setProvider = function (newProvider) {
		provider = newProvider;
		console.log("Provider: ", provider)
		restartCheckLoop();
	}

	this.setAPIKey = function (name, key) {
		apiKeys[name] = key;
		restartCheckLoop();
	}

	this.getWeather = function () {
		return weather;
	};

	// Checks the weather, and restarts the loop
	function restartCheckLoop() {
		if (timeout) clearTimeout(timeout);
		timeout = null;
		weatherCheckLoop();
	}

	let weatherCheckLoopACMusicExt = function() {
		let url = `https://acmusicext.com/api/weather-v1/${country}/${zip}`
		let request = new XMLHttpRequest();

		request.onload = function () {
			if (request.status == 200 || request.status == 304) {
				let response = JSON.parse(request.responseText);
				if (response.weather !== weather) {
					let oldWeather = self.getWeather();
					weather = response.weather;
					if (weather !== oldWeather && typeof callback === 'function') callback();
				}
			} else err();
		}

		request.onerror = err;

		function err() {
			if (!weather) {
				weather = "Clear";
				callback();
			}
		}

		request.open("GET", url, true);
		request.send();
	}

	let weatherCheckLoopOpenWeatherMap = function() {
	  debugger;
		let apiKey = apiKeys['openweathermap'];
		let query = `q=${city}`;
		let url = `http://api.openweathermap.org/data/2.5/weather?${query}&appid=${apiKey}`
		let request = new XMLHttpRequest();

		if (!apiKey) {
		  return;
		}

		function weatherCodeMap(code) {
		  let codeStr = code.toString();
		  let firstDigit = codeStr[0];

		  switch(firstDigit) {
		    case "2": return "Rain"; break;
		    case "3": return "Rain"; break;
		    case "5": return "Rain"; break;
		    case "6": return "Snow"; break;
		    case "7": return "Snow"; break;
		    default: return "Clear";
		  }
		}

		request.onload = function () {
			if (request.status == 200 || request.status == 304) {
				let response = JSON.parse(request.responseText);
				let newWeather = weatherCodeMap(response.weather[0].id);

				let oldWeather = self.getWeather();

				if (oldWeather !== newWeather) {
				  weather = newWeather;
				  if (weather !== oldWeather && typeof callback === 'function') callback();
				}
			} else err();
		}

		request.onerror = err;

		function err() {
			if (!weather) {
				weather = "Clear";
				if (typeof callback === 'function') callback();
			}
		}

		request.open("GET", url, true);
		request.send();
	}

	// Checks the weather every 10 minutes, calls callback if it's changed
	let weatherCheckLoop = function () {
		switch (provider) {
		    case 'acmusicext':
			weatherCheckLoopACMusicExt();
			break;
		    case 'openweathermap':
			weatherCheckLoopOpenWeatherMap();
			break;
		}

		timeout = setTimeout(weatherCheckLoop, 600000);
	};

	weatherCheckLoop();

	if (DEBUG_FLAG) {
		window.changeWeather = function (newWeather) {
			weather = newWeather;
			callback();
		}
	}
}
