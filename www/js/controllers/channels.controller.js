(function() {
    'use strict';
    angular.module('zaptv').controller('ChannelsCtrl', ChannelsCtrl);

    function ChannelsCtrl($scope, $state, $ionicPlatform, $cordovaGeolocation,
        $ionicPopover, $ionicHistory, $ionicTabsDelegate, $cordovaAppRate, $animationTrigger,
        $localForage, $cordovaAppVersion, $cordovaSocialSharing, Analytics, Auth, State,
        ReverseGeolocation, GeoInfo, Channel, Socket, Utils) {

        var appVersion = null;
        var geoState = null;
        var userId = Auth.getUserId();

        $scope.isLoading = true;
        $scope.evenChannels = [];
        $scope.oddChannels = [];

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
            });
            Socket.leaveChannel();
        });


        $scope.$on('$ionicView.loaded', function() {
            $ionicPlatform.ready(function() {
                initGeolocation();
            });
        });

        function askRating() {
            if(!window.cordova) {
                return;
            }

            $cordovaAppVersion.getAppVersion().then(function(version) {
                appVersion = version;
                if(appVersion !== null) {
                    var key = 'rate_ask_' + appVersion;
                    $localForage.getItem(key).then(function(rateAsk) {
                        if(rateAsk === 'NOT_ASK') {
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
                $scope.openChannels = openChannels;
                $scope.privateChannels = privateChannels;
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
            if(appVersion) {
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
            if(appVersion) {
                $localForage.setItem('rate_ask_' + appVersion, 'NOT_ASK');
            }
        };

        $scope.noThanks = function() {
            if(appVersion) {
                $localForage.setItem('rate_ask_' + appVersion, 'NOT_ASK');
            }
            $animationTrigger.trigger('rating-box', 'slide-up', $animationTrigger.STOP);
        };

        $scope.logout = function() {
            Auth.clear();
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
