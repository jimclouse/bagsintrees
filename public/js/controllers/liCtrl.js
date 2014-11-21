angular.module('liCtrl', [])
    .controller('liCtrl', function($scope, $location, $http) {
        $('#sticky-header').hide();
        $http.defaults.useXDomain = true

        $scope.liAuth = function() {
            url = "https://www.linkedin.com/uas/oauth2/authorization?response_type=code&client_id=77fzr2ee6e1qaw&state=DCEEFWF45453sdffef424&redirect_uri=http://www.bagsintrees.org/liRedirect"
            window.location.href = url;
        }

        $scope.liSearch = function() {
            console.log($scope.s.searchTerm);
            var url = '/liSearch?term=' + encodeURIComponent($scope.s.searchTerm)
            $http.get(url)
            .success(function(res) {
                console.log(res)
                $scope.searchResults = res
            })
            .error(function(err) {
                $scope.error = err
            })
             
        }
    })





    