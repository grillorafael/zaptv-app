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
            'ngInflection',
            'ngNotify',
            'monospaced.elastic'
        ])
        .run(function($ionicPlatform, $timeout, amMoment) {
            amMoment.changeLocale('pt-br');
            $ionicPlatform.ready(function() {
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }
                if (window.StatusBar) {
                    StatusBar.styleLightContent();
                }

                $timeout(function() {
                    if (navigator.splashscreen !== undefined) {
                        navigator.splashscreen.hide();
                    }
                }, 100);


                if (window.parsePlugin) {
                    parsePlugin.initialize("RcQLqd4pd9Hx4LqNV5nwEFey2rA1oVoefmMZP24Q", "89SWpicNJom2o8vTBAsETw0UFmYdtptP2mr8Ltnl", function() {
                        parsePlugin.getInstallationId(function(id) {}, function(e) {});
                    }, function(e) {});
                }
            });
        })
        .config(function($stateProvider, $urlRouterProvider, $httpProvider, $ionicConfigProvider, $cordovaAppRateProvider) {
            if (ionic.Platform.isAndroid()) {
                // $ionicConfigProvider.scrolling.jsScrolling(false);
            }
            if (window.cordova !== undefined) {
                document.addEventListener("deviceready", function() {
                    $cordovaAppRateProvider.setPreferences({
                        language: 'pt',
                        appName: 'Zaper',
                        iosURL: 'com.goldenkricket.zaper',
                        androidURL: 'market://details?id=com.goldenkricket.zaper',
                        usesUntilPrompt: 3,
                        promptForNewVersion: true,
                        useCustomRateDialog: 'Gostou do zaper?'
                    });
                }, false);

            }

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
                .state('favorites', {
                    url: '/favorites',
                    views: {
                        'mainContent': {
                            templateUrl: 'templates/favorites.html',
                            controller: 'FavoritesCtrl'
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
                .state('channel', {
                    url: '/channel',
                    views: {
                        'mainContent': {
                            templateUrl: 'templates/channel.html',
                            controller: 'ChannelCtrl'
                        }
                    }
                });

            if (localStorage.getItem('auth_token')) {
                $urlRouterProvider.otherwise('/channels');
            } else {
                $urlRouterProvider.otherwise('/login');
            }
        });
}());
