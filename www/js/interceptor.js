(function() {
    angular.module('zaptv').factory('AuthInterceptor', AuthInterceptor);

    function AuthInterceptor($q, $window) {
        return {
            response: function(response) {
                if (response.data.token) {
                    localStorage.setItem('auth_token', response.data.token);
                    localStorage.setItem('user_id', response.data.user.id);
                }

                return response;
            },
            responseError: function(response) {
                switch (response.status) {
                    case 403:
                        localStorage.removeItem('auth_token');
                        $window.location = '#/login';
                        break;
                }

                return $q.reject(response);
            }
        };
    }
})();
