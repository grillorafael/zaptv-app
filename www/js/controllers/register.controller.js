(function() {
    'use strict';
    angular.module('zaptv').controller('RegisterCtrl', RegisterCtrl);

    function RegisterCtrl($scope, $state, $ionicPlatform, $ionicHistory, User, Auth) {
        $scope.register = function(user) {
            User.register(user).then(function() {
                $ionicHistory.nextViewOptions({
                    disableBack: true,
                    historyRoot: true
                });

                $state.go('channels');
            }, function() {
                // TODO Handle error
            });
        };
    }
})();
