(function() {
    'use strict';
    angular.module('zaptv').controller('ProfileCtrl', ProfileCtrl);

    function ProfileCtrl($scope, $cordovaDatePicker, $cordovaCamera, $animationTrigger,
        $ionicPlatform, $state, $localForage, $timeout, $ionicLoading, User, Analytics, Auth, ngNotify) {

        $scope.isLoading = true;
        $scope.errorLoading = false;

        $ionicLoading.show({
            scope: $scope,
            template: '<ion-spinner ng-if="isLoading"></ion-spinner><i class="ion-ios-refresh-empty profile-view-reload" ng-click="reload()" ng-if="errorLoading"></i>',
            hideOnStateChange: true
        });

        function loadUser() {
            $scope.isLoading = true;
            $scope.errorLoading = false;
            User.me().then(function(user) {
                $scope.user = user;
                $ionicLoading.hide();
            }, function(e) {
                $scope.isLoading = false;
                $scope.errorLoading = true;
            });
        }

        $scope.data = {};

        $scope.$on('$ionicView.enter', function() {
            loadUser();
            $ionicPlatform.ready(function() {
                var user = Auth.getUser();
                Analytics.init(user.id);
                Analytics.trackView($state.current.name);
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
                }
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

        $scope.reload = loadUser;

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

                ngNotify.set('Atualizando...', {
                    position: 'bottom',
                    sticky: true
                });

                User.changePicture({
                    name: "image.png",
                    data: $scope.user.image_url
                }).then(function(u) {
                    Analytics.trackEvent('Profile', 'update_image');
                    localStorage.setItem('user', JSON.stringify(u));

                    $timeout(function() {
                        ngNotify.dismiss();
                    }, 500);
                }, function() {
                    $timeout(function() {
                        ngNotify.dismiss();
                        showError();
                    }, 500);
                });
            }, function(err) {
                // error
            });
        };

        $scope.changeProfile = function() {
            User.update({
                birthdate: $scope.user.birthdate,
                gender: $scope.user.gender,
                name: $scope.user.name
            }).then(function(u) {
                Analytics.trackEvent('Profile', 'update');
                localStorage.setItem('user', JSON.stringify(u));
            }, function(e) {
                showError();
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
                    $scope.changeProfile();
                }
            });
        };
    }
})();
