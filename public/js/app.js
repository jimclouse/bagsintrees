angular.module('bagsInTrees', ['ngRoute', 'ngAnimate', 'bagCtrl', 'bagService'])
    .config(function($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl : 'views/main.html'
            })
            .when('/about', {
                templateUrl : 'views/about.html'
            })
            .when('/faq', {
                templateUrl : 'views/faq.html'
            })
            .when('/next', {
                templateUrl : 'views/next.html'
            })
            .when('/map', {
                templateUrl : 'views/map.html',
                controller  : 'mapCtrl'
            })
    });

