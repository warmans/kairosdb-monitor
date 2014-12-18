define([], function () {

    function controller($scope, $http) {

        $scope.errors = [];

        //------------------------------------------
        // Status
        //------------------------------------------

        $scope.clusterStatus = {};

        var source = new EventSource('/api/v1/cluster/status');
        source.addEventListener(
            'message',
            function (msg) {
                $scope.$apply(function () {

                    //reset errors on new message
                    $scope.errors = [];

                    var data = JSON.parse(msg.data);

                    if (data.success === true) {
                        $scope.clusterStatus = data.payload;
                    } else {
                        $scope.errors.push('Cluster status unavailable: '.data.status+' was returned');
                    }
                });
            },
            false
        );

        //------------------------------------------
        // Timeseries
        //------------------------------------------

        $scope.ingestStats = {};
        $scope.ingestChartOptions = {
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

        $scope.query = {
            numHours: 1
        };

        $scope.updateIngestStats = function(){
            //reset errors
            $scope.errors = [];

            var ingestStatsQuery = {
                "metrics": [{
                    "tags": {},
                    "name": "kairosdb.http.ingest_count",
                    "aggregators": [{"name": "sum", "align_sampling": true, "sampling": {"value": "1", "unit": "minutes"}}]
                }],
                "cache_time": 0,
                "start_relative": { "value": $scope.query.numHours, "unit": "hours" }
            };

            $http.post('/api/v1/cluster/query', ingestStatsQuery).
                success(function(response, status, headers, config) {
                    if (response.success === true) {
                        $scope.ingestStats = response.payload;
                    } else {
                        $scope.errors.push('Chart data not available because: '+response.errors.join(', '));
                    }
                }).
                error(function(response, status, headers, config) {
                    $scope.errors.push('Chart data not available because: '+status+' error');
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