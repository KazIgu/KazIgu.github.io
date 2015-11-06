API =
  e_stat: '2fccc7771605f4d0b038e5597b3cfe7f3591900f'

map = {}
$map = $("#map")

info = []
LandPrice = []

heatmap = {}

Status =
  viewHeatmap: false
  latMax: 0
  latMin: 0
  lngMax: 0
  lngMin: 0

initialize = () ->
  styleOptions = [
    {
      "stylers": [
        {"saturation": -10}
        {"lightness": 22}
        {"visibility": "simplified"}
      ]
    }
    {
      "featureType": "all",
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    }
  ]
  styledMapOptions =
    name: 'simple'


  # 初期表示位置
  latlng = new google.maps.LatLng(35.628375380320485,139.73832627194213)
  mapOptions =
    zoom: 15
    center: latlng
    maxZoom: 21
    minZoom: 6
    mapTypeControlOptions:
      mapTypeIds: ['simple', google.maps.MapTypeId.ROADMAP]
    # mapTypeId: google.maps.MapTypeId.ROADMAP
    disableDefaultUI: true
  map = new google.maps.Map(document.getElementById("map"), mapOptions)
  map.mapTypes.set 'simple', new google.maps.StyledMapType styleOptions, styledMapOptions
  map.setMapTypeId 'simple'
  getLandPricesJson() # 地価の情報を取得
  setZoomValueClass() # zoomの値に合わせてクラス付与
  addMapInfo()           # 物件情報を追加

  # zoom_changedイベント
  google.maps.event.addListener map , 'zoom_changed' , (e) ->
    setZoomValueClass()
    if Status.viewHeatmap
      removeHeatMap()
      setTimeout () ->
        addHeatMap()
      , 100

setZoomValueClass = () ->
  zoomValue = map.getZoom()
  if zoomValue > 13
    className = "is-enlarged"
  else
    className = "is-reduced"
  $map.removeClass("is-enlarged is-reduced").addClass className

addMapInfo = () ->
  $.ajax
    type: 'GET'
    url: './data/houses.json'
  .done (data) ->
    latMax = data[0].latlng[0]
    latMin = data[0].latlng[0]
    lngMax = data[0].latlng[1]
    lngMin = data[0].latlng[1]

    for house, i in data
      addInfo(house)

      info[i] = new InfoView
        latlng: new google.maps.LatLng(house.latlng[0],house.latlng[1])
        map: map
        args:
          id: house.id
          title: house.name
          cost: house.show_cost
          photo: house.photo

      if latMax < house.latlng[0]
        latMax = house.latlng[0]
      if latMin > house.latlng[0]
        latMin = house.latlng[0]
      if lngMax < house.latlng[1]
        lngMax = house.latlng[1]
      if lngMin > house.latlng[1]
        lngMin = house.latlng[1]

    sw = new google.maps.LatLng latMin, lngMin
    ne = new google.maps.LatLng latMax, lngMax
    Status.latMax = latMax
    Status.latMin = latMin
    Status.lngMax = lngMax
    Status.lngMin = lngMin
    latlngBounds = new google.maps.LatLngBounds sw, ne
    map.fitBounds latlngBounds


# ------------------------------
# heatmap
# ------------------------------
$heatmapButton = $('.js-heatmap')
$heatmapButton.on 'click', (e) ->
  e.preventDefault()
  if !Status.viewHeatmap
    addHeatMap()
  else
    removeHeatMap()

addHeatMap = () ->
  heatmap = new google.maps.visualization.HeatmapLayer
    radius: 200
    data: LandPrice
  heatmap.setMap(map)
  $heatmapButton.addClass 'is-selected'
  Status.viewHeatmap = true

removeHeatMap = () ->
  heatmap.setMap(null)
  $heatmapButton.removeClass 'is-selected'
  Status.viewHeatmap = false

getLandPricesJson = () ->
  $.ajax
    type: 'GET'
    url: './data/L01-15_13.json'
  .done (msg) ->
    for landprice, i in msg['ksj:Dataset']['ksj:LandPrice']
      position = msg['ksj:Dataset']['gml:Point'][i]['gml:pos'][0].split ' '
      position = new google.maps.LatLng position[0], position[1]

      data =
        location: position
        weight: Number landprice['ksj:postedLandPrice'][0]
      LandPrice.push data

# ------------------------------
# InfoView
# ------------------------------
InfoView = (options) ->
  @latlng = options.latlng
  @args = options.args
  @setMap options.map
  return

InfoView.prototype = new google.maps.OverlayView

InfoView::draw = ->
  _this = this
  div = @div
  if !div
    $div = $ """
      <div class='bl-info' data-info-id="#{@args.id}">
        <label class="bl-info__label" for="bl-info__id#{@args.id}">
          <div class='bl-info__title'>#{@args.title}</div>
          <div class='bl-info__cost'>#{@args.cost}</div>
        </label>
        <input class="bl-info__input" id="bl-info__id#{@args.id}" type="checkbox">
        <div class='bl-info__modal'>
          <div class='bl-info__modal__image'><img src="images/item/#{@args.photo}"></div>
          <div class='bl-info__modal__info'>
            <div class='bl-info__modal__title'>#{@args.title}</div>
            <div class='bl-info__modal__cost'>#{@args.cost}</div>
          </div>
          <label class='bl-info__modal__close' for="bl-info__id#{@args.id}">×</label>
        </div>
      </div>
    """
    div = @div = $div[0]

    google.maps.event.addDomListener div, 'click', (event) ->
      google.maps.event.trigger _this, 'click'
      return
    panes = @getPanes()
    panes.overlayImage.appendChild div

  point = @getProjection().fromLatLngToDivPixel(@latlng)

  if point
    div.style.left = point.x + 'px'
    div.style.top = point.y + 'px'
  return

InfoView::remove = ->
  if @div
    @div.parentNode.removeChild @div
    @div = null
  return

InfoView::getPosition = ->
  @latlng




# ------------------------------
# searchResult
# ------------------------------
$searchResultList = $('.js-searchResultList')
addInfo = (house) ->
  $item = $ """
    <li class="bl-searchResultList__item">
      <div data-info-id="#{house.id}" class="bl-searchResult">
        <div class="bl-searchResult__image"><img src="images/item/#{house.photo}"></div>
        <div class="bl-searchResult__info">
          <div class="bl-searchResult__name">#{house.name}</div>
          <div class="bl-searchResult__cost">#{house.show_cost}</div>
        </div>
      </div>
    </li>
  """
  $mapButton = $ """
    <span class="bl-searchResult__mapButton">[MAP]</span>
  """
  $item.append $mapButton
  $item.on 'mouseover', (e) ->
    e.preventDefault()

    $(".bl-info[data-info-id=#{house.id}]").addClass 'is-hover'

  $item.on 'mouseleave', (e) ->
    e.preventDefault()

    $(".bl-info[data-info-id=#{house.id}]").removeClass 'is-hover'

  $mapButton.on 'click', (e) ->
    e.preventDefault()

    sw = new google.maps.LatLng house.latlng[0] - 0.011, house.latlng[1] - 0.011
    ne = new google.maps.LatLng house.latlng[0] + 0.011, house.latlng[1] + 0.011
    latlngBounds = new google.maps.LatLngBounds sw, ne
    map.fitBounds latlngBounds
    # sw = new google.maps.LatLng Status.latMin, Status.lngMin
    # ne = new google.maps.LatLng Status.latMax, Status.lngMax
    # latlngBounds = new google.maps.LatLngBounds sw, ne
    # map.fitBounds latlngBounds

    $(".bl-info[data-info-id=#{house.id}]").addClass 'is-open'


  $searchResultList.append $item





