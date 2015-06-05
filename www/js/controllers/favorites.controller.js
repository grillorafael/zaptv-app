(function() {
    'use strict';
    angular.module('zaptv').controller('FavoritesCtrl', FavoritesCtrl);

    function FavoritesCtrl($scope, $ionicModal, $timeout, $ionicPlatform, $state, State, User, Channel, Auth, Analytics) {
        var user = Auth.getUser();

        $ionicPlatform.ready(function() {
            Analytics.init(user.id);
            Analytics.trackView($state.current.name);
        });

        $scope.showDeleteButton = false;
        $scope.searchSchedules = [];

        $ionicModal.fromTemplateUrl('templates/see_shows_modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.seeShowsModal = modal;
        });

        $scope.isLoadingFavorites = true;

        $scope.$on('$ionicView.enter', function() {
            User.myFavorites().then(function(schedules) {
                $scope.schedules = schedules;
            }, function(e) {
                // TODO Handle error
            })
            .finally(function() {
                $scope.isLoadingFavorites = false;
            });
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
            schedule.is_favorite = false;
            Channel.toggleFavorite(schedule.channel_id, schedule.geo_state, schedule.schedule_name, schedule);
            $scope.schedules.splice(index, 1);
            Analytics.trackEvent('Favorite', 'remove_favorite');
        };

        $scope.addFavorite = function (schedule, index) {
            schedule.is_favorite = true;
            $timeout(function() {
                $scope.searchSchedules.splice(index, 1);
            }, 500);
            Channel.toggleFavorite(schedule.channel.id, schedule.geo_state, schedule.name, schedule);
            $scope.schedules.push({
                channel_id: schedule.channel.id,
                geo_state: schedule.geo_state,
                status: "A",
                user_id: user.id,
                schedule_name: schedule.name,
                show_schedule: schedule
            });
            Analytics.trackEvent('Favorite', 'add_favorite');
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
