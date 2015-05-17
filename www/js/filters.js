(function() {
    'use strict';
    angular.module('zaptv.filters', [])
        .filter('smartchat', function() {
            return function(text) {
                var phoneRegex = /\(?\d{2,3}\)?\s?\d{6,11}/;
                var urlRegex = /([-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?)/gi;

                text = text.replace(urlRegex, function(match) {
                    if (match.substring(0, 4) !== "http") {
                        match = "http://" + match;
                    }

                    var displayText = match;

                    return "<a class='chat-link' ng-click='openLink(\"" + match + "\")' href>" + displayText + "</a>";
                });

                text = text.replace(phoneRegex, function(match) {
                    var displayText = match;
                    match = match.replace(/\D/g, '');
                    if(displayText[0] === '+') {
                        match = '+' + match;
                    }

                    return "<a class='chat-link' href='tel:" + match + "'>" + displayText + "</a>";
                });

                return "<p>" + text + "</p>";
            };
        })
    .filter('timeramain', function() {
        return function(time) {
            if(time > 60) {
                var numHours = parseInt(time / 60);
                var numMinutes = time % 60;

                var minutesText = numMinutes > 0 ? ' e ' + numMinutes + ' minutos' : '';
                var hoursText = numHours + ' horas' + minutesText;
                return hoursText.replace('.', ',');
            }
            else {
                return time + ' minutos';
            }
        };
    });
})();
