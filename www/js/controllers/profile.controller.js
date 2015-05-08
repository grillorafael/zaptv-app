(function() {
    'use strict';
    angular.module('zaptv').controller('ProfileCtrl', ProfileCtrl);

    function ProfileCtrl($scope, $cordovaDatePicker, User, Analytics) {
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

        // $scope.onImageChange = function() {
        //     var inputFile = document.getElementById("file-input");
        //     var file = inputFile.files[0];
        //     var FR = new FileReader();
        //     FR.onload = function(e) {
        //         $scope.im = {
        //             name: file.name,
        //             data: e.target.result,
        //             size: e.total,
        //             date: e.timeStamp
        //         };
        //
        //         document.getElementById('current-image').setAttribute('src', e.target.result);
        //     };
        //     FR.readAsDataURL(file);
        // };
        //
        // $scope.saveImage = function() {
        //     var inputFile = document.getElementById("file-input");
        //     var file = inputFile.files[0];
        //     var FR = new FileReader();
        //     FR.onload = function(e) {
        //         var im = {
        //             name: file.name,
        //             data: e.target.result,
        //             size: e.total,
        //             date: e.timeStamp
        //         };
        //
        //         User.changePicture(im).then(function(updatedUser) {
        //             $scope.user = updatedUser;
        //         }, {
        //
        //         });
        //     };
        //     FR.readAsDataURL(file);
        // };

        $scope.pickDate = function() {
            $cordovaDatePicker.show({
                date: new Date(),
                mode: 'date',
                allowOldDates: true,
                allowFutureDates: false,
                doneButtonLabel: 'Escolher',
                doneButtonColor: '#F2F3F4',
                cancelButtonLabel: 'Voltar',
                cancelButtonColor: '#000000'
            }).then(function(date) {
                if(date) {
                    $scope.user.birthdate = date.toISOString().split('T')[0];
                }
            });
        };

        $scope.update = function() {
            // TODO Show some fucking spinner
            $scope.isUpdating = true;
            User.update({
                birthdate: $scope.user.birthdate,
                gender: $scope.user.gender,
                name: $scope.user.name
            }).then(function(u) {
                $scope.user = u;
            }, function(e) {
                // TODO Handle this shit
            }).finally(function() {
                $scope.isUpdating = false;
            });
        };
    }
})();
