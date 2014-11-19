angular.module('bagsInTrees', ['ngRoute', 'ngAnimate', 'ngCookies', 'bagCtrl', 'bagService'])
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
            .when('/li', {
                templateUrl: 'views/linkedIn.html',
                controller : 'liCtrl'
            })
            .when('/liRedirect', {
                templateUrl: 'views/liSuccess.html',
                controller : 'liCtrl'
            })
            .when('/404', {
                templateUrl : 'views/404.html'
            })
            .otherwise({
                redirectTo: '/404'
            });
    });

