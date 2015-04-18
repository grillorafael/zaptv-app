(function() {
    'use strict';
    angular.module('zaptv', [
        'ionic',
        'zaptv.services',
        'zaptv.directives',
        'angularMoment',
        'akoenig.deckgrid'
        ])
        .run(function($ionicPlatform, amMoment) {
            amMoment.changeLocale('pt-br');
            $ionicPlatform.ready(function() {
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
                }
                if (window.StatusBar) {
                    StatusBar.style(1);
                }
            });
        })
        .config(function($stateProvider, $urlRouterProvider, $httpProvider, $ionicConfigProvider) {
            $httpProvider.interceptors.push('AuthInterceptor');
            $stateProvider
                .state('login', {
                    url: '/login',
                    views: {
                        'mainContent': {
                            templateUrl: 'templates/login.html',
                            controller: 'LoginCtrl'
                        }
                    }
                })
                .state('channels', {
                    url: '/channels',
                    views: {
                        'mainContent': {
                            templateUrl: 'templates/channels.html',
                            controller: 'ChannelsCtrl'
                        }
                    }
                })
                .state('bootstrap', {
                    url: '/bootstrap',
                    views: {
                        'mainContent': {
                            templateUrl: 'templates/bootstrap.html',
                            controller: 'BootstrapCtrl'
                        }
                    }
                })
                .state('channel', {
                    url: '/channel/:id',
                    views: {
                        'mainContent': {
                            templateUrl: 'templates/channel.html',
                            controller: 'ChannelCtrl'
                        }
                    }
                });
            $urlRouterProvider.otherwise('/bootstrap');
        });
}());
