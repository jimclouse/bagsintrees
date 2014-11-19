angular.module('liCtrl', [])
    .controller('liCtrl', function($scope, $location, $http) {


        $http.defaults.useXDomain = true

        $scope.s = {searchTerm: "foo"}
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

        $scope.impersonateJim = function() {
            window.location.href = '#/liRedirect?code=AQS3P7PEkRlkndiMXRIWvS1AFhZsDollT1BFNeXZbGt4ylCSxEMnHEAnvU2S38kPklaMSubroRXLY6jnrrRjnkpoCPvXaj1HttllN5wb5-taQH_d1uE&state=Imposter'
        }
        
        $scope.liSearch = function() {
            console.log($scope.s.searchTerm);
            var options = {
                headers: {
                    Connection: 'Keep-Alive',
                    Authorization: 'Bearer ' + $scope.code
                }
            }
            var url = 'https://api.linkedin.com/v1/company-search?keywords=' + encodeURIComponent($scope.s.searchTerm)
            $http.get(url, options)
            .success(function(res) {
                console.log(res)
            })
            .error(function(err) {
                console.log(err)
            })
             
        }
    })





    