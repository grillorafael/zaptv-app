(function() {
    'use strict';
    angular.module('zaptv').controller('ProfileCtrl', ProfileCtrl);

    function ProfileCtrl($scope, $cordovaDatePicker, $cordovaCamera, $animationTrigger,
        $ionicPlatform, $state, $localForage, $timeout, User, Analytics, Auth, ngNotify) {

        $scope.data = {};

        $scope.$on('$ionicView.enter', function() {
            $ionicPlatform.ready(function() {
                var user = Auth.getUser();
                Analytics.init(user.id);
                Analytics.trackView($state.current.name);
            });
        });

        $localForage.getItem('facebook_share_enable').then(function(facebookShareEnable) {
            $scope.data.facebookShareEnable = facebookShareEnable === undefined ? true : facebookShareEnable;
        });

        $scope.$watch('data.facebookShareEnable', function(v) {
            $localForage.setItem('facebook_share_enable', $scope.data.facebookShareEnable);
        });

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

        function showError() {
            ngNotify.set('Ocorreu um erro na requisição', {
                type: 'error',
                position: 'bottom'
            });
        }

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
            ngNotify.set('Atualizando...', {
                position: 'bottom',
                sticky: true
            });

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
                        ngNotify.dismiss();
                        Analytics.trackEvent('Profile', 'update_image');
                    }, function() {
                        showError();
                    });
                }
                else {
                    ngNotify.dismiss();
                    $scope.user = u;
                }
                Analytics.trackEvent('Profile', 'update');
            }, function(e) {
                showError();
            });
        };
    }
})();
