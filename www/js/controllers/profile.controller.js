(function() {
    'use strict';
    angular.module('zaptv').controller('ProfileCtrl', ProfileCtrl);

    function ProfileCtrl($scope, $cordovaDatePicker, $cordovaCamera, $animationTrigger, User, Analytics) {
        Analytics.init();
        Analytics.trackView('profile');

        User.me().then(function(user) {
            $scope.user = user;
        }, function(e) {
            // TODO Handle error;
        });

        $scope.genders = [{
            id: 'm',
            label: 'Masculino'
        }, {
            id: 'f',
            label: 'Feminino'
        }, {
            id: 'o',
            label: 'Outros'
        }, {
            id: 'n',
            label: 'Não informado'
        }];

        var changedImage = false;

        $scope.changeImage = function() {
            $cordovaCamera.getPicture({
                quality: 50,
                destinationType: Camera.DestinationType.DATA_URL,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                allowEdit: true,
                encodingType: Camera.EncodingType.PNG,
                targetWidth: 400,
                targetHeight: 400,
                saveToPhotoAlbum: false
            }).then(function(imageData) {
                changedImage = true;
                $scope.user.image_url = "data:image/jpeg;base64," + imageData;
            }, function(err) {
                // error
            });
        };

        $scope.pickDate = function() {
            $cordovaDatePicker.show({
                date: new Date(),
                mode: 'date',
                allowOldDates: true,
                allowFutureDates: false,
                doneButtonLabel: 'Escolher',
                doneButtonColor: '#000000',
                cancelButtonLabel: 'Voltar',
                cancelButtonColor: '#000000'
            }).then(function(date) {
                if (date) {
                    $scope.user.birthdate = date.toISOString().split('T')[0];
                }
            });
        };

        $scope.update = function() {
            User.update({
                birthdate: $scope.user.birthdate,
                gender: $scope.user.gender,
                name: $scope.user.name
            }).then(function(u) {
                if(changedImage) {
                    User.changePicture({
                        name: "image.png",
                        data: $scope.user.image_url
                    }).then(function() {

                    }, function() {

                    });
                }
                else {
                    $scope.user = u;
                }
            }, function(e) {
                // TODO Handle this shit
            });
        };
    }
})();
