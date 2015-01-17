bagsInTreesServices.service('bagService', ['$http', function($http) {
    var service = {
        getAll: function(cb) {
            return $http.get('/bags/all')
                .success(function(response) {
                    cb(response);
                })
                .error(function() {
                    console.error('something went wrong');
                });
        },
        getOne: function(id, cb) {
            return $http.get('/bags/one/' + id)
                .success(function(response) {
                    cb(response);
                })
                .error(function() {
                    console.error('Unable to fetch bag id ' + id);
                });
        },
        getUser: function(id, cb) {
            return $http.get('/user/' + id)
                .success(function(response) {
                    cb(response);
                })
                .error(function() {
                    console.error('Unable to get details for user ' + id);
                });
        },
        getUserBags: function(id, cb) {
            return $http.get('/user/bags/' + id)
                .success(function(response) {
                    cb(response);
                })
                .error(function() {
                    console.error('Unable to get details for user ' + id);
                });
        },
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