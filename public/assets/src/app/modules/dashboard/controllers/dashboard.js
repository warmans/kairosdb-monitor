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
                        $scope.errors.push('Cluster status unavailable: '+data.status+' was returned');
                        console.log('Cluster status unavailable: '+data.status+' was returned');
                    }
                });
            },
            false
        );

        source.onerror = function(e) {

            //always log full error to console
            console.log(e);

            $scope.$apply(function () {

                //don't show any data until it's working again
                $scope.clusterStatus = {};

                var txt;
                switch (e.target.readyState) {
                    case EventSource.CONNECTING:
                        txt = 'connecting...';
                        break;
                    case EventSource.CLOSED:
                        txt = 'connection failed. reload the page to re-establish the connection';
                        break;
                }

                $scope.errors.push('Status socket error... '+txt);
            });
        };


        //------------------------------------------
        // Timeseries
        //------------------------------------------

        $scope.ingestStats = {};
        $scope.ingestChartOptions = {
            grid: { hoverable: true, borderWidth: 0},
            series: { shadowSize: 0, stack: true },
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
                },{
                    "tags": {},
                    "name": "kairosdb.protocol.telnet_request_count",
                    "aggregators": [{"name": "sum", "align_sampling": true, "sampling": { "value": "1", "unit": "minutes"}}]
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
                }).
                finally(function(){
                    //schedule another update for 10 seconds time
                    setTimeout(function(){
                        $scope.updateIngestStats();
                    }, 10000);
                });
        };

        //start updating ingest stats
        $scope.updateIngestStats();
    }

    controller.$inject=['$scope', '$http'];

    return controller;
});