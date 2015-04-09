(function() {
    'use strict';
    angular.module('zaptv.services', [])
        .factory('User', User)
        .factory('Channel', Channel)
        .factory('Socket', Socket)
        .value('Config', {
            'ENDPOINT': 'http://localhost:3000/api',
            'SOCKET_ADDR': 'http://localhost:3000'
        });

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

    function Channel($http, $q, Config) {
        function list() {

        }

        function getInfo(id) {

        }

        return {
            list: list,
            getInfo: getInfo
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

        function onMessage(fc) {
            socket.on('message to device', fc);
        }

        return {
            connect: connect,
            joinChannel: joinChannel,
            leaveChannel: leaveChannel,
            onMessage: onMessage
        };
    }
})();
