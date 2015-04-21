(function() {
    'use strict';
    angular.module('zaptv.directives', [])
        .directive('animationHandle', animationHandle)
        .directive('compile', compile)
        .directive('focus', focus);

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

    function animationHandle() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                scope.$on('animation:trigger:' + attrs.animationHandle, function(e, handler, animation, mode) {
                    if (mode === $animationTrigger.START) {
                        element.addClass(animation);
                    } else if (mode === $animationTrigger.STOP) {
                        element.removeClass(animation);
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
