(function() {
    'use strict';
    angular.module('zaptv.services', [])
        .factory('User', User)
        .factory('Channel', Channel)
        .factory('Socket', Socket)
        .factory('Auth', Auth)
        .factory('$animationTrigger', $animationTrigger)
        .factory('ReverseGeolocation', ReverseGeolocation)
        .factory('State', State)
        .value('Config', {
            'ENDPOINT': 'http://104.236.227.193/api',
            'SOCKET_ADDR': 'http://104.236.227.193:8080'
        });

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
            getUserId: function () {
                return localStorage.getItem('user_id');
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

        return {
            register: register,
            login: login,
            changePicture: changePicture,
            me: me
        };
    }

    function Channel($http, $q, Config, Auth) {
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

        return {
            list: list,
            getInfo: getInfo,
            lastMessages: lastMessages,
            getNextSchedule: getNextSchedule,
            getMyLastScore: getMyLastScore
        };
    }

    function Socket($q, Config) {
        var currentChannel = null;
        var socket = null;

        function connect() {
            socket = io(Config.SOCKET_ADDR);
        }

        function joinChannel(id) {
            currentChannel = id;
            socket.emit('join channel', id);
        }

        function leaveChannel(id) {
            if(id === undefined && currentChannel === null) {
                return;
            }
            else {
                socket.emit('leave channel', id || currentChannel);
            }
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

        return {
            connect: connect,
            joinChannel: joinChannel,
            leaveChannel: leaveChannel,
            onMessage: onMessage,
            sendMessage: sendMessage,
            emitScore: emitScore
        };
    }
})();
