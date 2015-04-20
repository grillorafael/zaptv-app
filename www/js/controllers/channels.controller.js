(function() {
    'use strict';
    angular.module('zaptv').controller('ChannelsCtrl', ChannelsCtrl);

    function ChannelsCtrl($scope, $state, $ionicPlatform, $cordovaGeolocation,
        $ionicPopover, $ionicHistory, Auth, State, ReverseGeolocation, GeoInfo, Channel, Socket) {
        $ionicPlatform.ready(function() {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
        });

        $ionicPopover.fromTemplateUrl('channels_popover', {
            scope: $scope
        }).then(function(popover) {
            $scope.popover = popover;
        });

        Socket.connect();

        $scope.$on('$ionicView.enter', function() {
            var lastChannel = State.get('last_channel');
            if (lastChannel !== undefined) {
                Socket.leaveChannel(lastChannel);
            }
        });

        $cordovaGeolocation
            .getCurrentPosition({
                timeout: 10000,
                enableHighAccuracy: false
            })
            .then(function(position) {
                var lat = position.coords.latitude;
                var lng = position.coords.longitude;
                ReverseGeolocation.get(lat, lng).then(function(locationInfo) {
                    var geoState = GeoInfo[locationInfo.address.country_code][locationInfo.address.county];
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


        function listChannels(geoState) {
            Channel.list(geoState).then(function(channels) {
                $scope.channels = channels;
            }, function() {
                // TODO Handle
            });
        }

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

        $scope.joinChannel = function(channel) {
            Socket.joinChannel(channel.id);
            $state.go('channel', {
                id: channel.id
            });
        };
    }
})();
