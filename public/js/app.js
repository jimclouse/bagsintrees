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
        templateUrl : 'views/recent.html',
        controller  : 'recentsController'
      })
      .when('/top', {
        templateUrl : 'views/topTaggers.html'
      })
      .when('/help', {
        templateUrl : 'views/help.html'
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
        function (event, next, last) {
          var key;
          var path = $location.path(); // set initial path in case next fails
          if (!$window.ga) {
            return;
          }
          if (next && next.$$route && next.$$route.originalPath) {
            path = next.$$route.originalPath;
          }
          if (next.params) {
            for (key in next.params) {
              path = path.replace(':' + key, next.params[key]);
            }
          }
          analytics.send('send', 'pageview', {page: path});

        });
  }])
  .directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    };
  });


