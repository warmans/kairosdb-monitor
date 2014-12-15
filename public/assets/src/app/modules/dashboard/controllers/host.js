define([], function () {

    function controller($scope, $http, $routeParams) {
        $scope.hostName = $routeParams.host;

        $http.get('/api/v1/cluster/ingest').
            success(function(response, status, headers, config) {
                if (response.success === true) {
                    $scope.ingestStats = response.payload;
                } else {
                    $scope.errors.push('Ingest stats report an error: '+response.msg);
                }
            }).
            error(function(response, status, headers, config) {
                $scope.errors.push('Failed to retrieve ingest stats');
            });

    }

    controller.$inject=['$scope', '$http'];

    return controller;
});