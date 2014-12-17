define([], function () {

    function controller($scope, $http, $routeParams) {
        $scope.hostName = $routeParams.host;
        $scope.datasets = [];

        $scope.chartOptions = {
            grid: { hoverable: true, borderWidth: 0},
            series: { shadowSize: 0 },
            lines : { lineWidth : 1, fill: true },
            legend: { show: false },
            tooltip: true,
            tooltipOpts: {},
            xaxis: { mode: "time" },
            yaxis: {
                min: 0,
                tickFormatter: function(val, axis) {
                    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                }
            }
        };



        $http.get('/api/v1/host/'+$routeParams.host+'/graph/kairosdb.jvm.free_memory').
            success(function(response, status, headers, config) {
                if (response.success === true) {
                    $scope.datasets.push({name: 'JVM Free Memory', data: response.payload});
                } else {
                    $scope.errors.push('Ingest stats report an error: '+response.msg);
                }
            }).
            error(function(response, status, headers, config) {
                $scope.errors.push('Failed to retrieve '+config.uri);
            });

        $http.get('/api/v1/host/'+$routeParams.host+'/graph/kairosdb.datastore.query_row_count').
            success(function(response, status, headers, config) {
                if (response.success === true) {
                    $scope.datasets.push({name: 'Query Row Count', data: response.payload});
                } else {
                    $scope.errors.push('Ingest stats report an error: '+response.msg);
                }
            }).
            error(function(response, status, headers, config) {
                $scope.errors.push('Failed to retrieve '+config.uri);
            });
    }

    controller.$inject=['$scope', '$http', '$routeParams'];

    return controller;
});