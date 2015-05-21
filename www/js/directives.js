(function() {
    'use strict';
    angular.module('zaptv.directives', [
            'zaptv.services'
        ])
        .directive('animationHandle', animationHandle)
        .directive('compile', compile)
        .directive('score', score)
        .directive('channelTile', channelTile)
        .directive('loader', loader)
        .directive('handleLoadError', handleLoadError)
        .directive('username', username)
        .directive('message', message)
        .directive('preloadImage', preloadImage);

    function preloadImage() {
        return {
            restrict: 'A',
            link: function(scope, el, attrs) {
                el[0].src = 'img/placeholder.jpg';

                var url = attrs.preloadImage;
                var img = new Image();
                img.onload = function() {
                    el[0].src = url;
                };

                img.src = url;
            }
        };
    }

    function message() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                message: '=data'
            },
            template: '<ng-include src="getTemplateUrl()"/>',
            controller: function($scope) {
                $scope.user = $scope.$parent.user;
                $scope.viewUser = $scope.$parent.viewUser;
                $scope.toggleLike = $scope.$parent.toggleLike;
                $scope.messageOptions = $scope.$parent.messageOptions;
                $scope.openLink = $scope.$parent.openLink;

                $scope.getTemplateUrl = function() {
                    if($scope.message.payload) {
                        if ($scope.message.payload.type == "TWAPER") {
                            return 'templates/directives/twaper_message.html';
                        }
                        else if ($scope.message.payload.type == "DIVIDER") {
                            return 'templates/directives/divider_message.html';
                        }
                    }
                    else {
                        return 'templates/directives/user_message.html';
                    }
                };
            }
        };
    }

    function username($q, User) {
        return {
            require: 'ngModel',
            link: function(scope, elm, attrs, ctrl) {
                ctrl.$asyncValidators.username = function(modelValue, viewValue) {
                    if (ctrl.$isEmpty(modelValue) || !/^[a-zA-Z0-9_]{6,16}$/.test(modelValue)) {
                        return $q.reject();
                    }

                    var def = $q.defer();

                    User.checkUsername(modelValue).then(function(res) {
                        if (res.has_username) {
                            def.reject();
                        } else {
                            def.resolve();
                        }
                    }, function(e) {
                        def.reject();
                    });

                    return def.promise;
                };
            }
        };
    }

    function handleLoadError() {
        return {
            restrict: 'A',
            link: function(scope, el) {
                el.bind('error', function() {
                    angular.element(this).attr("src", 'img/placeholder.jpg');
                });
            }
        };
    }

    function loader() {
        return {
            restrict: 'E',
            templateUrl: 'templates/directives/loader.html'
        };
    }

    function channelTile() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'templates/directives/channel_tile.html'
        };
    }

    function score() {
        return {
            restrict: 'E',
            templateUrl: 'templates/directives/score.html'
        };
    }

    function animationHandle($animationTrigger, $timeout) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                scope.$on('animation:trigger:' + attrs.animationHandle, function(e, handler, animation, mode) {
                    if (mode === $animationTrigger.START) {
                        element.addClass(animation);
                    } else if (mode === $animationTrigger.STOP) {
                        element.removeClass(animation);
                    } else if (mode === $animationTrigger.FROM_START) {
                        element.removeClass(animation);
                        $timeout(function() {
                            element.addClass(animation);
                        }, 100);
                    } else {
                        element.toggleClass(animation);
                    }
                });
            }
        };
    }

    function compile($compile) {
        return function(scope, element, attrs) {
            scope.$watch(
                function(scope) {
                    return scope.$eval(attrs.compile);
                },
                function(value) {
                    element.html(value);
                    $compile(element.contents())(scope);
                }
            );
        };
    }
})();
