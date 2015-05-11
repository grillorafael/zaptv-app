(function() {
    'use strict';
    angular.module('zaptv', [
        'ionic',
        'zaptv.services',
        'zaptv.directives',
        'zaptv.values',
        'zaptv.filters',
        'angularMoment',
        'ngCordova',
        'LocalForageModule',
        'ngInflection'
        ])
        .run(function($ionicPlatform, amMoment) {
            amMoment.changeLocale('pt-br');
            $ionicPlatform.ready(function() {
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }
                if (window.StatusBar) {
                    StatusBar.styleLightContent();
                }
            });
        })
        .config(function($stateProvider, $urlRouterProvider, $httpProvider, $ionicConfigProvider) {
            $ionicConfigProvider.tabs.position('top');
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
                .state('login-form', {
                    url: '/login-form',
                    views: {
                        'mainContent': {
                            templateUrl: 'templates/login-form.html',
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

            if(localStorage.getItem('auth_token')) {
                $urlRouterProvider.otherwise('/channels');
            }
            else {
                $urlRouterProvider.otherwise('/login');
            }
        });
}());
