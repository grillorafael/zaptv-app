(function() {
    'use strict';
    angular.module('zaptv').controller('ChannelsCtrl', ChannelsCtrl);

    function ChannelsCtrl($scope, $state, $ionicPlatform, $cordovaGeolocation,
        State, ReverseGeolocation, GeoInfo, Channel, Socket) {
        $ionicPlatform.ready(function() {
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
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

        $scope.joinChannel = function(channel) {
            Socket.joinChannel(channel.id);
            $state.go('channel', {
                id: channel.id
            });
        };
    }
})();
