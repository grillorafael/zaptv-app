(function() {
    'use strict';
    angular.module('zaptv').controller('ChannelCtrl', ChannelCtrl);

    function ChannelCtrl($scope, $stateParams, $ionicScrollDelegate, $ionicActionSheet,
        State, Socket, Channel, Auth) {
        var token = Auth.getToken();
        $scope.currentMessage = '';
        $scope.messages = [];

        Socket.connect();
        Socket.joinChannel($stateParams.id);

        State.set('last_channel', $stateParams.id);

        Channel.getInfo($stateParams.id).then(function(schedule) {
            $scope.schedule = schedule;
        });

        Channel.lastMessages($stateParams.id, State.get('geo_state')).then(function(messages) {
            $scope.messages = messages.reverse();
            $ionicScrollDelegate.scrollBottom(true);
        });

        Socket.onMessage(function(msg) {
            $scope.messages.push(msg);
            $ionicScrollDelegate.scrollBottom(true);
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

        $scope.messageOptions = function(message) {
            console.log(message);
            $ionicActionSheet.show({
                buttons: [{
                    text: '<b>Share</b> This'
                }, {
                    text: 'Move'
                }],
                destructiveText: 'Delete',
                titleText: 'Modify your album',
                cancelText: 'Cancel',
                cancel: function() {
                    // add cancel code..
                },
                buttonClicked: function(index) {
                    return true;
                }
            });
        };
    }
})();
