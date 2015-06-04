(function() {
    'use strict';
    angular.module('zaptv').controller('FavoritesCtrl', FavoritesCtrl);

    function FavoritesCtrl($scope, $ionicModal, $timeout, State, User, Channel) {
        // TODO ADD TRACKER EVENTS

        $scope.showDeleteButton = false;
        $scope.searchSchedules = [];
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

        $scope.addFavorite = function (schedule) {
            schedule.is_favorite = !schedule.is_favorite;
            Channel.toggleLike(schedule.channel.id, schedule.geo_state, schedule.name);
        };

        var timeout = null;
        $scope.queryResult = function(query) {
            if(timeout) {
                $timeout.cancel(timeout);
                timeout = null;
            }

            timeout = $timeout(function() {
                if(query && query.replace(' ', '').length > 0) {
                    $scope.isFetching = true;
                    Channel.searchSchedulesForFavorite(query, State.get('geo_state')).then(function(result) {
                        $scope.searchSchedules = result;
                        console.log(result);
                    }, function(e) {
                        // TODO Handle error
                    }).finally(function() {
                        $scope.isFetching = false;
                    });
                }
            }, 500);
        };
    }
})();
