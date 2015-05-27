(function() {
    'use strict';
    angular.module('zaptv').controller('RegisterCtrl', RegisterCtrl);

    function RegisterCtrl($scope, $state, $ionicPlatform, $ionicLoading, $ionicHistory, $animationTrigger, User, Auth, Analytics, ngNotify) {
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
            var msg = '';
            if (!user || !$scope.form.registerForm.username.$valid) {
                msg = 'Usuário necessita ter no mínimo 4 caracteres.';
                console.log(user)
                if (user && $scope.form.registerForm.username.$modelValue.length >= 4) {
                    msg = 'Este usuário já existe. Escolha outro, por favor.'
                }
            }

            else if(!$scope.form.registerForm.email.$valid) {
                msg = 'O email necessita ser válido.';
            }
            // else if($scope.form.registerForm.password.$modelValue.length < 4) {
            //     msg = 'A senha necessita ser mais que 4 dígitos.';
            // }

            if ($scope.form.registerForm.$valid) {
                User.register(user).then(function(tokenData) {
                    Analytics.trackEvent('Auth', 'register');
                    $ionicHistory.nextViewOptions({
                        disableBack: true,
                        historyRoot: true
                    });

                    $state.go('channels');
                }, function() {
                    // TODO Display email or username already taken
                    $ionicLoading.hide();
                    $animationTrigger.trigger('register-form', 'bounce-finite', $animationTrigger.FROM_START);
                });
            } else {
                $ionicLoading.hide();
                ngNotify.set(msg, {
                    position: 'bottom',
                    type: 'error'
                });
                $animationTrigger.trigger('register-form', 'bounce-finite', $animationTrigger.FROM_START);
            }
        };
    }
})();
