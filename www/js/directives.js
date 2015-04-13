(function() {
    'use strict';
    angular.module('zaptv.directives', [])
        .directive('animationHandle', animationHandle);

        function animationHandle() {
            return {
                restrict: 'A',
                link: function(scope, element, attrs) {
                    scope.$on('animation:trigger:' + attrs.animationHandle, function(e, handler, animation, mode) {
                        if(mode === $animationTrigger.START) {
                            element.addClass(animation);
                        }
                        else if(mode === $animationTrigger.STOP) {
                            element.removeClass(animation);
                        }
                        else {
                            element.toggleClass(animation);
                        }
                    });
                }
            };
        }
})();
