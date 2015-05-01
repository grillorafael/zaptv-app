(function() {
    'use strict';
    angular.module('zaptv').controller('RegisterCtrl', RegisterCtrl);

    function RegisterCtrl($scope, $state, $ionicPlatform, $ionicHistory, $animationTrigger, User, Auth, Analytics) {
        Analytics.init();
        Analytics.trackView('register');

        $scope.setForm = function(f) {
            $scope.form = f;
        };

        $scope.register = function(user) {
            if($scope.form.registerForm.$valid) {
                User.register(user).then(function(tokenData) {
                    Analytics.trackEvent('Auth', 'register');
                    $ionicHistory.nextViewOptions({
                        disableBack: true,
                        historyRoot: true
                    });

                    $state.go('channels');
                }, function() {
                    // TODO Handle error
                });
            }
            else {
                $animationTrigger.trigger('register-form', 'bounce-finite', $animationTrigger.FROM_START);
            }
        };
    }
})();
