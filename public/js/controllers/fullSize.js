bagsInTreesControllers.controller('fullSizeController', function ($scope, $routeParams, bagService) {
  var getSingleBag = function (id) {
    bagService.fetchData('/bags/one/' + id, function (data) {
      $scope.bag = data;
      setTimeout(function() {
        $('[data-toggle="tooltip"]').tooltip({delay: { "show": 500, "hide": 100 }});
      }, 500);
    });
  };

  if ($routeParams && $routeParams.id) {
    getSingleBag($routeParams.id);
  }
});