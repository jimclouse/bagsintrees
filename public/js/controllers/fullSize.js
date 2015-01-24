bagsInTreesControllers.controller('fullSizeController', function ($scope, $routeParams, bagService) {
  var getSingleBag = function (id) {
    bagService.fetchData('/bags/one/' + id, function (data) {
      $scope.bag = data;
    });
  };

  if ($routeParams && $routeParams.id) {
    getSingleBag($routeParams.id);
  }
});