(function() {
    'use strict';
    angular.module('zaptv').controller('FavoritesCtrl', FavoritesCtrl);

    function FavoritesCtrl($scope, $ionicModal, User, Channel) {
        $scope.showDeleteButton = false;
        $ionicModal.fromTemplateUrl('templates/see_shows_modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.seeShowsModal = modal;
        });

        $scope.isLoadingFavorites = true;

        User.myFavorites().then(function(schedules) {
            $scope.schedules = schedules;
        }, function(e) {
            // TODO Handle error
        })
        .finally(function() {
            $scope.isLoadingFavorites = false;
        });

        $scope.seeShows = function() {
            $scope.seeShowsModal.show().then(function() {});
            // Analytics.trackEvent('Chat', 'view_schedules');
        };

        $scope.closeShowsModal = function() {
            $scope.seeShowsModal.hide();
        };

        $scope.toggleDisplayDelete = function() {
            $scope.showDeleteButton = !$scope.showDeleteButton;
        };

        $scope.removeLike = function(schedule, index) {
            Channel.toggleLike(schedule.channel_id, schedule.geo_state, schedule.schedule_name);
            $scope.schedules.splice(index, 1);
        };
    }
})();
