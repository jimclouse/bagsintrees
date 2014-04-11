angular.module('bagCtrl', [])
    
    .controller('mainCtrl', function($scope, $http, $window, bags) {

        var infowindowContent = '<div id="content"><div id="bodyContent"><img src="&imageurl&"></div></div>';
        var infowindow = new google.maps.InfoWindow({
            content: ''
        });

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

        $scope.goHome = function() {
            $('#header').removeClass('header-small').addClass('header');
            $scope.view = 'main';
        }

        $scope.showMap = function() {
            $scope.view = 'map';

            $('#header').removeClass('header').addClass('header-small');
            if(!$scope.globalMap) { // dont reload the map if we've already got it
                $scope.globalMap = new google.maps.Map(document.getElementById("map-canvas"),
                    {   center: new google.maps.LatLng(42.397, -71.0),
                        zoom: 12
                    });
                $scope.getAllBags();
            }
        }

        $scope.changeView = function(viewName) {
            $scope.view = viewName;
        }

        $scope.mailLink = function() {
            $window.location = "mailto:bagsintrees@mail.com?subject=Bags In Trees Are Everywhere!";
        }

        $scope.slide = 'slide-left';

        $scope.goHome();
    });