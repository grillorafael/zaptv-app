(function() {
    'use strict';
    angular.module('zaptv').controller('LoginCtrl', LoginCtrl);

    function LoginCtrl($scope, $state, $ionicPlatform, $ionicHistory, $animationTrigger, Analytics, User, Auth) {
        Analytics.init();
        Analytics.trackView('login');

        $ionicPlatform.ready(function() {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
            }
        });

        $scope.localLogin = function(ll) {
            User.login(ll).then(function() {
                Analytics.trackEvent('Auth', 'login');
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
