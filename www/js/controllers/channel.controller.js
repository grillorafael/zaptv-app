(function() {
    'use strict';
    angular.module('zaptv').controller('ChannelCtrl', ChannelCtrl);

    function ChannelCtrl($scope, $stateParams, $ionicScrollDelegate, $ionicActionSheet,
        $cordovaInAppBrowser, $timeout, $ionicPopup, $interval, $ionicPopover, moment,
        State, Socket, Channel, Auth) {
        $ionicPopover.fromTemplateUrl('channel_popover', {
            scope: $scope
        }).then(function(popover) {
            $scope.popover = popover;
        });

        $scope.currentScore = 0;
        $scope.minutesRemain = null;
        $scope.userId = Auth.getUserId();
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
        Socket.joinChannel($stateParams.id);

        State.set('last_channel', $stateParams.id);

        function updateChat() {
            Channel.getInfo($stateParams.id, State.get('geo_state')).then(function(schedule) {
                $scope.schedule = schedule;
                Channel.getMyLastScore($stateParams.id, schedule.id).then(function(scoreResult) {
                    $scope.currentScore = scoreResult.score;
                });
            });

            Channel.getNextSchedule($stateParams.id, State.get('geo_state')).then(function(nextSchedule) {
                $scope.nextSchedule = nextSchedule;
                var now = moment().toDate();
                var nextScheduleStart = moment(nextSchedule.start_time).toDate();
                var diff = nextScheduleStart.getTime() - now.getTime();

                $scope.minutesRemain = Math.ceil((diff / (1000 * 60)));
                $scope.interval = $interval(function() {
                    $scope.minutesRemain -=1;
                }, 1000 * 60);
                $scope.timeout = $timeout(changeSchedule, diff);
            });
        }
        updateChat();

        Channel.lastMessages($stateParams.id).then(function(messages) {
            $scope.messages = messages.reverse();
            $ionicScrollDelegate.scrollBottom(true);
        });

        Socket.onMessage(function(msg) {
            $scope.messages.push(msg);
            $timeout(function() {
                $ionicScrollDelegate.scrollBottom(true);
            });
        });

        function changeSchedule() {
            $scope.currentScore = 0;
            $ionicPopup.show({
                template: '<score ng-model="currentScore"></score>',
                title: 'Dê sua nota para o programa',
                subTitle: $scope.schedule.name,
                scope: $scope,
                buttons: [{
                    text: '<b>Fechar</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        updateChat();
                    }
                }]
            }).then(function() {});
        }

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
                channel_id: $stateParams.id
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
