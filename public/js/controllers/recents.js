bagsInTreesControllers.controller('recentsController', function ($scope, bagService) {
  var scrollPosition;
  
  var getAllBags = function () {
    bagService.fetchData('/bags/page/0/100', function (data) {
      $scope.recentBags = data;
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
    }, 10);
  };

  $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
    $('[data-toggle="tooltip"]').tooltip({delay: { "show": 500, "hide": 100 }});
  });


  /* clear the detailImageId, which hides the full size image and returns
      the client to the user listing without a page reload
  */
  $scope.backToUser = function() {
      $scope.detailImageId = null;
      $('html,body').animate({
          scrollTop: scrollPosition
      }, 10);
      $scope.bag = null;
  };

  getAllBags();

});