(function() {
    'use strict';
    angular.module('zaptv').controller('RegisterCtrl', RegisterCtrl);

    function RegisterCtrl($scope, $state, $ionicPlatform, $ionicModal, $ionicLoading, $ionicHistory, $animationTrigger, User, Auth, Analytics, ngNotify) {
        $scope.hideEmailFieldFromModal = true;

        $scope.$on('$ionicView.enter', function() {
            $ionicPlatform.ready(function() {
                Analytics.init();
                Analytics.trackView($state.current.name);
            });
        });

        $scope.setForm = function(f, name) {
            if(!$scope.form) {
                $scope.form = {};
            }

            $scope.form[name] = f;
        };

        $ionicModal.fromTemplateUrl('templates/set_username_modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });

        $scope.setUsername = function(u) {
            if ($scope.form.user.usernameForm.$valid) {
                $ionicLoading.show({
                    template: '<ion-spinner></ion-spinner>',
                    hideOnStateChange: true
                });

                User.register($scope.user).then(function(tokenData) {
                    Analytics.trackEvent('Auth', 'register');
                    $ionicHistory.nextViewOptions({
                        disableBack: true,
                        historyRoot: true
                    });

                    $scope.modal.hide();
                    $state.go('channels');
                }, function() {
                    // TODO Display email or username already taken
                    $ionicLoading.hide();
                    $animationTrigger.trigger('register-form', 'bounce-finite', $animationTrigger.FROM_START);
                });
            } else {
                $animationTrigger.trigger('username-form', 'bounce-finite', $animationTrigger.FROM_START);
            }
        };

        $scope.register = function(user) {
            var msg = '';
            if(!$scope.form.register.registerForm.email.$valid) {
                msg = 'O email necessita ser válido.';
            }
            else if(!$scope.form.register.registerForm.password.$modelValue || $scope.form.register.registerForm.password.$modelValue.length < 4) {
                msg = 'A senha necessita ser mais que 4 dígitos.';
            }

            if ($scope.form.register.registerForm.$valid) {
                $scope.user = user;
                $scope.modal.show();
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
