(function() {
    'use strict';
    angular.module('zaptv.services', [])
        .factory('User', User)
        .factory('Channel', Channel)
        .factory('Socket', Socket)
        .value('Config', {
            'ENDPOINT': 'http://localhost:3000/api'
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

        function connect() {

        }

        function joinChannel(id) {
            currentChannel = id;
        }

        function leaveChannel(id) {
            if(id === undefined && currentChannel === null) {
                return;
            }
            else if(id !== undefined){

            }
            else { // currentChannel is not null

            }
        }

        return {
            connect: connect,
            joinChannel: joinChannel,
            leaveChannel: leaveChannel
        };
    }
})();
