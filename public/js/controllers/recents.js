bagsInTreesControllers.controller('recentsController', function($scope, bagService) {
    getAllBags = function() {
        bagService.getAll(function(data) {
            $scope.recentBags = data;
        });
    };

    getAllBags();
});