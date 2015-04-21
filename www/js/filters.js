(function() {
    'use strict';
    angular.module('zaptv.filters', [])
        .filter('smartchat', function() {
            return function(text) {
                var urlRegex = /([-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?)/gi;
                text = text.replace(urlRegex, function(match) {
                    if (match.substring(0, 4) !== "http") {
                        match = "http://" + match;
                    }

                    var displayText = match.substring(0, match.length / 1.3) + '...';

                    return "<a ng-click='openLink(\"" + match + "\")' href>" + displayText + "</a>";
                });
                return "<p>" + text + "</p>";
            };
        });
})();
