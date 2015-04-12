var bagsInTreesControllers = angular.module('bagsintrees.controllers', []);
var bagsInTreesServices = angular.module('bagsintrees.services',[]);

bagsInTreesControllers.controller('mainController', function($scope, $rootScope, $window, $location) {
    $rootScope.$on("$locationChangeStart", function(event, next, current) {
        if ( next.substring(next.indexOf('#/')+2, next.length) === "") {
            $('#sticky-header').removeClass('header-small').addClass('header-large');
        }
        else {
            $('#sticky-header').removeClass('header-large').addClass('header-small');
        }
        $(window).scrollTop(0); // need this to force position to top of page rather than where user had scrolled on previous page
    });

    // look for dev=true route param to disable analytics
    queryParams = $location.search();
    if(queryParams.dev) {
        localStorage.setItem('bagsintrees_analytics_off', 'true');
    }
    
    $scope.mailLink = function() {
        $window.location = "mailto:bagsintrees@mail.com?subject=Bags In Trees Are Everywhere!";
    };

    //Load site content
    // need to put this in a yaml and load it on startup
    $scope.content = {};

    $scope.content.section2 = 'Cities throughout The United States and other countries are moving to ban or dis-incentivize the use of plastic bags. \
            Most recently, the state of California passed legislation halting the use of single-use plastic bags at grocery stores. \
            <br/>Data from Bags In Trees can be used as evidence by groups promoting such causes to show the prevelance and distribution \
            of bags.<br/><br/> \
            Do you know of a group that could use this data? Send them an email <a href="mailto:" class="blackLink">telling them about Bags In Trees</a>.';
    

});