(function() {
    'use strict';
    angular.module('zaptv.directives', [
            'zaptv.services'
        ])
        .directive('animationHandle', animationHandle)
        .directive('score', score)
        .directive('channelTile', channelTile)
        .directive('loader', loader)
        .directive('handleLoadError', handleLoadError)
        .directive('username', username)
        .directive('email', email)
        .directive('message', message)
        .directive('preloadImage', preloadImage)
        .directive('compile', compile)
        .directive('expandItem', expandItem)
        .directive('keepFocusOnTextarea', keepFocusOnTextarea);

    function keepFocusOnTextarea ($timeout) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var isAndroid = ionic.Platform.isAndroid();
                if(isAndroid) {
                    element.on('click', function() {
                        $timeout(function() {
                            document.getElementById('message-field').focus();
                        });
                    });
                }
            }
        };
    }

    function expandItem() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.on('click', function() {
                    element.parent('label').toggleClass('expanded');
                });
            }
        };
    }

    function compile($compile) {
        // directive factory creates a link function
        return function(scope, element, attrs) {
            scope.$watch(
                function(scope) {
                    // watch the 'compile' expression for changes
                    return scope.$eval(attrs.compile);
                },
                function(value) {
                    // when the 'compile' expression changes
                    // assign it into the current DOM
                    element.html(value);

                    // compile the new DOM and link it to the current
                    // scope.
                    // NOTE: we only compile .childNodes so that
                    // we don't get into infinite loop compiling ourselves
                    $compile(element.contents())(scope);
                }
            );
        };
    }

    function preloadImage() {
        return {
            restrict: 'A',
            link: function(scope, el, attrs) {
                el[0].src = 'img/placeholder.jpg';

                function imageLoad(url) {
                    var img = new Image();
                    img.onload = function() {
                        if(attrs.isCss !== undefined) {
                            el[0].style.backgroundImage = "url('" + url + "')";
                        }
                        else {
                            el[0].src = url;
                        }
                    };

                    img.src = url;
                }

                attrs.$observe('preloadImage', function(nv){
                    imageLoad(attrs.preloadImage);
                });

                imageLoad(attrs.preloadImage);
            }
        };
    }

    function message($templateCache, $compile, $parse) {
        function getTemplate(msg) {
            if (msg.payload) {
                if (msg.payload.type == "TWAPER") {
                    return 'templates/directives/twaper_message.html';
                } else if (msg.payload.type == "DIVIDER") {
                    return 'templates/directives/divider_message.html';
                }
            } else {
                return 'templates/directives/user_message.html';
            }
        }

        return {
            restrict: 'E',
            replace: true,
            scope: {
                message: '=data'
            },
            link: function(scope, element, attrs) {
                scope.user = scope.$parent.user;
                scope.viewUser = scope.$parent.viewUser;
                scope.toggleLike = scope.$parent.toggleLike;
                scope.messageOptions = scope.$parent.messageOptions;
                scope.openLink = scope.$parent.openLink;
                scope.getUserColor = scope.$parent.getUserColor;

                var templateUrl = getTemplate(scope.message);
                var template = $templateCache.get(templateUrl);

                var e = $compile(template)(scope);
                element.replaceWith(e);
            }
        };
    }

    function email($q, User) {
        return {
            require: 'ngModel',
            link: function(scope, elm, attrs, ctrl) {
                ctrl.$asyncValidators.email = function(modelValue, viewValue) {
                    if (ctrl.$isEmpty(modelValue)) {
                        return $q.reject();
                    }

                    var def = $q.defer();

                    User.checkEmail(modelValue).then(function(res) {
                        if (res.has_email) {
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


    function username($q, User) {
        return {
            require: 'ngModel',
            link: function(scope, elm, attrs, ctrl) {
                ctrl.$asyncValidators.username = function(modelValue, viewValue) {
                    if (ctrl.$isEmpty(modelValue) || !/^[a-zA-Z0-9_]{4,16}$/.test(modelValue)) {
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
})();
