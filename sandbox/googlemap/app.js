var $heatmapButton, $map, $searchResultList, API, InfoView, LandPrice, Status, addHeatMap, addInfo, addMapInfo, getLandPricesJson, heatmap, info, initialize, map, removeHeatMap, setZoomValueClass;

API = {
  e_stat: '2fccc7771605f4d0b038e5597b3cfe7f3591900f'
};

map = {};

$map = $("#map");

info = [];

LandPrice = [];

heatmap = {};

Status = {
  viewHeatmap: false,
  latMax: 0,
  latMin: 0,
  lngMax: 0,
  lngMin: 0
};

initialize = function() {
  var latlng, mapOptions, styleOptions, styledMapOptions;
  styleOptions = [
    {
      "stylers": [
        {
          "saturation": -10
        }, {
          "lightness": 22
        }, {
          "visibility": "simplified"
        }
      ]
    }, {
      "featureType": "all",
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    }, {
      "featureType": "transit",
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "on"
        }, {
          "saturation": -50
        }
      ]
    }, {
      "featureType": "poi.school",
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "on"
        }, {
          "saturation": -50
        }
      ]
    }
  ];
  styledMapOptions = {
    name: 'simple'
  };
  latlng = new google.maps.LatLng(35.628375380320485, 139.73832627194213);
  mapOptions = {
    zoom: 15,
    center: latlng,
    maxZoom: 21,
    minZoom: 6,
    MapTypeStyleElementType: 'labels',
    mapTypeControlOptions: {
      mapTypeIds: ['simple', google.maps.MapTypeId.ROADMAP]
    },
    disableDefaultUI: true
  };
  map = new google.maps.Map(document.getElementById("map"), mapOptions);
  map.mapTypes.set('simple', new google.maps.StyledMapType(styleOptions, styledMapOptions));
  map.setMapTypeId('simple');
  getLandPricesJson();
  setZoomValueClass();
  addMapInfo();
  return google.maps.event.addListener(map, 'zoom_changed', function(e) {
    setZoomValueClass();
    if (Status.viewHeatmap) {
      removeHeatMap();
      return setTimeout(function() {
        return addHeatMap();
      }, 100);
    }
  });
};

setZoomValueClass = function() {
  var className, zoomValue;
  zoomValue = map.getZoom();
  if (zoomValue > 13) {
    className = "is-enlarged";
  } else {
    className = "is-reduced";
  }
  return $map.removeClass("is-enlarged is-reduced").addClass(className);
};

addMapInfo = function() {
  return $.ajax({
    type: 'GET',
    url: './data/houses.json'
  }).done(function(data) {
    var house, i, j, latMax, latMin, latlngBounds, len, lngMax, lngMin, ne, sw;
    latMax = data[0].latlng[0];
    latMin = data[0].latlng[0];
    lngMax = data[0].latlng[1];
    lngMin = data[0].latlng[1];
    for (i = j = 0, len = data.length; j < len; i = ++j) {
      house = data[i];
      addInfo(house);
      info[i] = new InfoView({
        latlng: new google.maps.LatLng(house.latlng[0], house.latlng[1]),
        map: map,
        args: {
          id: house.id,
          title: house.name,
          cost: house.show_cost,
          photo: house.photo
        }
      });
      if (latMax < house.latlng[0]) {
        latMax = house.latlng[0];
      }
      if (latMin > house.latlng[0]) {
        latMin = house.latlng[0];
      }
      if (lngMax < house.latlng[1]) {
        lngMax = house.latlng[1];
      }
      if (lngMin > house.latlng[1]) {
        lngMin = house.latlng[1];
      }
    }
    sw = new google.maps.LatLng(latMin, lngMin);
    ne = new google.maps.LatLng(latMax, lngMax);
    Status.latMax = latMax;
    Status.latMin = latMin;
    Status.lngMax = lngMax;
    Status.lngMin = lngMin;
    latlngBounds = new google.maps.LatLngBounds(sw, ne);
    return map.fitBounds(latlngBounds);
  });
};

$heatmapButton = $('.js-heatmap');

$heatmapButton.on('click', function(e) {
  e.preventDefault();
  if (!Status.viewHeatmap) {
    return addHeatMap();
  } else {
    return removeHeatMap();
  }
});

addHeatMap = function() {
  heatmap = new google.maps.visualization.HeatmapLayer({
    radius: 200,
    data: LandPrice
  });
  heatmap.setMap(map);
  $heatmapButton.addClass('is-selected');
  return Status.viewHeatmap = true;
};

removeHeatMap = function() {
  heatmap.setMap(null);
  $heatmapButton.removeClass('is-selected');
  return Status.viewHeatmap = false;
};

getLandPricesJson = function() {
  return $.ajax({
    type: 'GET',
    url: './data/L01-15_13.json'
  }).done(function(msg) {
    var data, i, j, landprice, len, position, ref, results;
    ref = msg['ksj:Dataset']['ksj:LandPrice'];
    results = [];
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      landprice = ref[i];
      position = msg['ksj:Dataset']['gml:Point'][i]['gml:pos'][0].split(' ');
      position = new google.maps.LatLng(position[0], position[1]);
      data = {
        location: position,
        weight: Number(landprice['ksj:postedLandPrice'][0])
      };
      results.push(LandPrice.push(data));
    }
    return results;
  });
};

InfoView = function(options) {
  this.latlng = options.latlng;
  this.args = options.args;
  this.setMap(options.map);
};

InfoView.prototype = new google.maps.OverlayView;

InfoView.prototype.draw = function() {
  var $div, _this, div, panes, point;
  _this = this;
  div = this.div;
  if (!div) {
    $div = $("<div class='bl-info' data-info-id=\"" + this.args.id + "\">\n  <label class=\"bl-info__label\" for=\"bl-info__id" + this.args.id + "\">\n    <div class='bl-info__title'>" + this.args.title + "</div>\n    <div class='bl-info__cost'>" + this.args.cost + "</div>\n  </label>\n  <input class=\"bl-info__input\" id=\"bl-info__id" + this.args.id + "\" type=\"checkbox\">\n  <div class='bl-info__modal'>\n    <div class='bl-info__modal__image'><img src=\"images/item/" + this.args.photo + "\"></div>\n    <div class='bl-info__modal__info'>\n      <div class='bl-info__modal__title'>" + this.args.title + "</div>\n      <div class='bl-info__modal__cost'>" + this.args.cost + "</div>\n    </div>\n    <label class='bl-info__modal__close' for=\"bl-info__id" + this.args.id + "\">×</label>\n  </div>\n</div>");
    div = this.div = $div[0];
    google.maps.event.addDomListener(div, 'click', function(event) {
      google.maps.event.trigger(_this, 'click');
    });
    panes = this.getPanes();
    panes.overlayImage.appendChild(div);
  }
  point = this.getProjection().fromLatLngToDivPixel(this.latlng);
  if (point) {
    div.style.left = point.x + 'px';
    div.style.top = point.y + 'px';
  }
};

InfoView.prototype.remove = function() {
  if (this.div) {
    this.div.parentNode.removeChild(this.div);
    this.div = null;
  }
};

InfoView.prototype.getPosition = function() {
  return this.latlng;
};

$searchResultList = $('.js-searchResultList');

addInfo = function(house) {
  var $item, $mapButton;
  $item = $("<li class=\"bl-searchResultList__item\">\n  <div data-info-id=\"" + house.id + "\" class=\"bl-searchResult\">\n    <div class=\"bl-searchResult__image\"><img src=\"images/item/" + house.photo + "\"></div>\n    <div class=\"bl-searchResult__info\">\n      <div class=\"bl-searchResult__name\">" + house.name + "</div>\n      <div class=\"bl-searchResult__cost\">" + house.show_cost + "</div>\n    </div>\n  </div>\n</li>");
  $mapButton = $("<span class=\"bl-searchResult__mapButton\">[MAP]</span>");
  $item.append($mapButton);
  $item.on('mouseover', function(e) {
    e.preventDefault();
    return $(".bl-info[data-info-id=" + house.id + "]").addClass('is-hover');
  });
  $item.on('mouseleave', function(e) {
    e.preventDefault();
    return $(".bl-info[data-info-id=" + house.id + "]").removeClass('is-hover');
  });
  $mapButton.on('click', function(e) {
    var latlngBounds, ne, sw;
    e.preventDefault();
    sw = new google.maps.LatLng(house.latlng[0] - 0.011, house.latlng[1] - 0.011);
    ne = new google.maps.LatLng(house.latlng[0] + 0.011, house.latlng[1] + 0.011);
    latlngBounds = new google.maps.LatLngBounds(sw, ne);
    map.fitBounds(latlngBounds);
    return $(".bl-info[data-info-id=" + house.id + "]").addClass('is-open');
  });
  return $searchResultList.append($item);
};
