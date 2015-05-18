(function() {
    'use strict';
    angular.module('zaptv').controller('ChannelCtrl', ChannelCtrl);

    function ChannelCtrl($scope, $ionicScrollDelegate, $ionicActionSheet,
        $cordovaInAppBrowser, $timeout, $interval, $ionicPopover, $cordovaDevice,
        $ionicPlatform, $ionicModal, Utils, Analytics, moment, State, Socket,
        Channel, Auth) {

        window.addEventListener('native.keyboardshow', function() {
            $ionicScrollDelegate.$getByHandle('chat-scroll').scrollBottom();
        });

        $scope.genders = {
            'm': 'Masculino',
            'f': 'Feminino',
            'o': 'Outros',
            'n': 'Não Informado',
        };

        $ionicModal.fromTemplateUrl('templates/view_user_modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.viewUserModal = modal;
        });

        $ionicModal.fromTemplateUrl('templates/full_schedule_modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.viewScheduleModal = modal;
        });

        $scope.viewUser = function(u) {
            $scope.userToView = u;
            $scope.viewUserModal.show();
        };

        $scope.closeModal = function() {
            $scope.viewUserModal.hide();
        };

        $scope.viewSchedule = function() {
            $scope.viewScheduleModal.show();
        };

        $scope.closeScheduleModal = function() {
            $scope.viewScheduleModal.hide();
        };

        $ionicPlatform.ready(function() {
            if (!window.cordova) {
                return;
            }

            if (ionic.Platform.isIOS()) {
                cordova.plugins.Keyboard.disableScroll(true);
            }
        });

        var userColors = {};

        $ionicPopover.fromTemplateUrl('channel_popover', {
            scope: $scope
        }).then(function(popover) {
            $scope.popover = popover;
        });

        $scope.user = Auth.getUser();
        $scope.channel = State.get('last_channel');

        Analytics.init($scope.user.id);
        Analytics.trackView('channel_chat_' + $scope.channel.id);

        $scope.currentScore = 0;
        $scope.minutesRemain = null;

        var footerBar; // gets set in $ionicView.enter
        var scroller;
        var txtInput; // ^^^

        $scope.$on('$ionicView.enter', function() {
            updateChat();
            Channel.lastMessages($scope.channel.id).then(function(messages) {
                messages.forEach(function(m) {
                    m.created_at = moment(m.created_at).toDate();
                });
                $scope.messages = messages.reverse();
                $ionicScrollDelegate.$getByHandle('chat-scroll').scrollBottom();
            });

            footerBar = document.body.querySelector('.chat-view .bar-footer');
            scroller = document.body.querySelector('.chat-view .scroll-content');
            txtInput = angular.element(footerBar.querySelector('textarea'));
        });

        $scope.$on('$ionicView.leave', function() {
            if ($scope.timeout) {
                $timeout.cancel($scope.timeout);
            }

            if ($scope.interval) {
                $interval.cancel($scope.interval);
            }
        });

        var token = Auth.getToken();
        $scope.currentMessage = '';
        $scope.messages = [];

        Socket.connect();
        Socket.joinChannel({
            id: $scope.channel.id,
            geo_state: State.get('geo_state')
        });

        function updateChat() {
            Channel.getInfo($scope.channel.id, State.get('geo_state')).then(function(schedule) {
                $scope.schedule = schedule;
                Channel.getMyLastScore($scope.channel.id, schedule.id).then(function(scoreResult) {
                    $scope.currentScore = scoreResult.score;
                });
            }, function(e) {
                // TODO Handle
            });

            Channel.getNextSchedule($scope.channel.id, State.get('geo_state')).then(function(nextSchedule) {
                $scope.nextSchedule = nextSchedule;
                var now = moment().toDate();
                var nextScheduleStart = moment(nextSchedule.start_time).toDate();
                var diff = nextScheduleStart.getTime() - now.getTime();

                $scope.minutesRemain = Math.ceil((diff / (1000 * 60)));
                $scope.interval = $interval(function() {
                    $scope.minutesRemain -= 1;
                }, 1000 * 60);
                $scope.timeout = $timeout(updateChat, diff);
            }, function(e) {
                // TODO Handle
            });

            Channel.getFullSchedule($scope.channel.id, State.get('geo_state')).then(function(fullSchedule) {
                fullSchedule.forEach(function(sc) {
                    var mmDt = moment(sc.start_time);
                    sc.start_time = mmDt.toDate();
                });
                $scope.fullSchedule = fullSchedule;
            }, function(e) {
                // TODO Handle
            });
        }

        Socket.onMessage(function(msg) {
            msg.created_at = moment(msg.created_at).toDate();
            if (msg.user.id === $scope.user.id) {
                var msgIdx = null;
                $scope.messages.forEach(function(m, i) {
                    if (m.user.id === $scope.user.id && m.id === undefined) {
                        msgIdx = i;
                    }
                });
                $scope.messages[msgIdx] = msg;
            } else {
                $scope.messages.push(msg);
            }

            $timeout(function() {
                $ionicScrollDelegate.$getByHandle('chat-scroll').scrollBottom();
            });
        });

        $scope.toggleLike = function(message) {
            message.liked = !message.liked;
            if (message.liked) {
                message.count_likes++;
            } else {
                message.count_likes--;
            }

            Socket.toggleLike({
                message_id: message.id,
                channel_id: $scope.channel.id,
                token: token
            });
        };

        $scope.loadBefore = function() {
            var beforeId = $scope.messages[0].id;
            Channel.fetchMore($scope.channel.id, beforeId).then(function(messages) {
                messages.forEach(function(m) {
                    m.created_at = moment(m.created_at).toDate();
                });
                messages = messages.reverse();
                $scope.messages = messages.concat($scope.messages);
            }, function() {
                // TODO handle this shiet
            })
            .finally(function() {
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        $scope.getUserColor = function(id) {
            if (userColors[id]) {
                return userColors[id];
            } else {
                userColors[id] = Utils.rndColor();
                return userColors[id];
            }
        };

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
            if (currentMessage === undefined || currentMessage.length === 0) {
                return;
            }

            var info = {
                message: currentMessage,
                token: token,
                channel_id: $scope.channel.id
            };

            $scope.messages.push({
                count_likes: 0,
                liked: false,
                user: $scope.user,
                content: currentMessage,
                created_at: new Date()
            });

            Socket.sendMessage(info);
            $scope.currentMessage = '';
            $ionicScrollDelegate.$getByHandle('chat-scroll').scrollBottom();
        };

        $scope.setScore = function(val) {
            $scope.currentScore = val;
            if ($scope.currentScore > 0) {
                Socket.emitScore({
                    token: token,
                    score: $scope.currentScore,
                    schedule_id: $scope.schedule.id
                });
            }
        };

        $scope.messageOptions = function(message) {
            $ionicActionSheet.show({
                buttons: [{
                    text: 'Copiar mensagem'
                }],
                destructiveText: 'Denunciar',
                titleText: '',
                cancelText: 'Voltar',
                destructiveButtonClicked: function() {
                    Channel.messageComplaint(message.id).then(function() {

                    }, function() {});
                    return true;
                },
                cancel: function() {

                },
                buttonClicked: function(index) {
                    if (index === 0) {
                        Utils.copyToClipboard(message.content);
                    }
                    return true;
                }
            });
        };

        $scope.openPopover = function($event) {
            $scope.popover.show($event);
        };

        $scope.closePopover = function() {
            $scope.popover.hide();
        };

        $scope.$on('elastic:resize', function(e, ta) {
            if (!ta) return;
            var taHeight = ta[0].offsetHeight;
            if (!footerBar) return;

            var newFooterHeight = taHeight + 10;
            newFooterHeight = (newFooterHeight > 44) ? newFooterHeight : 44;

            footerBar.style.height = newFooterHeight + 'px';
            scroller.style.bottom = newFooterHeight + 'px';
        });
    }
})();
