angular.module('bagCtrl', [])
    
    .controller('mainCtrl', function($scope, $http, bags) {
        $scope.greeting = 'Hola!';

        $scope.getAllBags = function() {
            bags.getAll(function(data) {
                    $scope.bags = data;
                });
        }

        $scope.loadFromInstagram = function() {
            $http.post("/load/all");
        }
    });