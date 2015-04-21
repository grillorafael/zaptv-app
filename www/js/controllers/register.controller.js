(function() {
    'use strict';
    angular.module('zaptv').controller('RegisterCtrl', RegisterCtrl);

    function RegisterCtrl($scope, $state, $ionicPlatform, $ionicHistory, User, Auth) {
        $scope.setForm = function(f) {
            $scope.form = f;
        };

        $scope.register = function(user) {
            if($scope.form.registerForm.$valid) {
                User.register(user).then(function() {
                    $ionicHistory.nextViewOptions({
                        disableBack: true,
                        historyRoot: true
                    });

                    $state.go('channels');
                }, function() {
                    // TODO Handle error
                });
            }
        };
    }
})();
