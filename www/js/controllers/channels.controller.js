(function() {
    'use strict';
    angular.module('zaptv').controller('ChannelsCtrl', ChannelsCtrl);

    function ChannelsCtrl($scope, $state, $ionicPlatform, $cordovaGeolocation,
        $ionicPopover, $ionicHistory, $ionicTabsDelegate, Analytics, Auth, State,
        ReverseGeolocation, GeoInfo, Channel, Socket) {
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

        $scope.$on('$ionicView.enter', function() {
            Analytics.init(userId);
            Analytics.trackView('channels');
            var lastChannel = State.get('last_channel');
            if (lastChannel !== undefined) {
                Socket.leaveChannel(lastChannel.id);
            }
        });


        $scope.$on('$ionicView.loaded', function() {
            $ionicPlatform.ready(function() {
                initGeolocation();
            });
        });

        function initGeolocation() {
            $cordovaGeolocation
                .getCurrentPosition({
                    timeout: 10000,
                    enableHighAccuracy: false
                })
                .then(function(position) {
                    var lat = position.coords.latitude;
                    var lng = position.coords.longitude;
                    ReverseGeolocation.get(lat, lng).then(function(locationInfo) {
                        geoState = GeoInfo[locationInfo.address.country_code][locationInfo.address.county];
                        State.set('geo_state', geoState);
                        listChannels(geoState);
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
            $scope.isLoading = true;
            Channel.list(gs).then(function(channels) {
                var openChannels = [];
                var privateChannels = [];

                channels.forEach(function(c) {
                    if(c.is_private) {
                        privateChannels.push(c);
                    }
                    else {
                        openChannels.push(c);
                    }
                });

                $scope.openChannels = openChannels;
                $scope.privateChannels = privateChannels;
            }, function() {
                // TODO Handle
            }).finally(function() {
                $scope.$broadcast('scroll.refreshComplete');
                $scope.isLoading = false;
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
            Socket.joinChannel(channel.id);
            $state.go('channel');
        };
    }
})();
