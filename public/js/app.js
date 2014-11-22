angular.module('bagsInTrees', 
    ['ngRoute', 'ngAnimate', 'ngCookies', 'bagsintrees.controllers', 'bagsintrees.services'])
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
                controller  : 'mapController'
            })
            .when('/recent', {
                templateUrl : 'views/recent.html'
            })
            .when('/li', {
                templateUrl: 'views/linkedIn.html',
                controller : 'linkedInController'
            })
            .when('/liRedirect', {
                templateUrl: 'views/liSuccess.html',
                controller : 'linkedInController'
            })
            .when('/404', {
                templateUrl : 'views/404.html'
            })
            .otherwise({
                redirectTo: '/404'
            });
    });

