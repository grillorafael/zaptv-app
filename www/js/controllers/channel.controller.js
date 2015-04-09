(function() {
    'use strict';
    angular.module('zaptv').controller('ChannelCtrl', ChannelCtrl);

    function ChannelCtrl($scope, $stateParams, $ionicScrollDelegate, Socket, Channel, Auth) {
        var token = Auth.getToken();
        $scope.currentMessage = '';
        $scope.messages = [];

        Socket.connect();
        Socket.joinChannel($stateParams.id);

        Channel.getInfo($stateParams.id).then(function(schedule) {
            $scope.schedule = schedule;
        });

        Channel.lastMessages($stateParams.id).then(function(messages) {
            $scope.messages = messages;
            $ionicScrollDelegate.scrollBottom();
        });

        Socket.onMessage(function(msg) {
            $scope.messages.push(msg);
            $ionicScrollDelegate.scrollBottom();
        });

        $scope.submitMessage = function(currentMessage) {
            var info = {
                message: currentMessage,
                token: token,
                channel_id: $stateParams.id
            };

            Socket.sendMessage(info);
            $scope.currentMessage = '';
        };
    }
})();
