(function() {
    'use strict';
    angular.module('zaptv').controller('RegisterCtrl', RegisterCtrl);

    function RegisterCtrl($scope, $state, $ionicPlatform, $ionicLoading, $ionicHistory, $animationTrigger, User, Auth, Analytics) {
        $scope.$on('$ionicView.enter', function() {
            $ionicPlatform.ready(function() {
                Analytics.init();
                Analytics.trackView($state.current.name);
            });
        });

        $scope.setForm = function(f) {
            $scope.form = f;
        };

        $scope.register = function(user) {
            $ionicLoading.show({
              template: 'Carregando...',
              hideOnStateChange: true
            });
            if($scope.form.registerForm.$valid) {
                User.register(user).then(function(tokenData) {
                    Analytics.trackEvent('Auth', 'register');
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
