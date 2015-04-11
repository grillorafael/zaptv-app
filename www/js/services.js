(function() {
    'use strict';
    angular.module('zaptv.services', [])
        .factory('User', User)
        .factory('Channel', Channel)
        .factory('Socket', Socket)
        .factory('Auth', Auth)
        .value('Config', {
            'ENDPOINT': 'http://104.236.227.193/api',
            'SOCKET_ADDR': 'http://104.236.227.193'
        });

    function Auth() {
        return {
            appendToken: function(url) {
                var token = localStorage.getItem('auth_token');
                return url + '?token=' + token;
            },
            getToken: function() {
                return localStorage.getItem('auth_token');
            }
        };
    }

    function User($http, $q, Config) {
        function register() {

        }

        function login(info) {
            var deferred = $q.defer();

            $http.post(Config.ENDPOINT + '/login', info)
                .success(deferred.resolve)
                .error(deferred.reject);

            return deferred.promise;
        }

        return {
            register: register,
            login: login
        };
    }

    function Channel($http, $q, Config, Auth) {
        var lastChannel = null;

        function list() {
            var deferred = $q.defer();

            $http.get(Auth.appendToken(Config.ENDPOINT + '/channel/list'))
                .success(deferred.resolve)
                .error(deferred.reject);

            return deferred.promise;
        }

        function getInfo(id) {
            var deferred = $q.defer();

            $http.get(Auth.appendToken(Config.ENDPOINT + '/channel/' + id + '/current'))
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

        function setLastChannel(id) {
            lastChannel = id;
        }

        function getLastChannel() {
            return lastChannel;
        }

        return {
            list: list,
            getInfo: getInfo,
            lastMessages: lastMessages,
            setLastChannel: setLastChannel,
            getLastChannel: getLastChannel
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

        function onMessage(fc) {
            socket.on('message to device', fc);
        }

        function onChannelStatus(fc) {
            socket.on('channel status', fc);
        }

        return {
            connect: connect,
            joinChannel: joinChannel,
            leaveChannel: leaveChannel,
            onMessage: onMessage,
            sendMessage: sendMessage,
            onChannelStatus: onChannelStatus
        };
    }
})();
