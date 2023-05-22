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

function updateContainerWidths() {
  var viewportWidth = window.innerWidth || document.documentElement.clientWidth;
  var aboutContainer = document.getElementById("aboutContainer");
  var contentContainer = document.getElementById("contentContainer");

  if (!isAboutContainerCollapsed) {
    if (viewportWidth <= 1200 && viewportWidth > 768) {
      aboutContainer.style.width = "40%";
      contentContainer.style.width = "60%";
    } else if (viewportWidth <= 768) {
      aboutContainer.style.width = "100%";
      contentContainer.style.width = "auto";
    } else {
      aboutContainer.style.width = "20%";
      contentContainer.style.width = "80%";
    }
  }

  map.invalidateSize();
}

window.addEventListener("load", function() {
  updateContainerWidths();
  handleResize();
});

window.addEventListener("resize", function() {
  updateContainerWidths();
  handleResize();
});

function handleResize() {
  var minScore = 2;
  var maxScore = 38699;
  var minFontSize = 30;
  var maxFontSize = 100;

  if (window.innerWidth < 1080) {
    minFontSize = 40;
    maxFontSize = 120;
  }

  originalMarkers.eachLayer(function (marker) {
    var score = marker.options.score;
    var fontSize = ((score - minScore) / (maxScore - minScore)) * (maxFontSize - minFontSize) + minFontSize;
    var iconAnchorX = fontSize / 2;
    var iconAnchorY = fontSize / 2;

    marker.setIcon(L.divIcon({
      className: 'custom-icon',
      html: '<img src="picIcon.png" width="' + fontSize * 1.2 + '" height="' + fontSize + '">',
      iconAnchor: [iconAnchorX, iconAnchorY]
    }));
  });

  originalMarkers.refreshClusters();
}

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

      var fontSizeLarge = 20;
      var fontSizeSmall = 24;

      var fontSize = window.innerWidth < 1080 ? fontSizeSmall : fontSizeLarge;

      var tempDiv = document.createElement('div');
        tempDiv.style.visibility = 'hidden';
        tempDiv.style.position = 'absolute';
        tempDiv.style.whiteSpace = 'nowrap';
        tempDiv.style.fontSize = fontSize + 'px';
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
    var title = properties['title'];
    var score = properties.score;
    var img = properties.url;
    var link = properties.link;
    var timestamp = feature.properties.time;
    var date = new Date(timestamp * 1000);
    var formattedDate = date.toLocaleString();

    var minScore = 2;
    var maxScore = 38699;
    var minFontSize = 30;
    var maxFontSize = 100;

    if (window.innerWidth < 1080) {
      minFontSize = 40;
      maxFontSize = 120;
    }

    const fontSize = ((score - minScore) / (maxScore - minScore)) * (maxFontSize - minFontSize) + minFontSize ;
    var iconAnchorX = fontSize / 2;
    var iconAnchorY = fontSize / 2;


    var redArrowIcon = L.divIcon({
      className: 'custom-icon',
      html: '<img src="picIcon.png" width="' + fontSize*1.2 + '" height="' + fontSize + '">',
      iconAnchor: [iconAnchorX, iconAnchorY]
    });
    
    var marker = L.marker([coordinates[1], coordinates[0]], { 
      title: title,
      time: formattedDate,
      score: score,
      img: img,
      link: link,
      icon: redArrowIcon
    });
    var score2 = parseFloat(score)
    var formattedUpvote = score2.toLocaleString(undefined, { maximumFractionDigits: 2 })
    
    var popupContent;

    if (img === "") {
      popupContent = "<img src='noImg.png' width='80px' height='auto'><br><br><a href='" + link + "' target='_blank' style='color: rgb(255, 158, 158)' title='View post on Reddit'><b>" + title + "</b></a><hr>Posted on: " + formattedDate + "<br><img src='customIcon2.png' width='30px' height='30px'> <b>" + formattedUpvote + "</b> upvotes";
    } else {
      popupContent = "<a href='" + img + "' target='_blank'><img src='" + img + "' width='505px' height='auto' onerror=\"this.src='noImg.png'; this.width=80\"></a><br><br><a href='" + link + "' target='_blank' style='color: rgb(255, 158, 158)' title='View post on Reddit'><b>" + title + "</b></a><hr>Posted on: " + formattedDate + "<br><img src='customIcon2.png' width='30px' height='30px'> <b>" + formattedUpvote + "</b> upvotes";
    }

    marker.bindPopup(popupContent);
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
    var formattedDate = selectedDate.toLocaleString();
  
    selectedTimeBox.innerHTML = "<b>" + formattedDate + "</b>";
    filterMarkersByDate(selectedTimestamp);
  });

  var showAllPostsButton = document.getElementById('showAllPostsButton');
showAllPostsButton.addEventListener('click', showAllPosts);

function showAllPosts() {
  stopAnimation();
  map.removeLayer(filteredMarkers);

  map.removeLayer(originalMarkers);

  originalMarkers.eachLayer(function (marker) {
    marker.setOpacity(1);
  });

  map.addLayer(originalMarkers);

  selectedTimeBox.style.display = "none";
  legendContainer2.style.display = "none";
}

var dateSlider = document.getElementById('dateSlider');
var playButton = document.getElementById('playButton');
var pauseButton = document.getElementById('pauseButton');
var replayButton = document.getElementById('replayButton');
var selectedTimeBox = document.getElementById('selectedTimeBox');

var animationInterval;
var animationActive = false;

playButton.addEventListener('click', startAnimation);
pauseButton.addEventListener('click', stopAnimation);
replayButton.addEventListener('click', replayAnimation);
dateSlider.addEventListener('input', handleSliderInteraction);

function replayAnimation() {
  if (animationActive) {
    stopAnimation();
  }

  dateSlider.value = dateSlider.min;
  startAnimation();
}

function startAnimation() {
  if (animationActive) return;
  playButton.style.display = "none";
  pauseButton.style.display = "block";
  selectedTimeBox.style.display = "block";
  legendContainer2.style.display = "block";
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
    var formattedDate = selectedDate.toLocaleDateString();
    selectedTimeBox.innerHTML = "<b>" + formattedDate + "</b>";
    filterMarkersByDate(currentValue);
  }, 200);
}

function stopAnimation() {
  if (!animationActive) return;
  playButton.style.display = "block";
  pauseButton.style.display = "none";
  clearInterval(animationInterval);
  animationActive = false;
}

function handleSliderInteraction() {
  if (animationActive) {
    stopAnimation();
  }
  legendContainer2.style.display = "block";
  var selectedTimestamp = parseInt(dateSlider.value);
  var selectedDate = new Date(selectedTimestamp);
  var formattedDate = selectedDate.toLocaleDateString();

  selectedTimeBox.innerHTML = "<b>" + formattedDate + "</b>";
  selectedTimeBox.style.display = "block";
  filterMarkersByDate(selectedTimestamp);
}

var legend = L.control.Legend({
  position: "bottomleft",
  title: "Geocoded Posts",
  fillColor: "#000",
  opacity: 0.8,
  legends: [
    {
      label: "Fewer Upvotes",
      type: "image",
      layers: filteredMarkers,
      url: "picIcon.png",
      fillOpacity: "0.5",
    },
    {
      label: "More Upvotes",
      type: "image",
      layers: filteredMarkers,
      url: "picIcon.png",
      fillOpacity: "0.5",
    },
]
}).addTo(map);

var legendContainer = legend.getContainer();
  legendContainer.style.backgroundColor = '#111111';
  legendContainer.style.opacity = 0.8;
  legendContainer.style.color = "white";
  legendContainer.style.width = "200px";
  legendContainer.style.bottom = "85px";
  legendContainer.style.height = "150px";
  legendContainer.style.border = "2px solid rgb(185, 13, 13)";


var legendLabels = legendContainer.querySelectorAll(".leaflet-legend-item");
legendLabels.forEach(function (label) {
  label.classList.add("non-interactive-label");
  label.style.marginBottom = "30px";
});

var legendImgs = legendContainer.querySelectorAll(".leaflet-legend-item img");
var firstLegendImg = legendImgs[1];
firstLegendImg.style.height = "50px";
firstLegendImg.style.width = "auto";

var legendText = legendContainer.querySelectorAll(".leaflet-legend-item span");
var firstLegendText = legendText[1];
firstLegendText.style.paddingLeft = "20px";

var legendColumns = legendContainer.querySelector(".leaflet-legend-column");

legendColumns.style.marginLeft = "20px";

var legend2 = L.control.Legend({
  position: "bottomright",
  title: "Post Timeline",
  fillColor: "#000",
  opacity: 0.8,
  legends: [
    {
      label: "Current Date",
      type: "image",
      layers: filteredMarkers,
      url: "picIcon.png",
      fillOpacity: "0.5",
    },
    {
      label: "One Day Prior",
      type: "image",
      layers: filteredMarkers,
      url: "picIcon.png",
      fillOpacity: "0.5",
    },
    {
      label: "Two Days Prior",
      type: "image",
      layers: filteredMarkers,
      url: "picIcon.png",
      fillOpacity: "0.5",
    },
]
}).addTo(map);

var legendContainer2 = legend2.getContainer();
  legendContainer2.style.backgroundColor = '#111111';
  legendContainer2.style.opacity = 0.8;
  legendContainer2.style.color = "white";
  legendContainer2.style.width = "200px";
  legendContainer2.style.bottom = "71px";
  legendContainer2.style.height = "150px";
  legendContainer2.style.display = "none";
  legendContainer2.style.border = "2px solid rgb(185, 13, 13)";

  var legendLabels2 = legendContainer2.querySelectorAll(".leaflet-legend-item");
  legendLabels2.forEach(function (label) {
    label.classList.add("non-interactive-label");
    label.style.marginBottom = "10px";
  });

  var legendImgs2 = legendContainer2.querySelectorAll(".leaflet-legend-item img");
    var firstLegendImg1 = legendImgs2[0]
    firstLegendImg1.style.marginLeft = "10px";
    firstLegendImg1.style.marginTop = "10px";
    var firstLegendImg2 = legendImgs2[1];
    firstLegendImg2.style.opacity = 0.7
    firstLegendImg2.style.marginLeft = "10px";
    firstLegendImg2.style.marginTop = "10px";
    var firstLegendImg3 = legendImgs2[2];
    firstLegendImg3.style.opacity = 0.4
    firstLegendImg3.style.marginLeft = "10px";
    firstLegendImg3.style.marginTop = "10px";

    var isAboutContainerCollapsed = false;

    function toggleAboutContainer() {
      var aboutContainer = document.getElementById("aboutContainer");
      var contentContainer = document.getElementById("contentContainer");
      var caret = document.getElementById("collapseButton").querySelector(".fa-caret-up");
          
      if (!isAboutContainerCollapsed) {
        aboutContainer.style.width = "0";
        contentContainer.style.width = "100%";
        caret.style.transform = "rotate(90deg)";
        isAboutContainerCollapsed = true;
      } else {
        var viewportWidth = window.innerWidth || document.documentElement.clientWidth;

        var aboutContainer = document.getElementById("aboutContainer");
        var contentContainer = document.getElementById("contentContainer");
        if (viewportWidth <= 1200 && viewportWidth > 768) {
          aboutContainer.style.width = "40%";
          contentContainer.style.width = "60%";
        } else if (viewportWidth <= 768) {
          aboutContainer.style.width = "100%";
          contentContainer.style.width = "auto";
        } else {
          aboutContainer.style.width = "20%";
          contentContainer.style.width = "80%";
        };
        caret.style.transform = "rotate(270deg)";
        isAboutContainerCollapsed = false;
      }
      map.invalidateSize();
    }

function panMapToBottom(popup) {
  var latLng = popup.getLatLng();
  
  var mapContainer = map.getContainer();
  var mapHeight = mapContainer.offsetHeight;
  
  var point = map.latLngToContainerPoint(latLng);
  point.y -= mapHeight / 3.5;
  var newLatLng = map.containerPointToLatLng(point);
  
  map.panTo(newLatLng);
}

map.on('popupopen', function(event) {
  var popup = event.popup;
  panMapToBottom(popup);

  popup._source.once('click', function(e) {
    L.DomEvent.stopPropagation(e);
  });
});
