bagsInTreesControllers.controller('userController', function($scope, $routeParams, bagService) {

    $scope.getUserDetails = function(id) {
        bagService.getUser(id, function(data) {
            $scope.user = data[0];
        });
    };

    $scope.getUserDetails($routeParams.userid);
});