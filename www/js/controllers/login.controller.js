(function() {
    'use strict';
    angular.module('zaptv').controller('LoginCtrl', LoginCtrl);

    function LoginCtrl($scope, $state, $ionicPlatform, $ionicHistory,
        $animationTrigger, $cordovaFacebook, Analytics, User, Auth, State) {

        $ionicPlatform.ready(function() {
            Analytics.init();
            Analytics.trackView('login');
        });

        $scope.facebookLogin = function() {
            var userInfo = {};
            $cordovaFacebook.login(["public_profile", "email", "user_friends"])
                .then(function(loginResponse) {
                    userInfo.fb_token = loginResponse.authResponse.accessToken;
                    userInfo.fb_id = loginResponse.authResponse.userID;

                    $cordovaFacebook.api("me", ["public_profile"])
                        .then(function(meResponse) {
                            userInfo.email = meResponse.email;
                            userInfo.name = meResponse.name;
                            userInfo.gender = meResponse.gender ? meResponse.gender[0] : null;
                            State.set('fb_response', userInfo);
                            User.login(userInfo).then(function() {
                                Analytics.trackEvent('Auth', 'login');
                                $ionicHistory.nextViewOptions({
                                    disableBack: true,
                                    historyRoot: true
                                });

                                $state.go('channels');
                            }, function() {
                                // TODO Fix this gambi
                                $state.go('set_username');
                            });
                        }, function(error) {
                            // TODO Handle error
                        });
                }, function(error) {
                    // TODO Handle error
                });
        };

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
