angular.module('bagCtrl', [])
    
    .controller('mainCtrl', function($scope, $document) {

        $scope.mailLink = function() {
            $window.location = "mailto:bagsintrees@mail.com?subject=Bags In Trees Are Everywhere!";
        }

    })
    .controller('mapCtrl', function($scope, $http, $q, $cookies, $window, bags) {
        var infowindowContent = '<div id="content"><div id="bodyContent"><img src="&imageurl&"></div></div>';
        var infowindow = new google.maps.InfoWindow({
            content: ''
        });

        // obtain user's location or use default
        function establishLocation() {
            var deferred = $q.defer();
            if ($cookies && $cookies.userGeoLoc) {
                $scope.userGeoLoc = JSON.parse($cookies.userGeoLoc);
                deferred.resolve();
            }
            else {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function(position) {
                        setGeoLoc(position.coords.latitude, position.coords.longitude, 12);
                        deferred.resolve();
                        $cookies.userGeoLoc = JSON.stringify($scope.userGeoLoc);
                    });
                }
                else { //geolocation IS NOT available
                    setGeoLoc(42.397, -90.03, 8);
                    deferred.resolve();
                }
            }
            return deferred.promise;
        }

        function setGeoLoc(lat, lon, zoom) {
            $scope.userGeoLoc = {lat: lat, lon: lon, zoom: zoom};
        }
        
        $scope.getAllBags = function() {
            bags.getAll(function(data) {
                    $scope.bags = data;
                    for (var i = 0; i < data.length; i++) {
                        var marker = new google.maps.Marker({position: new google.maps.LatLng(data[i].latitude, data[i].longitude), 
                                                        map: $scope.globalMap,
                                                        thumb: data[i].thumbnail_url
                    });
                        google.maps.event.addListener(marker, 'mouseover', function() {
                            infowindow.content = infowindowContent.replace('&imageurl&', this.thumb);
                            infowindow.open($scope.globalMap, this);
                        });

                    }
                });
        }

        $scope.loadFromInstagram = function() {
            $http.post("/load/all");
        }

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
        }

        $scope.showMap();
    });