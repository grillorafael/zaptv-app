(function() {
    'use strict';
    angular.module('zaptv').controller('LoginCtrl', LoginCtrl);

    function LoginCtrl($scope, $state, User) {
        $scope.localLogin = function(ll) {
            User.login(ll).then(function() {
                $state.go('channels');
            }, function() {
                // TODO Handle error
            });
        };
    }
})();
