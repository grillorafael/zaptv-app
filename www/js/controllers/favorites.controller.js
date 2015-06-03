(function() {
    'use strict';
    angular.module('zaptv').controller('FavoritesCtrl', FavoritesCtrl);

    function FavoritesCtrl($scope, $ionicModal) {
        $ionicModal.fromTemplateUrl('templates/see_shows_modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.seeShowsModal = modal;
        });
        $scope.seeShows = function() {
            $scope.seeShowsModal.show().then(function() {
            });
            // Analytics.trackEvent('Chat', 'view_schedules');
        };

        $scope.closeShowsModal = function() {
            $scope.seeShowsModal.hide();
        };
    }
})();
