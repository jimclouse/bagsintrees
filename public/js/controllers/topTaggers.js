bagsInTreesControllers.controller('topTaggersController', function ($scope, $location, bagService) {
  var loadData = function () {
    bagService.fetchData('/user/top', function (data) {
      $scope.topTaggers = data;
    });
  };
  $scope.goToUser = function (user) {
    $location.path('/user/' + user.id);
  }

  loadData();
});