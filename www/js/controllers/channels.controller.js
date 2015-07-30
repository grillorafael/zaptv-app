(function() {
    'use strict';
    angular.module('zaptv').controller('ChannelsCtrl', ChannelsCtrl);

    function ChannelsCtrl($scope, $state, $ionicPlatform, $cordovaGeolocation,
        $ionicPopover, $ionicHistory, $ionicTabsDelegate, $cordovaAppRate, $animationTrigger,
        $localForage, $cordovaAppVersion, $cordovaSocialSharing, $ionicPopup, Analytics,
        Auth, State, ReverseGeolocation, GeoInfo, Channel, Socket, Utils, User) {

        var appVersion = null;
        var geoState = null;
        var userId = Auth.getUserId();
        var firstLoad = true;

        $scope.isLoading = true;
        $scope.openChannels = [];
        $scope.privateChannels = [];
        $scope.user = Auth.getUser();
        $scope.data = {};

        $ionicPopover.fromTemplateUrl('channels_popover', {
            scope: $scope
        }).then(function(popover) {
            $scope.popover = popover;
        });

        Socket.connect();
        Socket.onGetStatus(function(info) {
            $scope.channelStatus = info;
        });

        $scope.$on('$ionicView.enter', function() {
            $ionicPlatform.ready(function() {
                Analytics.init(userId);
                Analytics.trackView($state.current.name);

                if (window.parsePlugin) {
                    parsePlugin.initialize("RcQLqd4pd9Hx4LqNV5nwEFey2rA1oVoefmMZP24Q", "89SWpicNJom2o8vTBAsETw0UFmYdtptP2mr8Ltnl", function() {
                        try {
                            parsePlugin.subscribe("user_" + $scope.user.id, function() {});
                        } catch (e) {}
                    }, function(e) {});
                }
            });

            if (!firstLoad) {
                listChannels(State.get('geo_state'));
            }

            Socket.leaveChannel();
            $scope.user = Auth.getUser();
        });


        $scope.$on('$ionicView.loaded', function() {
            $ionicPlatform.ready(function() {
                initGeolocation();
            });
        });

        function askRating() {
            if (!window.cordova) {
                return;
            }

            $cordovaAppVersion.getAppVersion().then(function(version) {
                appVersion = version;
                if (appVersion !== null) {
                    var key = 'rate_ask_' + appVersion;
                    $localForage.getItem(key).then(function(rateAsk) {
                        if (rateAsk === 'NOT_ASK') {
                            return;
                        }

                        if (!rateAsk) {
                            rateAsk = 0;
                            $localForage.setItem(key, rateAsk);
                        }

                        if (rateAsk >= 4) {
                            $animationTrigger.trigger('rating-box', 'slide-up', $animationTrigger.START);
                        } else {
                            rateAsk++;
                            $localForage.setItem(key, rateAsk);
                        }
                    });
                }
            });
        }

        function initGeolocation() {
            $cordovaGeolocation
                .getCurrentPosition({
                    timeout: 10000,
                    enableHighAccuracy: false
                })
                .then(function(position) {
                    var lat = position.coords.latitude;
                    var lng = position.coords.longitude;
                    Utils.getCurrentState([lat, lng]).then(function(state) {
                        geoState = state;
                        State.set('geo_state', state);
                        listChannels(state);
                    }, function() {
                        // TODO Better handle when can't get location info
                        listChannels();
                    });
                }, function(err) {
                    // TODO Better handle when position is not available
                    listChannels();
                });
        }

        function listChannels(gs) {
            firstLoad = false;
            Channel.list(gs).then(function(channels) {
                var openChannels = [];
                var privateChannels = [];

                channels.forEach(function(c) {
                    if (c.is_private) {
                        privateChannels.push(c);
                    } else {
                        openChannels.push(c);
                    }
                });

                Channel.saveChannelsCache(openChannels, privateChannels);
                if ($scope.openChannels.length === 0) {
                    $scope.openChannels = openChannels;
                    $scope.privateChannels = privateChannels;
                } else {
                    openChannels.forEach(function(oc, i) {
                        $scope.openChannels[i].current_schedule = oc.current_schedule;
                    });

                    privateChannels.forEach(function(pc, i) {
                        $scope.privateChannels[i].current_schedule = pc.current_schedule;
                    });
                }

                $scope.$broadcast('scroll.refreshComplete');
                Socket.getStatus();
                $scope.isLoading = false;
                askRating();
            }, function() {
                Channel.getChannelsCache().then(function(obj) {
                    if (obj && obj.open_channels) {
                        $scope.openChannels = obj.open_channels;
                        $scope.privateChannels = obj.private_channels;
                    }
                }).finally(function() {
                    $scope.$broadcast('scroll.refreshComplete');
                    $scope.isLoading = false;
                });
            });
        }

        $scope.hideRateBar = function() {
            if (appVersion) {
                $localForage.setItem('rate_ask_' + appVersion, 0);
            }
            $animationTrigger.trigger('rating-box', 'slide-up', $animationTrigger.STOP);
        };

        $scope.goToTab = function(i) {
            $ionicTabsDelegate.select(i);
        };

        $scope.goToProfile = function() {
            $scope.popover.hide();
            $state.go('profile');
        };

        $scope.goToFavorites = function() {
            $scope.popover.hide();
            $state.go('favorites');
        };

        $scope.refresh = function() {
            listChannels(geoState);
            $scope.popover.hide();
        };

        $scope.shareApp = function() {
            $cordovaSocialSharing
                .share("Estou conversando sobre meus programas favoritos no zaper!", "zaper", null, "http://zaper.com.br")
                .then(function(result) {}, function(err) {});
        };

        $scope.rateApp = function() {
            $cordovaAppRate.navigateToAppStore().then(function(result) {});
            $animationTrigger.trigger('rating-box', 'slide-up', $animationTrigger.STOP);
            $scope.popover.hide();
            if (appVersion) {
                $localForage.setItem('rate_ask_' + appVersion, 'NOT_ASK');
            }
        };

        $scope.sendSuggestion = function() {
            $scope.popover.hide();
            $ionicPopup.show({
                cssClass: 'suggestion-popup',
                templateUrl: 'templates/partials/suggestion_popup.html',
                title: 'Escreva sua sugestão!',
                subTitle: '',
                scope: $scope,
                buttons: [{
                    text: 'Voltar'
                }, {
                    text: '<b>Enviar</b>',
                    type: 'button-salmon',
                    onTap: function(e) {
                        console.log($scope.data.suggestion);
                        if($scope.data.suggestion && $scope.data.suggestion.length > 0) {
                            User.sendSuggestion($scope.data.suggestion).then(function (suggestion) {
                                console.log(suggestion);
                            });
                        }
                        // if()
                        // if (!$scope.data.wifi) {
                        //     //don't allow the user to close unless he enters wifi password
                        //     e.preventDefault();
                        // } else {
                        //     return $scope.data.wifi;
                        // }
                    }
                }]
            });
        };

        $scope.noThanks = function() {
            if (appVersion) {
                $localForage.setItem('rate_ask_' + appVersion, 'NOT_ASK');
            }
            $animationTrigger.trigger('rating-box', 'slide-up', $animationTrigger.STOP);
        };

        $scope.logout = function() {
            $ionicHistory.nextViewOptions({
                disableBack: true,
                historyRoot: true
            });
            $scope.popover.hide();
            $state.go('login');
        };

        $scope.openPopover = function($event) {
            $scope.popover.show($event);
        };

        $scope.closePopover = function() {
            $scope.popover.hide();
        };

        $scope.joinChannel = function(channel) {
            State.set('last_channel', channel);
            $state.go('channel');
        };
    }
})();
