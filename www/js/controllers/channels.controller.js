(function() {
    'use strict';
    angular.module('zaptv').controller('ChannelsCtrl', ChannelsCtrl);

    function ChannelsCtrl($scope, $state, Channel, Socket) {
        Socket.connect();

        var lastChannel = Channel.getLastChannel();
        if(lastChannel !== null) {
            Socket.leaveChannel(lastChannel);
        }

        Channel.list().then(function(channels) {
            $scope.channels = channels;
        }, function() {
            // TODO Handle
        });

        $scope.joinChannel = function(channel) {
            Socket.joinChannel(channel.id);
            $state.go('channel', {
                id: channel.id
            });
        };
    }
})();
