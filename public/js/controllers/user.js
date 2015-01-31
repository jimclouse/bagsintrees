bagsInTreesControllers.controller('userController', function ($scope, $routeParams, bagService) {

    $scope.getUserDetails = function (id) {
        bagService.fetchData('/user/' + id, function (data) {
            $scope.user = data[0];
        });
    };

    $scope.getUserBags = function (id) {
        bagService.fetchData('/user/bags/' + id, function (data) {
            $scope.userBags = data;
        });
    };

    $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
        $('[data-toggle="tooltip"]').tooltip({delay: { "show": 500, "hide": 100 }});
    });

    $scope.getUserDetails($routeParams.userid);
    $scope.getUserBags($routeParams.userid);
});