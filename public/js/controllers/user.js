bagsInTreesControllers.controller('userController', function($scope, $routeParams, bagService) {

    $scope.getUserDetails = function(id) {
        bagService.getUser(id, function(data) {
            $scope.user = data[0];
        });
    };

    $scope.getUserBags = function(id) {
        bagService.getUserBags(id, function(data) {
            $scope.userBags = data;
        });
    };

    $scope.getUserDetails($routeParams.userid);
    $scope.getUserBags($routeParams.userid);
});