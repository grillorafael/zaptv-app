(function() {
    'use strict';
    angular.module('zaptv').controller('ProfileCtrl', ProfileCtrl);

    function ProfileCtrl($scope, User) {
        User.me().then(function(user) {
            $scope.user = user;
        }, function(e) {
            // TODO Handle error;
        });

        $scope.saveImage = function() {
            var inputFile = document.getElementById("file-input");
            var file = inputFile.files[0];
            var FR = new FileReader();
            FR.onload = function(e) {
                var im = {
                    name: file.name,
                    data: e.target.result,
                    size: e.total,
                    date: e.timeStamp
                };

                User.changePicture(im).then(function(updatedUser) {
                    $scope.user = updatedUser;
                }, {

                });
            };
            FR.readAsDataURL(file);
        };
    }
})();
