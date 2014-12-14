bagsInTreesServices.service('bagService', ['$http', function($http) {
    var service = {
        getAll: function(cb) {
            return $http.get("/bags/all")
                .success(function(response) {
                    cb(response);
                })
                .error(function() {
                    console.error("something went wrong");
                });
        },

        getOne: function(id, cb) {
            return $http.get("/bags/one/" + id)
                .success(function(response) {
                    cb(response);
                })
                .error(function() {
                    console.error("Unable to fetch bag id " + id);
                });
        }
    };
    return service;
}]);