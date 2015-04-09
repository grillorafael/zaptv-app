(function() {
    'use strict';
    angular.module('zaptv').controller('ChannelsCtrl', ChannelsCtrl);

    function ChannelsCtrl($scope, $state, Channel, Socket) {
        Socket.connect();

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
