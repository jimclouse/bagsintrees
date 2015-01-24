angular.module('bagsInTrees',
  ['ngRoute', 'ngAnimate', 'ngCookies', 'bagsintrees.controllers', 'bagsintrees.services'])
  .config(function ($routeProvider) {
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
      .when('/map', {
        templateUrl : 'views/map.html',
        controller  : 'mapController'
      })
      .when('/recent', {
        templateUrl : 'views/recent.html'
      })
      .when('/top', {
        templateUrl : 'views/topTaggers.html'
      })
      .when('/tips', {
        templateUrl : 'views/tips.html'
      })
      .when('/full/:id', {
        templateUrl : 'views/fullSize.html'
      })
      .when('/user/:userid', {
        templateUrl : 'views/user.html',
        controller  : 'userController'
      })
      .when('/404', {
        templateUrl : 'views/404.html'
      })
      .otherwise({
        redirectTo: '/404'
      });
  })
  .run(['$rootScope', '$location', '$window', function ($rootScope, $location, $window) {
    $rootScope
      .$on('$routeChangeSuccess',
        function (event) {
          if (!$window.ga) {
            return;
          }
          $window.ga('send', 'pageview', {page: $location.path()});
        });
  }]);


