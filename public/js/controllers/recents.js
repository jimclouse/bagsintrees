bagsInTreesControllers.controller('recentsController', function ($scope, bagService) {
  var getAllBags = function () {
    bagService.fetchData('/bags/all', function (data) {
      $scope.recentBags = data;
    });
  };

  getAllBags();
});