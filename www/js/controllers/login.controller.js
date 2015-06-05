(function() {
    'use strict';
    angular.module('zaptv').controller('LoginCtrl', LoginCtrl);

    function LoginCtrl($scope, $state, $ionicPlatform, $ionicHistory, $ionicLoading,
        $animationTrigger, $cordovaFacebook, $ionicModal, $localForage, Analytics, User, Auth, State, ngNotify) {

        $scope.isSending = false;
        $scope.sentEmail = false;
        $scope.mailError = false;

        $scope.$on('$ionicView.enter', function() {
            $ionicPlatform.ready(function() {
                Analytics.init();
                Analytics.trackView($state.current.name);

                if (window.cordova) {
                    // Logs out of facebook
                    $cordovaFacebook.logout()
                        .then(function(success) {
                            // success
                        }, function(error) {
                            // error
                        });

                    var user = Auth.getUser();
                    if (user && user.id) {
                        parsePlugin.getInstallationId(function(id) {
                            parsePlugin.unsubscribe("user_" + user.id, function() {
                                Auth.clear();
                                $localForage.clear();
                            }, function() {
                                Auth.clear();
                                $localForage.clear();
                            });
                        }, function(e) {
                            Auth.clear();
                            $localForage.clear();
                        });
                    }
                }
                else {
                    Auth.clear();
                    $localForage.clear();
                }
            });
        });

        $ionicModal.fromTemplateUrl('templates/set_username_modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });

        $ionicModal.fromTemplateUrl('templates/forgot_password_modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.forgotPasswordModal = modal;
        });

        $scope.openForgotPasswordModal = function() {
            $scope.sentEmail = false;
            $scope.mailError = false;
            $scope.forgotPasswordModal.show().then(function() {});
        };

        $scope.closeForgotPasswordModal = function() {
            $scope.forgotPasswordModal.hide();
        };

        $scope.forgot = function(email) {
            $scope.isSending = true;
            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner>',
                hideOnStateChange: true
            });
            $scope.mailError = false;
            User.forgotPassword(email).then(function(result) {
                console.log(result);
                $scope.sentEmail = true;
            }, function() {
                $scope.mailError = true;
                ngNotify.set('Seu email está está incorreto ou não existe.', {
                    type: 'error',
                    theme: 'pure',
                    duration: 4000
                });
            }).finally(function() {
                $scope.isSending = false;
                $ionicLoading.hide();
            })
        };

        $scope.setForm = function(f) {
            $scope.form = f;
        };

        $scope.setUsername = function(u) {
            if ($scope.form.usernameForm.$valid) {
                User.login(u).then(function(tokenData) {
                    Analytics.trackEvent('Auth', 'facebook_login');
                    $ionicHistory.nextViewOptions({
                        disableBack: true,
                        historyRoot: true
                    });

                    $scope.modal.hide();
                    $state.go('channels');
                }, function() {
                    // TODO Display email or username already taken
                    $animationTrigger.trigger('username-form', 'bounce-finite', $animationTrigger.FROM_START);
                });
            } else {
                $animationTrigger.trigger('username-form', 'bounce-finite', $animationTrigger.FROM_START);
            }
        };

        $scope.closeModal = function() {
            $scope.userToView = null;
            $scope.modal.hide();
        };

        $scope.facebookLogin = function() {
            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner>',
                hideOnStateChange: true
            });
            $scope.user = {};
            //$cordovaFacebook.login(["public_profile", "email", "user_friends", "publish_actions", "user_birthdate"])
            $cordovaFacebook.login(["public_profile", "email", "user_friends"])
                .then(function(loginResponse) {
                    $scope.user.fb_token = loginResponse.authResponse.accessToken;
                    $scope.user.fb_id = loginResponse.authResponse.userID;

                    $cordovaFacebook.api("me", ["public_profile"])
                        .then(function(meResponse) {
                            $scope.hasEmail = meResponse.email;
                            $scope.user.email = meResponse.email;
                            $scope.user.name = meResponse.name;
                            $scope.user.gender = meResponse.gender ? meResponse.gender[0] : null;
                            User.login($scope.user).then(function() {
                                Analytics.trackEvent('Auth', 'login');
                                $ionicHistory.nextViewOptions({
                                    disableBack: true,
                                    historyRoot: true
                                });

                                $state.go('channels');
                            }, function() {
                                // TODO Fix this gambi
                                $ionicLoading.hide();
                                $scope.modal.show();
                            });
                        }, function(error) {
                            // TODO Handle error
                            console.log(error);
                            $ionicLoading.hide();
                        });
                }, function(error) {
                    console.log(error);
                    $ionicLoading.hide();
                    // TODO Handle error
                });
        };

        $scope.localLogin = function(ll) {
            $ionicLoading.show({
                template: '<ion-spinner></ion-spinner>',
                hideOnStateChange: true
            });
            User.login(ll).then(function(response) {
                Analytics.trackEvent('Auth', 'login');
                $ionicHistory.nextViewOptions({
                    disableBack: true,
                    historyRoot: true
                });

                $state.go('channels');
            }, function() {
                // TODO Handle error
                $ionicLoading.hide();
                $animationTrigger.trigger('login-form', 'bounce-finite', $animationTrigger.FROM_START);
                ngNotify.set('Seu usuário ou senha estão incorretos', {
                    type: 'error',
                    theme: 'pure',
                    duration: 4000
                });
            });
        };
    }
})();
