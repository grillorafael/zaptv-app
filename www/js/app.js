(function() {
    'use strict';
    angular.module('zaptv', [
        'ionic',
        'zaptv.services',
        'zaptv.directives',
        'zaptv.values',
        'zaptv.filters',
        'angularMoment',
        'ngCordova'
        ])
        .run(function($ionicPlatform, amMoment) {
            amMoment.changeLocale('pt-br');
            $ionicPlatform.ready(function() {
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
                }
                if (window.StatusBar) {
                    StatusBar.styleLightContent();
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
                .state('register', {
                    url: '/register',
                    views: {
                        'mainContent': {
                            templateUrl: 'templates/register.html',
                            controller: 'RegisterCtrl'
                        }
                    }
                })
                .state('profile', {
                    url: '/profile',
                    views: {
                        'mainContent': {
                            templateUrl: 'templates/profile.html',
                            controller: 'ProfileCtrl'
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
                    url: '/channel',
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
