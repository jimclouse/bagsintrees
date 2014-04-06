angular.module('bagCtrl', [])
    
    .controller('mainCtrl', function($scope, bags) {
        $scope.greeting = 'Hola!';

        $scope.getAllBags = function() {
            bags.getAll(function(data) {
                    $scope.bags = data;
                });
        }
    });