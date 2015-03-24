bagsInTreesControllers.controller('recentsController', function ($scope, bagService) {
  var getAllBags = function () {
    bagService.fetchData('/bags/recent', function (data) {
      $scope.recentBags = data;
    });
  };

  $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
    $('[data-toggle="tooltip"]').tooltip({delay: { "show": 500, "hide": 100 }});
  });
  
  getAllBags();
});