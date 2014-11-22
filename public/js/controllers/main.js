var bagsInTreesControllers = angular.module('bagsintrees.controllers', [])
var bagsInTreesServices = angular.module('bagsintrees.services',[])

bagsInTreesControllers.controller('mainController', function($scope, $rootScope, $window, $location, $log, $document) {
    $rootScope.$on("$locationChangeStart", function(event, next, current) { 
        if ( next.substring(next.indexOf('#/')+2, next.length) === "") {
            $('#sticky-header').removeClass('header-small').addClass('header-large');
        }
        else {
            $('#sticky-header').removeClass('header-large').addClass('header-small');
        }
        $(window).scrollTop(0); // need this to force position to top of page rather than where user had scrolled on previous page
    });

    $scope.mailLink = function() {
        $window.location = "mailto:bagsintrees@mail.com?subject=Bags In Trees Are Everywhere!";
    }

})