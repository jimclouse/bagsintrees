bagsInTreesServices.service('bagService', ['$http', function($http) {
    var service = {
        fetchData: function(url, cb) {
            return $http.get(url)
                .success(function(response) {
                    cb(response);
                })
                .error(function(err) {
                    console.error('Error accessing url ' + url + '. ' + err);
                });
        }

    };
    return service;
}]);