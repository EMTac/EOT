const accessToken = 'pk.eyJ1IjoiZW10YWMiLCJhIjoiY2w5ejR0bXZyMGJpbDNvbG5jMTFobGJlZCJ9.UMi2J2LPPuz0qbFaCh0uRA';

var dark = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 20,
    id:'mapbox/dark-v10',
    accessToken: accessToken,
    tileSize: 512,
    zoomOffset: -1,
});

const map = L.map('map', {
    layers:[dark],
})

map.fitWorld();
map.setView([0, 0], 2);

var originalMarkers = L.markerClusterGroup({
    iconCreateFunction: function(cluster) {
      var sum = 0;
      cluster.getAllChildMarkers().forEach(function(marker) {
        sum += parseFloat(marker.options.score);
      });
      var formattedSum = sum.toLocaleString(undefined, { maximumFractionDigits: 2 });

      var className = '';
        if (sum < 10000) {
        className = 'cluster-icon-low';
        } else if (sum < 100000) {
        className = 'cluster-icon-medium';
        } else {
        className = 'cluster-icon-high';
        }

      var tempDiv = document.createElement('div');
        tempDiv.style.visibility = 'hidden';
        tempDiv.style.position = 'absolute';
        tempDiv.style.whiteSpace = 'nowrap';
        tempDiv.innerHTML = formattedSum;
        document.body.appendChild(tempDiv);

        var textWidth = tempDiv.offsetWidth;
        var iconSize = [textWidth + 2, textWidth + 2];

        document.body.removeChild(tempDiv);

      return L.divIcon({
        html: '<div id="clusterText" class="cluster-icon-text">' + '<b>' + formattedSum + '</b>' + '</div>',
        className: className,
        iconSize: iconSize
      });
    }
  });

  var filteredMarkers = L.featureGroup();

  landscapePts.features.forEach(feature => {
    var coordinates = feature.geometry.coordinates;
    var properties = feature.properties;
    var title = properties['\ufefftitle'];
    var score = properties.score;
    var timestamp = feature.properties.time;
    var date = new Date(timestamp * 1000);
    var formattedDate = date.toLocaleString();

    var minScore = 2;
    var maxScore = 38699;
    var minFontSize = 20;
    var maxFontSize = 100;

    const fontSize = ((score - minScore) / (maxScore - minScore)) * (maxFontSize - minFontSize) + minFontSize;
    var iconAnchorX = fontSize / 2;
    var iconAnchorY = fontSize / 2;


    var redArrowIcon = L.divIcon({
      className: 'custom-icon',
      html: '<img src="customIcon.png" width="' + fontSize + '" height="' + fontSize + '">',
      iconAnchor: [iconAnchorX, iconAnchorY]
    });
    
    var marker = L.marker([coordinates[1], coordinates[0]], { 
      title: title,
      time: formattedDate,
      score: score,
      icon: redArrowIcon
    });
    var score2 = parseFloat(score)
    var formattedUpvote = score2.toLocaleString(undefined, { maximumFractionDigits: 2 })
    marker.bindPopup("<b>" +title + '</b>' + '<hr>' + "Posted on: "+ formattedDate +"<br>" + '<img src="customIcon2.png" width="' + fontSize + '" height="' + fontSize + '">'+" "+"<b>"+formattedUpvote + "</b> upvotes");
    marker.on('popupopen', function (e) {
      var popup = e.popup;
      popup.getElement().classList.add('custom-popup');
    });
  
    originalMarkers.addLayer(marker);
  });
  
  map.addLayer(originalMarkers);

  function filterMarkersByDate(selectedTimestamp) {
    if (map.hasLayer(filteredMarkers)) {
      filteredMarkers.clearLayers();
    } else {
      filteredMarkers = L.featureGroup();
    }
  
    var minusOneDayTimestamp = selectedTimestamp - 86400000;
    var minusTwoDayTimestamp = minusOneDayTimestamp - 86400000;
    var minusThreeDayTimestamp = minusTwoDayTimestamp - 86400000;
  
    originalMarkers.eachLayer(function (marker) {
      var markerTimestamp = new Date(marker.options.time).getTime();
      var opacity = 1;
  
      if (markerTimestamp >= minusOneDayTimestamp && markerTimestamp < selectedTimestamp) {
        filteredMarkers.addLayer(marker);
      } else if (markerTimestamp >= minusTwoDayTimestamp && markerTimestamp < minusOneDayTimestamp) {
        opacity = 0.7;
        filteredMarkers.addLayer(marker);
      } else if (markerTimestamp >= minusThreeDayTimestamp && markerTimestamp < minusTwoDayTimestamp) {
        opacity = 0.4;
        filteredMarkers.addLayer(marker);
      }
  
      marker.setOpacity(opacity);
    });
  
    map.removeLayer(originalMarkers);
    map.addLayer(filteredMarkers);
  }
  
  var dateSlider = document.getElementById('dateSlider');
  var selectedTimeBox = document.getElementById('selectedTimeBox');
  
  dateSlider.addEventListener('input', function () {
    var selectedTimestamp = parseInt(dateSlider.value);
    var selectedDate = new Date(selectedTimestamp);
    var formattedTime = selectedDate.toLocaleString();
  
    selectedTimeBox.textContent = formattedTime;
    filterMarkersByDate(selectedTimestamp);
  });

  var showAllPostsButton = document.getElementById('showAllPostsButton');
showAllPostsButton.addEventListener('click', showAllPosts);

function showAllPosts() {
  map.removeLayer(filteredMarkers);

  map.addLayer(originalMarkers);
}

var dateSlider = document.getElementById('dateSlider');
var playButton = document.getElementById('playButton');
var pauseButton = document.getElementById('pauseButton');
var selectedTimeBox = document.getElementById('selectedTimeBox');

var animationInterval;
var animationActive = false;

playButton.addEventListener('click', startAnimation);
pauseButton.addEventListener('click', stopAnimation);
dateSlider.addEventListener('input', handleSliderInteraction);

function startAnimation() {
  if (animationActive) return;

  var minValue = parseInt(dateSlider.min);
  var maxValue = parseInt(dateSlider.max);
  var stepValue = parseInt(dateSlider.step);
  var currentValue = parseInt(dateSlider.value);

  animationActive = true;

  animationInterval = setInterval(function () {
    if (currentValue >= maxValue) {
      stopAnimation();
      return;
    }

    currentValue += stepValue;
    dateSlider.value = currentValue;

    var selectedDate = new Date(currentValue);
    var formattedTime = selectedDate.toLocaleString();
    selectedTimeBox.textContent = formattedTime;
    filterMarkersByDate(currentValue);
  }, 200);
}

function stopAnimation() {
  if (!animationActive) return;

  clearInterval(animationInterval);
  animationActive = false;
}

function handleSliderInteraction() {
  if (animationActive) {
    stopAnimation();
  }

  var selectedTimestamp = parseInt(dateSlider.value);
  var selectedDate = new Date(selectedTimestamp);
  var formattedTime = selectedDate.toLocaleString();

  selectedTimeBox.textContent = formattedTime;
  filterMarkersByDate(selectedTimestamp);
}
  