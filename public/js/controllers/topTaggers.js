bagsInTreesControllers.controller('topTaggersController', function($scope, bagService) {
    loadData = function() {
        bagService.fetchData('/user/top', function(data) {
            $scope.topTaggers = data;
        });
    };

    loadData();
});