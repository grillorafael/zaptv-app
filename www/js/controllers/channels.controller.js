(function() {
    'use strict';
    angular.module('zaptv').controller('ChannelsCtrl', ChannelsCtrl);

    function ChannelsCtrl($scope, $state, $ionicPlatform, $cordovaGeolocation,
        $ionicPopover, $ionicHistory, $ionicTabsDelegate, $cordovaAppRate, Analytics,
        Auth, State, ReverseGeolocation, GeoInfo, Channel, Socket, Utils) {

        var geoState = null;
        var userId = Auth.getUserId();

        $scope.isLoading = true;
        $scope.evenChannels = [];
        $scope.oddChannels = [];

        $ionicPopover.fromTemplateUrl('channels_popover', {
            scope: $scope
        }).then(function(popover) {
            $scope.popover = popover;
        });

        Socket.connect();
        Socket.onGetStatus(function(info) {
            $scope.channelStatus = info;
        });

        $scope.$on('$ionicView.enter', function() {
            $ionicPlatform.ready(function() {
                Analytics.init(userId);
                Analytics.trackView($state.current.name);
            });
            Socket.leaveChannel();
        });


        $scope.$on('$ionicView.loaded', function() {
            $ionicPlatform.ready(function() {
                initGeolocation();
            });
        });

        function askRating() {
            if(window.cordova !== undefined) {
                $cordovaAppRate.promptForRating().then(function(result) {});
            }
        }

        function initGeolocation() {
            $cordovaGeolocation
                .getCurrentPosition({
                    timeout: 10000,
                    enableHighAccuracy: false
                })
                .then(function(position) {
                    var lat = position.coords.latitude;
                    var lng = position.coords.longitude;
                    Utils.getCurrentState([lat, lng]).then(function(state) {
                        State.set('geo_state', state);
                        listChannels(state);
                    }, function() {
                        // TODO Better handle when can't get location info
                        listChannels();
                    });
                }, function(err) {
                    // TODO Better handle when position is not available
                    listChannels();
                });
        }

        function listChannels(gs) {
            Channel.list(gs).then(function(channels) {
                var openChannels = [];
                var privateChannels = [];

                channels.forEach(function(c) {
                    if (c.is_private) {
                        privateChannels.push(c);
                    } else {
                        openChannels.push(c);
                    }
                });

                Channel.saveChannelsCache(openChannels, privateChannels);
                $scope.openChannels = openChannels;
                $scope.privateChannels = privateChannels;
                $scope.$broadcast('scroll.refreshComplete');
                Socket.getStatus();
                $scope.isLoading = false;
                askRating();
            }, function() {
                Channel.getChannelsCache().then(function(obj) {
                    if (obj && obj.open_channels) {
                        $scope.openChannels = obj.open_channels;
                        $scope.privateChannels = obj.private_channels;
                    }
                }).finally(function() {
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.isLoading = false;
                });
            });
        }

        $scope.goToTab = function(i) {
            $ionicTabsDelegate.select(i);
        };

        $scope.goToProfile = function() {
            $scope.popover.hide();
            $state.go('profile');
        };

        $scope.refresh = function() {
            listChannels(geoState);
            $scope.popover.hide();
        };

        $scope.rateApp = function() {
            $cordovaAppRate.navigateToAppStore().then(function(result) {});
            $scope.popover.hide();
        };

        $scope.logout = function() {
            Auth.clear();
            $ionicHistory.nextViewOptions({
                disableBack: true,
                historyRoot: true
            });
            $scope.popover.hide();
            $state.go('login');
        };

        $scope.openPopover = function($event) {
            $scope.popover.show($event);
        };

        $scope.closePopover = function() {
            $scope.popover.hide();
        };

        $scope.joinChannel = function(channel) {
            State.set('last_channel', channel);
            $state.go('channel');
        };
    }
})();
