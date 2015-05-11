(function() {
    'use strict';
    angular.module('zaptv.services', [
        'ngCordova',
        'LocalForageModule'
    ])
        .factory('User', User)
        .factory('Channel', Channel)
        .factory('Socket', Socket)
        .factory('Auth', Auth)
        .factory('$animationTrigger', $animationTrigger)
        .factory('ReverseGeolocation', ReverseGeolocation)
        .factory('State', State)
        .factory('Analytics', Analytics)
        .factory('Utils', Utils)
        .value('Config', {
            'ENDPOINT': 'http://api.zaper.com.br/api',
            'SOCKET_ADDR': 'http://io.zaper.com.br',
            'ANALYTICS_UA': 'UA-62526664-1'
        });

    function Utils($cordovaClipboard) {
        return {
            rndColor: function() {
                return '#' + Math.floor(Math.random() * 16777215).toString(16);
            },
            copyToClipboard: function(txt) {
                if(!window.cordova) {
                    return;
                }

                $cordovaClipboard.copy(txt)
                    .then(function() {}, function() {});
            }
        };
    }

    function Analytics($cordovaGoogleAnalytics, Config) {
        return {
            init: function(userId) {
                if(!window.cordova) {
                    return;
                }
                // $cordovaGoogleAnalytics.debugMode();
                $cordovaGoogleAnalytics.startTrackerWithId(Config.ANALYTICS_UA);
                if(userId) {
                    $cordovaGoogleAnalytics.setUserId(userId);
                }
            },
            trackView: function(name) {
                if(!window.cordova) {
                    return;
                }
                $cordovaGoogleAnalytics.trackView(name);
            },
            trackEvent: function(category, action, label, value) {
                if(!window.cordova) {
                    return;
                }
                $cordovaGoogleAnalytics.trackEvent(category, action, label, value);
            }
        };
    }

    function State() {
        var states = {};
        return {
            set: function(key, value) {
                states[key] = value;
            },
            get: function(key) {
                return states[key];
            }
        };
    }

    function ReverseGeolocation($http, $q) {
        return {
            get: function(lat, lng) {
                var deferred = $q.defer();
                $http.get('http://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng + '&zoom=18&addressdetails=1')
                    .success(deferred.resolve)
                    .error(deferred.reject);
                return deferred.promise;
            }
        };
    }


    function $animationTrigger($rootScope, $timeout) {
        return {
            START: 1,
            STOP: 0,
            FROM_START: -1,
            trigger: function(handler, animation, mode) {
                $timeout(function() {
                    $rootScope.$broadcast('animation:trigger:' + handler, handler, animation, mode);
                });
            }
        };
    }

    function Auth() {
        return {
            clear: function() {
                localStorage.clear();
            },
            appendToken: function(url) {
                var token = localStorage.getItem('auth_token');
                return url + '?token=' + token;
            },
            getToken: function() {
                return localStorage.getItem('auth_token');
            },
            getUserId: function() {
                return localStorage.getItem('user_id');
            },
            setUser: function(user) {
                localStorage.setItem('user', user);
            },
            getUser: function() {
                return JSON.parse(localStorage.getItem('user'));
            }
        };
    }

    function User($http, $q, Config, Auth) {
        function register(info) {
            var deferred = $q.defer();

            $http.post(Config.ENDPOINT + '/register', info)
                .success(deferred.resolve)
                .error(deferred.reject);

            return deferred.promise;
        }

        function login(info) {
            var deferred = $q.defer();

            $http.post(Config.ENDPOINT + '/login', info)
                .success(deferred.resolve)
                .error(deferred.reject);

            return deferred.promise;
        }

        function changePicture(pictureData) {
            var deferred = $q.defer();

            $http.post(Auth.appendToken(Config.ENDPOINT + '/profile/me/avatar'), pictureData)
                .success(deferred.resolve)
                .error(deferred.reject);

            return deferred.promise;
        }

        function me() {
            var deferred = $q.defer();

            $http.get(Auth.appendToken(Config.ENDPOINT + '/profile/me'))
                .success(deferred.resolve)
                .error(deferred.reject);

            return deferred.promise;
        }

        function checkUsername(v) {
            var deferred = $q.defer();

            $http.get(Config.ENDPOINT + '/username/check/' + v)
                .success(deferred.resolve)
                .error(deferred.reject);

            return deferred.promise;
        }

        function getUserInfo(id) {
            var deferred = $q.defer();

            $http.get(Auth.appendToken(Config.ENDPOINT + '/profile/' + id))
                .success(deferred.resolve)
                .error(deferred.reject);

            return deferred.promise;
        }

        function update(info) {
            var deferred = $q.defer();

            $http.put(Auth.appendToken(Config.ENDPOINT + '/profile'), info)
                .success(deferred.resolve)
                .error(deferred.reject);

            return deferred.promise;
        }

        return {
            register: register,
            login: login,
            changePicture: changePicture,
            me: me,
            checkUsername: checkUsername,
            getUserInfo: getUserInfo,
            update: update
        };
    }

    function Channel($http, $q, $localForage, Config, Auth) {
        function list(geoState) {
            var deferred = $q.defer();

            var stateInfo = geoState === undefined ? "" : geoState;
            $http.get(Auth.appendToken(Config.ENDPOINT + '/channel/list/' + stateInfo))
                .success(deferred.resolve)
                .error(deferred.reject);

            return deferred.promise;
        }

        function getInfo(id, geoState) {
            var deferred = $q.defer();

            var stateInfo = geoState === undefined ? "" : geoState;
            $http.get(Auth.appendToken(Config.ENDPOINT + '/channel/' + id + '/current/' + stateInfo))
                .success(deferred.resolve)
                .error(deferred.reject);

            return deferred.promise;
        }

        function getNextSchedule(id, geoState) {
            var deferred = $q.defer();

            var stateInfo = geoState === undefined ? "" : geoState;
            $http.get(Auth.appendToken(Config.ENDPOINT + '/channel/' + id + '/next/' + stateInfo))
                .success(deferred.resolve)
                .error(deferred.reject);

            return deferred.promise;
        }

        function lastMessages(id) {
            var deferred = $q.defer();

            $http.get(Auth.appendToken(Config.ENDPOINT + '/channel/' + id + '/last'))
                .success(deferred.resolve)
                .error(deferred.reject);

            return deferred.promise;
        }

        function getMyLastScore(channelId, scheduleId) {
            var deferred = $q.defer();

            $http.get(Auth.appendToken(Config.ENDPOINT + '/channel/' + channelId + '/schedule/' + scheduleId + '/me/score'))
                .success(deferred.resolve)
                .error(deferred.reject);

            return deferred.promise;
        }

        function messageComplaint(messageId) {
            var deferred = $q.defer();

            $http.post(Auth.appendToken(Config.ENDPOINT + '/message/' + messageId + '/complaint'))
                .success(deferred.resolve)
                .error(deferred.reject);

            return deferred.promise;
        }

        function fetchMore(channelId, lastMessageId) {
            var deferred = $q.defer();

            $http.get(Auth.appendToken(Config.ENDPOINT + '/channel/' + channelId + '/more/' + lastMessageId))
                .success(deferred.resolve)
                .error(deferred.reject);

            return deferred.promise;
        }

        function saveChannelsCache(openChannels, privateChannels) {
            return $localForage.setItem('channels', {
                open_channels: openChannels,
                private_channels: privateChannels
            });
        }

        function getChannelsCache() {
            return $localForage.getItem('channels');
        }

        function getFullSchedule(id, geoState) {
            var deferred = $q.defer();

            var stateInfo = geoState === undefined ? "" : geoState;
            $http.get(Auth.appendToken(Config.ENDPOINT + '/channel/' + id + '/schedules/' + stateInfo))
                .success(deferred.resolve)
                .error(deferred.reject);

            return deferred.promise;
        }

        return {
            list: list,
            getInfo: getInfo,
            lastMessages: lastMessages,
            getNextSchedule: getNextSchedule,
            getMyLastScore: getMyLastScore,
            messageComplaint: messageComplaint,
            fetchMore: fetchMore,
            saveChannelsCache: saveChannelsCache,
            getChannelsCache: getChannelsCache,
            getFullSchedule: getFullSchedule
        };
    }

    function Socket($q, Config) {
        var socket = null;

        function connect() {
            socket = io(Config.SOCKET_ADDR);
        }

        function joinChannel(info) {
            socket.emit('join channel', info);
        }

        function leaveChannel(id) {
            socket.emit('leave channel');
        }

        function sendMessage(info) {
            socket.emit('device sent message', info);
        }

        function emitScore(info) {
            socket.emit('give schedule score', info);
        }

        function onMessage(fc) {
            socket.on('message to device', fc);
        }

        function getStatus() {
            socket.emit('get status');
        }

        function onGetStatus(fc) {
            socket.on('status response', fc);
        }

        return {
            connect: connect,
            joinChannel: joinChannel,
            leaveChannel: leaveChannel,
            onMessage: onMessage,
            sendMessage: sendMessage,
            emitScore: emitScore,
            getStatus: getStatus,
            onGetStatus: onGetStatus
        };
    }
})();
