(function() {
    'use strict';
    angular.module('zaptv').controller('FavoritesCtrl', FavoritesCtrl);

    function FavoritesCtrl($scope, $ionicModal, $timeout, State, User, Channel, Auth) {
        // TODO ADD TRACKER EVENTS

        var user = Auth.getUser();

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

        $scope.addFavorite = function (schedule, index) {
            schedule.is_favorite = !schedule.is_favorite;
            $timeout(function() {
                $scope.searchSchedules.splice(index, 1);
            }, 500);
            Channel.toggleLike(schedule.channel.id, schedule.geo_state, schedule.name);
            $scope.schedules.push({
                channel_id: schedule.channel.id,
                geo_state: schedule.geo_state,
                status: "A",
                user_id: user.id,
                schedule_name: schedule.name,
                show_schedule: schedule
            });
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
