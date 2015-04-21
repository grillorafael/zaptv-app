(function() {
    'use strict';
    angular.module('zaptv.filters', [])
        .filter('smartchat', function() {
            return function(text) {
                var urlRegex = /([-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?)/gi;
                text = text.replace(urlRegex, function(match) {
                    return "<a ng-click='openLink(\"" + match + "\")' href>" + match + "</a>";
                });
                return "<p>" + text + "</p>";
            };
        });
})();
