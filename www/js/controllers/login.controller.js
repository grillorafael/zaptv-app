(function() {
    'use strict';
    angular.module('zaptv').controller('LoginCtrl', LoginCtrl);

    function LoginCtrl($scope, $state, User, Auth) {
        if(Auth.getToken() !== null) {
            $state.go('channels');
        }

        $scope.localLogin = function(ll) {
            User.login(ll).then(function() {
                $state.go('channels');
            }, function() {
                // TODO Handle error
            });
        };
    }
})();
