(function() {
    'use strict';
    angular.module('zaptv.directives', [])
        .directive('animationHandle', animationHandle)
        .directive('compile', compile)
        .directive('focus', focus)
        .directive('score', score)
        .directive('channelTile', channelTile)
        .directive('loader', loader)
        .directive('handleLoadError', handleLoadError);

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

    function focus($timeout) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                $timeout(function() {
                    element[0].focus();
                }, 200);
            }
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
