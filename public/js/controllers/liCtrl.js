angular.module('liCtrl', [])
    .controller('liCtrl', function($scope, $location) {

        $scope.liAuth = function() {
            url = "https://www.linkedin.com/uas/oauth2/authorization?response_type=code&client_id=77fzr2ee6e1qaw&state=DCEEFWF45453sdffef424&redirect_uri=http://www.bagsintrees.org/liRedirect"
            window.location.href = url;
        }

        $scope.captureQueryString = function() {
            var qs = $location.search()
            
            $scope.error = qs.error
            $scope.error_description = qs.error_description
            $scope.code = qs.code
            $scope.state = qs.state

            
            
        }
    })