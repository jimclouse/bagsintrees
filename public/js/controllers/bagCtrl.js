angular.module('bagCtrl', [])
    
    .controller('mainCtrl', function($scope, $http, bags) {
        var globalMap; // used for google map object - available globally

        $scope.getAllBags = function() {
            bags.getAll(function(data) {
                    $scope.bags = data;
                    for (var i = 0; i < data.length; i++) {
                        new google.maps.Marker({position: new google.maps.LatLng(data[i].latitude, data[i].longitude), map: globalMap});
                    }
                });
        }

        $scope.loadFromInstagram = function() {
            $http.post("/load/all");
        }

        $scope.showMap = function() {
            $scope.viewMap = true;
            globalMap = new google.maps.Map(document.getElementById("map-canvas"),
                {   center: new google.maps.LatLng(42.397, -71.0),
                    zoom: 12
                });
        }

        // on controller startup
        $scope.getAllBags();
    });