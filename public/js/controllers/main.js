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

    $scope.content.segment3 = 'Cities throughout The United States and other countries are moving to ban or dis-incentivize the use of plastic bags. \
            Most recently, the state of California passed legislation halting the use of single-use plastic bags at grocery stores. \
            <br/>Data from Bags In Trees can be used as evidence by groups promoting such causes to show the prevelance and distribution \
            of bags.<br/><br/> \
            Do you know of a group that could use this data? Send them an email <a href="mailto:" class="blackLink">telling them about Bags In Trees</a>.';
    
    $scope.content.segment4 = 'Your organization can leverage the geo-tagged data of plastic bags in trees to locate and remove plastic bags.<br/><br/> \
            This is already being done in New York by the "Bag Snaggers" at the <a href="http://www.nyrp.org/greening_sustainability/bag_snagging_program" class="blackLink" target="blank">New York Restoration Project (NYRP)</a>. \
            NYRP relies on phone calls and emails to locate the bags, but may be able to rely on #bagsintrees in the future.<br/><br/> \
            <strong>Does your city have a bag removal initiative?</strong>';

    $scope.content.segment5 = '<p>All you need is an Instagram account and your smart phone. However, be sure to check out the <a href="/#/tips" class="blackLink">bag tagging tips</a> \
            to make sure every one of your photos of plastic bags in trees appears on the bag map!</a><br/><br/> \
            To learn more about Bags In Trees and why plastic pollution is a big problem, read the <a href="/#/about" class="blackLink">About page</a>.<br/><br/> \
            Finally, I\'m sure there are many other uses for this data that I haven\'t thought of. Please <a href="" ng-click="mailLink()" class="blackLink">share your thoughts and ideas</a> with me.</p>';
    

});