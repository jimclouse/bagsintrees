'use strict'

angular.module('bag-service', [])
// super simple service
    // each function returns a promise object 
    .factory('bags', function($http) {
        return {
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
        }
    });