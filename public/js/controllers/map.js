bagsInTreesControllers.controller('mapController', function ($scope, $http, $q, $cookies, $window, bagService) {
  var infowindowContent = '<div id="content"><div id="bodyContent"><img src="&imageurl&" width="150" height="150" ng-click="openDetail()"><br/>&caption&<br/>&user&</div></div>';
  var infowindow = new google.maps.InfoWindow({
    content: ''
  });
  var markerTimeout;

  var styles = [
    {
      height: 22,
      url: "../../img/clusterIcon-01-blue.png",
      width: 22
    },
    {
      height: 30,
      url: "../../img/clusterIcon-02-yellow.png",
      width: 30
    },
    {
      height: 36,
      url: "../../img/clusterIcon-03-red.png",
      width: 36
    },
    {
      height: 78,
      url: "http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m4.png",
      width: 78
    },
    {
      height: 90,
      url: "http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m5.png",
      width: 90
    }
  ];

  // fire off popover instructions if user hasnt seen it before
  if (!localStorage.getItem('bagsintrees_map_notice_1')) {
    $('#alert-box')
      .popover({
        placement : 'top',
        content : '<div class="font-medium" style="text-align: center;">Click on any map pin<br/>to see the photo</div><div style="text-align: center; padding-top: 20px;"><button class="btn btn-primary" onClick="$(\'#alert-box\').popover(\'toggle\');localStorage.setItem(\'bagsintrees_map_notice_1\', \'true\');">Okay. Got it!</button></div>',
        html: true
      })
      .click(function (ev) {
        //this is workaround needed in order to make ng-click work inside of popover
        $compile($('.popover.in').contents())($scope);
      })
      .popover('toggle');
  }

  // obtain user's location or use default
  function establishLocation() {
    var deferred = $q.defer();
    if ($cookies && $cookies.userGeoLoc) {
      $scope.userGeoLoc = JSON.parse($cookies.userGeoLoc);
      deferred.resolve();
    }
    else {
      if (1===2 && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            setGeoLoc(position.coords.latitude, position.coords.longitude, 12);
            deferred.resolve();
            $cookies.userGeoLoc = JSON.stringify($scope.userGeoLoc);
        });
      } else { //geolocation IS NOT available
          //setGeoLoc(42.3581, -71.0636, 4); // Boston
          var zoomLevel = 3;
          if (isMobileClient()) {
            zoomLevel = 2;
          }
          setGeoLoc(20.3034, -34.6289, zoomLevel); //Lebanon, KS
          deferred.resolve();
      }
    }
    return deferred.promise;
  }

  // off the shelf mobile browser check
  function isMobileClient() {
    var check = false;
    (function (a, b) {if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true}) (navigator.userAgent || navigator.vendor || window.opera);
    return check;
  }

  function setGeoLoc(lat, lon, zoom) {
    $scope.userGeoLoc = {lat: lat, lon: lon, zoom: zoom};
  }
  
  buildMarker = function (data) {
    var opts = {
      position:   new google.maps.LatLng(data.latitude, data.longitude),
      id:         data.id
    }
    if (data.isRemoved) {
      opts.fillColor = '#C0C0C0';
      opts.icon = './img/green-dot.png';
    }
    var marker = new google.maps.Marker(opts);

    google.maps.event.addListener(marker, 'click', function () {
      $scope.showMapDetail(this.id);
    });
    return marker;
  };

  $scope.getAllBags = function () {
    bagService.fetchData('/bags/all', function (data) {
      $scope.bags = data;
      var markers = [];
      for (var i = 0; i < data.length; i++) {
        var marker = buildMarker(data[i]);
        google.maps.event.addListener(marker, 'mouseout', function () {
          markerTimeout = setTimeout(function () {infowindow.close();}, 200);
        });
        markers.push(marker);
      }
      var mc = new MarkerClusterer($scope.globalMap, markers, {minimumClusterSize: 4, styles: styles});
    });
  };

  $scope.showMapDetail = function (id) {
    $scope.mapDetail = null;
    $('.map-detail').show();
    bagService.fetchData('/bags/one/' + id, function (data) {
      $scope.mapDetail = data;
    });
    $window.ga('send', 'event', 'map', 'click', id);
  };

  $scope.closeMapDetail = function () {
    $('.map-detail').hide();
  };

  $scope.formatInstagramDate = function (dateInt) {
    return moment(new Date(dateInt * 1000)).format("MMM Do, YYYY");
  };

  $scope.showMap = function () {
    if (!$scope.globalMap) { // dont reload the map if we've already got it
      establishLocation() // get user location
      .then(function () {
        $scope.globalMap = new google.maps.Map(document.getElementById("map-canvas"),
          {  center: new google.maps.LatLng($scope.userGeoLoc.lat, $scope.userGeoLoc.lon),
            zoom: $scope.userGeoLoc.zoom
          });

        // set user location marker
        // skipping user location marker until we enable 'use your location'
        // new google.maps.Marker({position: new google.maps.LatLng($scope.userGeoLoc.lat, $scope.userGeoLoc.lon),
        //                         map: $scope.globalMap,
        //                         icon: "http://maps.google.com/mapfiles/arrow.png",
        //                         animation: google.maps.Animation.DROP
        //                         });
        
        $scope.getAllBags();
      });
    }
  };

  $scope.showMap();
});