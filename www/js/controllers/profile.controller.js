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

        $localForage.getItem('config').then(function(config) {
            if(!config) {
                config = {
                    facebook_share_enable: true,
                    twaper_enable: true
                };
                $localForage.setItem('config', config);
            }
            $scope.data.facebookShareEnable = config.facebook_share_enable;
            $scope.data.twaperEnable = config.twaper_enable;
        });

        $scope.$watch('data.facebookShareEnable', function(v) {
            $scope.data.facebook_share_enable = v;
            $localForage.setItem('config', $scope.data);
        });

        $scope.$watch('data.twaperEnable', function(v) {
            $scope.data.twaper_enable = v;
            $localForage.setItem('config', $scope.data);
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

            if(changedImage) {
                User.changePicture({
                    name: "image.png",
                    data: $scope.user.image_url
                }).then(function() {
                    User.update({
                        birthdate: $scope.user.birthdate,
                        gender: $scope.user.gender,
                        name: $scope.user.name
                    }).then(function(u) {
                        Analytics.trackEvent('Profile', 'update');
                        $scope.user = u;

                        $timeout(function() {
                            ngNotify.dismiss();
                        }, 500);
                        localStorage.setItem('user', JSON.stringify(u));
                    }, function(e) {
                        showError();
                    });
                    Analytics.trackEvent('Profile', 'update_image');
                }, function() {
                    showError();
                });
            }
            else {
                User.update({
                    birthdate: $scope.user.birthdate,
                    gender: $scope.user.gender,
                    name: $scope.user.name
                }).then(function(u) {
                    Analytics.trackEvent('Profile', 'update');
                    $scope.user = u;

                    $timeout(function() {
                        ngNotify.dismiss();
                    }, 500);
                    localStorage.setItem('user', JSON.stringify(u));
                }, function(e) {
                    showError();
                });
            }
        };
    }
})();
