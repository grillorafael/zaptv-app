(function() {
    'use strict';
    angular.module('zaptv').controller('LoginCtrl', LoginCtrl);

    function LoginCtrl($scope, $state, $ionicPlatform, $ionicHistory, $animationTrigger, User, Auth) {
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
                $ionicHistory.nextViewOptions({
                    disableBack: true,
                    historyRoot: true
                });

                $state.go('channels');
            }, function() {
                // TODO Handle error
                $animationTrigger.trigger('login-form', 'bounce-finite', $animationTrigger.FROM_START);
            });
        };
    }
})();
