(function() {
    'use strict';
    angular.module('zaptv').controller('BootstrapCtrl', BootstrapCtrl);

    function BootstrapCtrl($scope, $state, $timeout, $ionicHistory, Auth) {
        $ionicHistory.nextViewOptions({
            disableBack: true,
            historyRoot: true
        });

        $timeout(function() {
            if (Auth.getToken() === null) {
                $state.go('login');
            } else {
                $state.go('channels');
            }
        }, 1000);
    }
})();
