(function() {
    'use strict';
    angular.module('zaptv').controller('SetUsernameCtrl', SetUsernameCtrl);

    function SetUsernameCtrl($scope, $state, $animationTrigger, $ionicHistory, User, Analytics, State) {
        Analytics.init();
        Analytics.trackView('set_username');

        var user = State.get('fb_response');

        $scope.setForm = function(f) {
            $scope.form = f;
        };

        $scope.register = function(u) {
            if($scope.form.registerForm.$valid) {
                user.username = u.username;
                User.login(user).then(function(tokenData) {
                    Analytics.trackEvent('Auth', 'facebook_login');
                    $ionicHistory.nextViewOptions({
                        disableBack: true,
                        historyRoot: true
                    });

                    $state.go('channels');
                }, function() {
                    // TODO Display email or username already taken
                    $animationTrigger.trigger('register-form', 'bounce-finite', $animationTrigger.FROM_START);
                });
            }
            else {
                $animationTrigger.trigger('register-form', 'bounce-finite', $animationTrigger.FROM_START);
            }
        };
    }
})();
