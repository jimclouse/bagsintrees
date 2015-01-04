bagsInTreesControllers.controller('mapController', function($scope, $http, $q, $cookies, $window, bagService) {
        var infowindowContent = '<div id="content"><div id="bodyContent"><img src="&imageurl&" width="150" height="150" ng-click="openDetail()"><br/>&caption&<br/>&user&</div></div>';
        var infowindow = new google.maps.InfoWindow({
            content: ''
        });
        var markerTimeout;

        var styles = [{
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
        }];

        // fire off popover instructions if user hasnt seen it before
        if (!localStorage.getItem('bagsintrees_map_notice_1')) {
            $('#alert-box').popover({
                placement : 'top',
                content : '<div class="font-medium" style="text-align: center;">Click on any map pin<br/>to see the photo</div><div style="text-align: center; padding-top: 20px;"><button class="btn btn-primary" onClick="$(\'#alert-box\').popover(\'toggle\');localStorage.setItem(\'bagsintrees_map_notice_1\', \'true\');">Okay. Got it!</button></div>',
                html: true
            })
            .click(function(ev) {
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
                    navigator.geolocation.getCurrentPosition(function(position) {
                        setGeoLoc(position.coords.latitude, position.coords.longitude, 12);
                        deferred.resolve();
                        $cookies.userGeoLoc = JSON.stringify($scope.userGeoLoc);
                    });
                }
                else { //geolocation IS NOT available
                    setGeoLoc(42.3581, -71.0636, 14);
                    deferred.resolve();
                }
            }
            return deferred.promise;
        }

        function setGeoLoc(lat, lon, zoom) {
            $scope.userGeoLoc = {lat: lat, lon: lon, zoom: zoom};
        }
        
        buildMarker = function(data) {
            var marker = new google.maps.Marker({position: new google.maps.LatLng(data.latitude, data.longitude),
                                                    id: data.id
            });
            google.maps.event.addListener(marker, 'click', function() {
                $scope.showMapDetail(this.id);
            });
            return marker;
        };

        $scope.getAllBags = function() {
            bagService.getAll(function(data) {
                $scope.bags = data;
                var markers = [];
                for (var i = 0; i < data.length; i++) {
                    var marker = buildMarker(data[i]);
                    google.maps.event.addListener(marker, 'mouseout', function() {
                        markerTimeout = setTimeout(function () {infowindow.close();}, 200);
                    });
                    markers.push(marker);
                }
                var mc = new MarkerClusterer($scope.globalMap, markers, {minimumClusterSize: 4, styles: styles});
            });
        };

        $scope.showMapDetail = function(id) {
            $('.map-detail').show();
            bagService.getOne(id, function(data) {
                $scope.mapDetail = data;
            });

        };
        $scope.closeMapDetail = function() {
            $('.map-detail').hide();
        };

        $scope.formatInstagramDate = function(dateInt) {
            return moment(new Date(dateInt * 1000)).format("MMM Do, YYYY");
        };

        $scope.showMap = function() {
            if(!$scope.globalMap) { // dont reload the map if we've already got it
                establishLocation() // get user location
                .then(function() {
                    $scope.globalMap = new google.maps.Map(document.getElementById("map-canvas"),
                        {   center: new google.maps.LatLng($scope.userGeoLoc.lat, $scope.userGeoLoc.lon),
                            zoom: $scope.userGeoLoc.zoom
                        });

                    // set user location marker
                    new google.maps.Marker({position: new google.maps.LatLng($scope.userGeoLoc.lat, $scope.userGeoLoc.lon),
                                            map: $scope.globalMap,
                                            icon: "http://maps.google.com/mapfiles/arrow.png",
                                            animation: google.maps.Animation.DROP
                                            });
                    
                    $scope.getAllBags();
                });
            }
        };

        $scope.showMap();
    });