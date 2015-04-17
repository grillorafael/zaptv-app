(function() {
    'use strict';
    angular.module('zaptv').controller('LoginCtrl', LoginCtrl);

    function LoginCtrl($scope, $state, $ionicPlatform, User, Auth) {
        if(Auth.getToken() !== null) {
            $state.go('channels');
        }
        else {
            $ionicPlatform.ready(function() {
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
                }
            });
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
