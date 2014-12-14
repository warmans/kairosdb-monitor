define([], function () {

    function controller($scope, $http) {
        $scope.errors = [];
        $scope.clusterStatus = {};

        $scope.updateStatus = function(){

            //reset errors
            $scope.errors = [];

            $http.get('/api/v1/cluster/status').
                success(function(data, status, headers, config) {
                    if (data.success === true) {
                        $scope.clusterStatus = data.payload;
                    } else {
                        $scope.errors.push(data.status+' status was returned');
                    }
                }).
                error(function(data, status, headers, config) {
                    $scope.errors.push('Failed to retrieve cluster status');
                });
        };

        //load initial status
        $scope.updateStatus();

        //start updating
        setInterval($scope.updateStatus, 10000);

        $scope.ingestStats = {};
        $scope.ingestChartOptions = {
            grid: { hoverable: true, borderWidth: 0},
            series: { shadowSize: 0 },
            lines : { lineWidth : 2, fill: false, steps: false },
            legend: { show: false },
            tooltip: true,
            tooltipOpts: {},
            xaxis: { mode: "time" }
        };


        $scope.updateIngestStats = function(){
            //reset errors
            $scope.errors = [];

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
        };

        //load initial status
        $scope.updateIngestStats();

        //start updating
        setInterval($scope.updateIngestStats, 10000);
    }

    controller.$inject=['$scope', '$http'];

    return controller;
});