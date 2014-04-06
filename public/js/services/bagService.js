'use strict'

angular.module('bagService', [])
// super simple service
    // each function returns a promise object 
    .factory('bags', function($http) {
        return {
            getAll: function(callback) {
                return $http.get("/bags/all")
                    .success(function(response) {
                        callback(response);
                    })
                    .error(function() {
                        console.log("something went wrong");
                    });
            }
        }
    });