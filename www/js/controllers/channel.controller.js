(function() {
    'use strict';
    angular.module('zaptv').controller('ChannelCtrl', ChannelCtrl);

    function ChannelCtrl($scope, $ionicScrollDelegate, $ionicActionSheet, $cordovaInAppBrowser,
        $timeout, $interval, $ionicPopover, moment, State, Socket, Channel, Auth) {

        $ionicPopover.fromTemplateUrl('channel_popover', {
            scope: $scope
        }).then(function(popover) {
            $scope.popover = popover;
        });

        $scope.currentScore = 0;
        $scope.minutesRemain = null;
        $scope.userId = Auth.getUserId();
        $scope.channel = State.get('last_channel');

        $scope.$on('$ionicView.leave', function() {
            if ($scope.timeout) {
                $timeout.cancel($scope.timeout);
            }

            if($scope.interval) {
                $interval.cancel($scope.interval);
            }
        });

        var token = Auth.getToken();
        $scope.currentMessage = '';
        $scope.messages = [];

        Socket.connect();
        Socket.joinChannel($scope.channel.id);

        State.set('last_channel', $scope.channel.id);

        function updateChat() {
            Channel.getInfo($scope.channel.id, State.get('geo_state')).then(function(schedule) {
                $scope.schedule = schedule;
                Channel.getMyLastScore($scope.channel.id, schedule.id).then(function(scoreResult) {
                    $scope.currentScore = scoreResult.score;
                });
            });

            Channel.getNextSchedule($scope.channel.id, State.get('geo_state')).then(function(nextSchedule) {
                $scope.nextSchedule = nextSchedule;
                var now = moment().toDate();
                var nextScheduleStart = moment(nextSchedule.start_time).toDate();
                var diff = nextScheduleStart.getTime() - now.getTime();

                $scope.minutesRemain = Math.ceil((diff / (1000 * 60)));
                $scope.interval = $interval(function() {
                    $scope.minutesRemain -=1;
                }, 1000 * 60);
                $scope.timeout = $timeout(updateChat, diff);
            });
        }
        updateChat();

        Channel.lastMessages($scope.channel.id).then(function(messages) {
            $scope.messages = messages.reverse();
            $ionicScrollDelegate.$getByHandle('chat-scroll').scrollBottom(true);
        });

        Socket.onMessage(function(msg) {
            $scope.messages.push(msg);
            $timeout(function() {
                $ionicScrollDelegate.$getByHandle('chat-scroll').scrollBottom(true);
            });
        });

        $scope.openLink = function(url) {
            $cordovaInAppBrowser.open(url, '_blank', {
                    location: 'yes',
                    clearcache: 'yes',
                    toolbar: 'yes',
                    closebuttoncaption: 'Fechar'
                })
                .then(function(event) {
                    // success
                })
                .catch(function(event) {
                    // error
                });
        };

        $scope.submitMessage = function(currentMessage) {
            var info = {
                message: currentMessage,
                token: token,
                channel_id: $scope.channel.id
            };

            Socket.sendMessage(info);
            $scope.currentMessage = '';
        };

        $scope.setScore =  function(val) {
            $scope.currentScore = val;
            if($scope.currentScore > 0) {
                Socket.emitScore({
                    token: token,
                    score: $scope.currentScore,
                    schedule_id: $scope.schedule.id
                });
            }
        };

        $scope.openPopover = function($event) {
            $scope.popover.show($event);
        };

        $scope.closePopover = function() {
            $scope.popover.hide();
        };
    }
})();
