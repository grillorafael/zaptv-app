(function() {
    'use strict';
    angular.module('zaptv').controller('ChannelCtrl', ChannelCtrl);

    function ChannelCtrl($scope, $ionicScrollDelegate, $ionicActionSheet, $cordovaFacebook,
        $cordovaInAppBrowser, $timeout, $interval, $ionicPopover, $ionicPopup, $cordovaDevice,
        $ionicPlatform, $ionicModal, $state, $localForage, $cordovaSocialSharing, Utils, Analytics,
        moment, State, Socket, Channel, Auth) {

        var shareWithFacebook = false;
        $localForage.getItem('facebook_share_enable').then(function(facebookShareEnable) {
            shareWithFacebook = facebookShareEnable;
        });

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
            Analytics.trackEvent('Chat', 'view_user');
        };

        $scope.closeModal = function() {
            $scope.viewUserModal.hide();
        };

        $scope.viewSchedule = function() {
            $scope.viewScheduleModal.show();
            Analytics.trackEvent('Chat', 'view_schedules');
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
        Analytics.trackView($state.current.name + '_' + $scope.channel.name);

        $scope.currentScore = 0;
        $scope.minutesRemain = null;

        var footerBar; // gets set in $ionicView.enter
        var scroller;
        var txtInput; // ^^^

        $scope.$on('$ionicView.enter', function() {
            $scope.isLoadingChat = true;
            updateChat();
            Channel.lastMessages($scope.channel.id).then(function(messages) {
                messages.forEach(function(m) {
                    listenToMessage(m);
                    m.created_at = moment(m.created_at).toDate();
                });
                $scope.messages = messages.reverse();
                $timeout(function() {
                    $ionicScrollDelegate.$getByHandle('chat-scroll').scrollBottom();
                }, 200);
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

        function listenToMessage(msg) {
            if (!msg.payload) {
                Socket.listenToMessage(msg.id);
            }
        }

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
                $scope.isLoadingChat = false;

                var now = moment().toDate();
                var nextScheduleStart = moment(nextSchedule.start_time).toDate();
                var diff = nextScheduleStart.getTime() - now.getTime() + 10000;

                $scope.minutesRemain = Math.ceil((diff / (1000 * 60)));
                $scope.interval = $interval(function() {
                    $scope.minutesRemain -= 1;
                }, 1000 * 60);

                $scope.timeout = $timeout(function() {
                    $scope.messages.push({
                        id: 0,
                        user: {
                            id: 1
                        },
                        payload: {
                            type: 'DIVIDER',
                            content: 'No ar ' + $scope.nextSchedule.name
                        }
                    });
                    $ionicScrollDelegate.$getByHandle('chat-scroll').scrollBottom();
                    updateChat();
                }, diff);
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
            listenToMessage(msg);
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

        Socket.onMessageUpdate(function(result) {
            var messageId = result.message_id;
            var countLikes = result.count_likes;

            $scope.messages.forEach(function(m) {
                if (m.id === messageId) {
                    $scope.$apply(function() {
                        m.count_likes = countLikes;
                    });
                }
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
            Analytics.trackEvent('Chat', 'load_before');
            var beforeId = $scope.messages[0].id;
            Channel.fetchMore($scope.channel.id, beforeId).then(function(messages) {
                    messages.forEach(function(m) {
                        listenToMessage(m);
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
            Analytics.trackEvent('Chat', 'open_link');
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
            Analytics.trackEvent('Chat', 'message_submit');
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
            Analytics.trackEvent('Chat', 'set_score');
            $scope.currentScore = val;
            if ($scope.currentScore > 0) {
                Socket.emitScore({
                    token: token,
                    score: $scope.currentScore,
                    schedule_id: $scope.schedule.id
                });

                if (window.cordova) {
                    $cordovaFacebook.getLoginStatus()
                        .then(function(success) {
                            if (success.status === "connected") {
                                $localForage.getItem('always_share').then(function(alwaysShare) {
                                    if (shareWithFacebook !== false || alwaysShare === undefined) {
                                        if (!alwaysShare) {
                                            $ionicPopup.show({
                                                template: '<div class="text-center">Deseja compartilhar suas notas para seus amigos via Facebook?</div>',
                                                title: 'Compartilhar pelo Facebook',
                                                scope: $scope,
                                                buttons: [{
                                                    text: 'Agora não',
                                                    type: 'bnt-font-size',
                                                    onTap: function() {
                                                        $localForage.setItem('always_share', false);
                                                    }
                                                }, {
                                                    text: 'Só desta vez',
                                                    type: 'bnt-font-size',
                                                    onTap: function() {
                                                        shareScore(success.authResponse.accessToken, val, $scope.schedule.id);
                                                        $localForage.setItem('always_share', false);
                                                    }
                                                }, {
                                                    text: 'Sim',
                                                    type: 'btn-zaper-green',
                                                    onTap: function() {
                                                        $localForage.setItem('always_share', true);
                                                        $localForage.setItem('facebook_share_enable', true);
                                                        shareWithFacebook = true;
                                                    }
                                                }]
                                            }).then(function(res) {});
                                        } else if (shareWithFacebook) {
                                            shareScore(success.authResponse.accessToken, val, $scope.schedule.id);
                                        }
                                    }
                                });
                            }
                        }, function(error) {
                            // error
                        });
                }
            }
        };

        $scope.messageOptions = function(message) {
            Analytics.trackEvent('Chat', 'message_options');
            $ionicActionSheet.show({
                buttons: [{
                    text: 'Copiar mensagem'
                }, {
                    text: 'Compartilhar mensagem'
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
                    } else if (index === 1) {
                        var messageTxt = "@" + message.user.username + ": \"" + message.content + "\" - Assistindo " + $scope.schedule.name + " no zaper";
                        $cordovaSocialSharing
                            .share(messageTxt, "zaper", null, "http://zaper.com.br")
                            .then(function(result) {}, function(err) {});
                    }
                    return true;
                }
            });
        };

        $scope.openPopover = function($event) {
            Analytics.trackEvent('Chat', 'open_popover');
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

        function shareScore(fbToken, rating, id) {
            var graph = "me/video.rate?access_token=:token:&rating:scale=5&rating:value=:rating:&video=:video:";
            graph = graph.replace(':token:', fbToken);
            graph = graph.replace(':rating:', rating);
            graph = graph.replace(':video:', 'http://api.zaper.com.br/api/meta/' + id);
            $cordovaFacebook.api(graph)
                .then(function(success) {}, function(error) {});
        }
    }
})();
