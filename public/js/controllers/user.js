bagsInTreesControllers.controller('userController', function ($scope, $routeParams, bagService) {
    var scrollPosition;

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

    var getSingleBag = function (id) {
        bagService.fetchData('/bags/one/' + id, function (data) {
          $scope.bag = data;
          setTimeout(function() {
            $('[data-toggle="tooltip"]').tooltip({delay: { "show": 500, "hide": 100 }});
          }, 500);
        });
    };

    $scope.selectFullSize = function(bag) {
        scrollPosition = window.scrollY;
        getSingleBag(bag.id);
        $scope.detailImageId = bag.id;
        $('html,body').animate({
            scrollTop: 0
        }, 100);
    };

    $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
        $('[data-toggle="tooltip"]').tooltip({delay: { "show": 500, "hide": 100 }});
    });

    /* clear the detailImageId, which hides the full size image and returns
        the client to the user listing without a page reload
    */
    $scope.backToUser = function() {
        $scope.detailImageId = null;
        $('html,body').animate({
            scrollTop: scrollPosition
        }, 100);
        $scope.bag = null;
    };

    $scope.getUserDetails($routeParams.userid);
    $scope.getUserBags($routeParams.userid);
});