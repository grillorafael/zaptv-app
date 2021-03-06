(function() {
    'use strict';
    angular.module('zaptv').controller('ChannelCtrl', ChannelCtrl);

    function ChannelCtrl($scope, $ionicScrollDelegate, $ionicActionSheet, $cordovaFacebook,
        $cordovaInAppBrowser, $timeout, $interval, $ionicPopover, $ionicPopup, $cordovaDevice,
        $ionicPlatform, $ionicModal, $state, $localForage, $cordovaSocialSharing, $location, $filter,
        $animationTrigger, $cordovaVibration, Utils, Analytics, moment, State, Socket, Channel, Auth) {

        var userColors = {};
        var footerBar; // gets set in $ionicView.enter
        var scroller;
        var txtInput; // ^^^
        var token = Auth.getToken();
        var cfg;

        $scope.currentMessage = '';
        $scope.messages = [];
        // BEG Loaders
        $scope.isLoadingFullSchedule = true;
        $scope.isLoadingChat = true;
        $scope.isLoadingNextSchedule = true;
        // END Loaders
        // BEG Handlers
        $scope.fetchMoreMessagesError = false;
        $scope.loadMessagesError = false;
        $scope.fullScheduleError = false;
        $scope.nextScheduleError = false;
        // END Handlers
        $scope.user = Auth.getUser();
        $scope.channel = State.get('last_channel');
        $scope.currentScore = 0;
        $scope.minutesRemain = null;
        $scope.genders = {
            'm': 'Masculino',
            'f': 'Feminino',
            'o': 'Outros',
            'n': 'Não Informado',
        };

        $ionicPlatform.ready(function() {
            if (window.cordova) {
                if (ionic.Platform.isIOS()) {
                    cordova.plugins.Keyboard.disableScroll(true);
                }

                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }

                Analytics.init($scope.user.id);
                Analytics.trackView($state.current.name + '_' + $scope.channel.name);
            }
        });

        window.addEventListener('native.keyboardshow', function() {
            $ionicScrollDelegate.$getByHandle('chat-scroll').scrollBottom();
        });

        window.addEventListener('native.keyboardhide', function() {
            $ionicScrollDelegate.$getByHandle('chat-scroll').resize();
        });

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

        $ionicPopover.fromTemplateUrl('channel_popover', {
            scope: $scope
        }).then(function(popover) {
            $scope.popover = popover;
        });

        $scope.$on('$ionicView.enter', function() {
            $localForage.getItem('config').then(function(config) {
                if(!config) {
                    config = {
                        facebook_share_enable: true,
                        twaper_enable: true
                    };
                }

                cfg = config;
                $scope.schedule = $scope.channel.current_schedule;
                Channel.getMyLastScore($scope.channel.id, $scope.schedule.id).then(function(scoreResult) {
                    $scope.currentScore = scoreResult.score;
                });

                Channel.lastMessages($scope.channel.id, config.twaper_enable).then(function(messages) {
                    messages.forEach(function(m) {
                        var content = m.content || m.payload.content;
                        m.compiled_content = $filter('smartchat')(content);
                        listenToMessage(m);
                        m.created_at = moment(m.created_at).toDate();
                    });
                    $scope.messages = messages.reverse();
                    $scope.isLoadingChat = false;
                    $timeout(function() {
                        $ionicScrollDelegate.$getByHandle('chat-scroll').scrollBottom();
                    });
                }, function(e) {
                    // Não foi possível pegar as mensagens no server
                });

                loadNextSchedule(true);

                // ElasticTextArea stuff
                footerBar = document.body.querySelector('.chat-view .bar-footer');
                scroller = document.body.querySelector('.chat-view .scroll-content');
                txtInput = angular.element(footerBar.querySelector('textarea'));
            });
        });

        $scope.$on('$ionicView.leave', function() {
            if ($scope.timeout) {
                $timeout.cancel($scope.timeout);
            }

            if ($scope.interval) {
                $interval.cancel($scope.interval);
            }
        });

        $scope.$on('elastic:resize', function(e, ta) {
            if (!ta) return;
            var taHeight = ta[0].offsetHeight;
            if (!footerBar) return;

            var newFooterHeight = taHeight + 10;
            newFooterHeight = (newFooterHeight > 44) ? newFooterHeight : 44;

            footerBar.style.height = newFooterHeight + 'px';
            scroller.style.bottom = newFooterHeight + 'px';
        });

        Socket.connect();
        Socket.joinChannel({
            id: $scope.channel.id,
            geo_state: State.get('geo_state')
        });

        Socket.onMessage(function(msg) {
            if(!cfg.twaper_enable && msg.payload) {
                return;
            }

            var content = msg.content || msg.payload.content;
            msg.compiled_content = $filter('smartchat')(content);
            listenToMessage(msg);
            msg.created_at = moment(msg.created_at).toDate();
            if (msg.user.id === $scope.user.id) {
                var foundId = false;
                $scope.messages.forEach(function(m, i) {
                    if (m.user.id === $scope.user.id && !m.id) {
                        foundId = true;
                        m.id = msg.id;
                    }
                });

                if(!foundId) {
                    $scope.messages.push(msg);
                }
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

        function listenToMessage(msg) {
            if (!msg.payload) {
                Socket.listenToMessage(msg.id);
            }
        }

        function loadNextSchedule(force) {
            if (!$scope.nextScheduleError && !force) {
                return;
            }

            $scope.isLoadingNextSchedule = true;
            $scope.nextScheduleError = false;

            Channel.getNextSchedule($scope.channel.id, State.get('geo_state')).then(function(nextSchedule) {
                $scope.nextSchedule = nextSchedule;

                var now = moment().toDate();
                var nextScheduleStart = moment(nextSchedule.start_time).toDate();
                var diff = nextScheduleStart.getTime() - now.getTime() + 10000;

                $scope.minutesRemain = Math.ceil((diff / (1000 * 60)));
                $scope.interval = $interval(function() {
                    $scope.minutesRemain -= 1;
                }, 1000 * 60);

                $scope.timeout = $timeout(function() {
                    $scope.messages.push({
                        created_at: new Date(),
                        id: 0,
                        user: {
                            id: 1
                        },
                        payload: {
                            type: 'DIVIDER',
                            content: 'No ar ' + $scope.nextSchedule.name
                        }
                    });
                    $scope.schedule = $scope.nextSchedule;
                    loadNextSchedule(true);
                    if ($scope.fullSchedule) {
                        $scope.fullSchedule.shift();
                    }

                    $timeout(function() {
                        $ionicScrollDelegate.$getByHandle('chat-scroll').scrollBottom();
                    });
                }, diff);
                $scope.isLoadingNextSchedule = false;
                $scope.nextScheduleError = false;
            }, function(e) {
                // TODO Handle
                $timeout(function() {
                    $scope.isLoadingNextSchedule = false;
                    $scope.nextScheduleError = true;
                });
            });
        }

        function loadFullSchedule() {
            $scope.isLoadingFullSchedule = true;
            $scope.fullScheduleError = false;
            Channel.getFullSchedule($scope.channel.id, State.get('geo_state')).then(function(fullSchedule) {
                fullSchedule.forEach(function(sc) {
                    var mmDt = moment(sc.start_time);
                    sc.start_time = mmDt.toDate();
                });
                $scope.fullSchedule = fullSchedule;

                $scope.isLoadingFullSchedule = false;
                $scope.fullScheduleError = false;
            }, function(e) {
                $scope.isLoadingFullSchedule = false;
                $scope.fullScheduleError = true;
            });
        }

        function displayFacebookPopup(accessToken, val, scheduleId) {
            $ionicPopup.show({
                template: '<div class="text-center">Deseja compartilhar suas notas para seus amigos via Facebook?</div>',
                title: 'Compartilhar pelo Facebook',
                scope: $scope,
                buttons: [{
                    text: 'Agora não',
                    type: 'btn-font-size',
                    onTap: function() {
                        $localForage.setItem('always_share', false);
                    }
                }, {
                    text: 'Só desta vez',
                    type: 'btn-font-size',
                    onTap: function() {
                        shareScore(accessToken, val, scheduleId);
                        $localForage.setItem('always_share', false);
                    }
                }, {
                    text: 'Sim',
                    type: 'btn-zaper-green',
                    onTap: function() {
                        $localForage.setItem('always_share', true);
                    }
                }]
            }).then(function(res) {});
        }

        $scope.loadNextSchedule = loadNextSchedule;
        $scope.loadFullSchedule = loadFullSchedule;

        $scope.viewUser = function(u) {
            $scope.userToView = u;
            $scope.viewUserModal.show();
            Analytics.trackEvent('Chat', 'view_user');
        };

        $scope.closeModal = function() {
            $scope.viewUserModal.hide();
        };

        $scope.viewSchedule = function() {
            $scope.popover.hide();
            $scope.viewScheduleModal.show().then(function() {
                if (!$scope.fullSchedule) {
                    loadFullSchedule();
                }
            });
            Analytics.trackEvent('Chat', 'view_schedules');
        };

        $scope.closeScheduleModal = function() {
            $scope.viewScheduleModal.hide();
        };

        $scope.toggleLike = function(message) {
            message.liked = !message.liked;
            $animationTrigger.trigger(
                'message-' + message.id,
                'popout',
                message.liked ? $animationTrigger.START : $animationTrigger.STOP
            );

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
            $scope.fetchMoreMessagesError = false;
            var beforeId = $scope.messages[0].id;
            Channel.fetchMore($scope.channel.id, beforeId, cfg.twaper_enable).then(function(messages) {
                if(messages.length > 0) {
                    var scrollToId = messages[0].id;
                    messages = messages.reverse();
                    messages.forEach(function(m) {
                        listenToMessage(m);
                        var content = m.content || m.payload.content;
                        m.compiled_content = $filter('smartchat')(content);
                        m.created_at = moment(m.created_at).toDate();
                    });
                    messages.push({
                        created_at: moment().toDate(),
                        id: -1,
                        user: {
                            id: 1
                        },
                        payload: {
                            type: 'DIVIDER',
                            content: '↑ Mensagens anteriores ↑'
                        }
                    });
                    window.location.replace('#/channel#message-' + scrollToId);
                    $scope.messages = messages.concat($scope.messages);
                    $timeout(function() {
                        $ionicScrollDelegate.$getByHandle('chat-scroll').anchorScroll();
                    });
                }
            }, function() {
                // TODO handle this shiet
                $scope.fetchMoreMessagesError = true;
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
                compiled_content: $filter('smartchat')(currentMessage),
                created_at: new Date()
            });

            Socket.sendMessage(info);
            $scope.currentMessage = '';
            $timeout(function() {
                $ionicScrollDelegate.$getByHandle('chat-scroll').scrollBottom();
            });
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

                // if (window.cordova) {
                //     $cordovaFacebook.getLoginStatus()
                //         .then(function(success) {
                //             if (success.status === "connected") {
                //                 if(cfg.facebook_share_enable) {
                //                     $localForage.getItem('always_share').then(function(alwaysShare) {
                //                         if (alwaysShare) {
                //                             shareScore(success.authResponse.accessToken, val, $scope.schedule.id);
                //                         } else if (cfg.facebook_share_enable) {
                //                             displayFacebookPopup(success.authResponse.accessToken, val, $scope.schedule.id);
                //                         }
                //                     });
                //                 }
                //             }
                //         }, function(error) {
                //             // error
                //         });
                // }
            }
        };

        $scope.messageOptions = function(message) {
            if(window.cordova) {
                $cordovaVibration.vibrate(50);
            }
            Analytics.trackEvent('Chat', 'message_options');
            $ionicActionSheet.show({
                buttons: [{
                    text: '<i class="icon ion-ios-browsers-outline"></i> Copiar mensagem'
                }, {
                    text: '<i class="icon ion-android-share-alt"></i> Compartilhar mensagem'
                }],
                destructiveText: '<i class="icon ion-android-alert"></i> Denunciar',
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
                    var decodedContent = Utils.decodeStr(message.content);
                    if (index === 0) {
                        Utils.copyToClipboard(decodedContent);
                    } else if (index === 1) {
                        var messageTxt = "@" + message.user.username + ": \"" + decodedContent + "\" - Assistindo " + $scope.schedule.name + " no zaper";
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

        $scope.toggleFavorite = function (schedule) {
            schedule.is_favorite = !schedule.is_favorite;
            if($scope.fullSchedule) {
                $scope.fullSchedule.forEach(function(s) {
                    if(s.name == schedule.name) {
                        s.is_favorite = schedule.is_favorite;
                    }
                });
            }
            Channel.toggleFavorite($scope.channel.id, schedule.geo_state, schedule.name, schedule);
        };

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
