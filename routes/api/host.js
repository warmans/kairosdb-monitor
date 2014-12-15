var express = require('express');
var request = require('request');
var router = express.Router();

router.get('/:host/graph/:metric', function(req, res) {

    var responseHandler = function(success, msg, payload, errors){
        res.json({
            success: success,
            msg: msg ? msg : '',
            payload: payload ? payload : {},
            errors: errors ? errors : []
        });
    };

    global.memoryCache.wrap(
        'metric_graph_'+ req.params.metric,
        function (cb) {
            var options = {
                uri: 'http://'+req.params.host+'/api/v1/datapoints/query',
                method: 'POST',
                timeout: 60*1000, //1 minute timeout
                body: JSON.stringify({
                    "metrics": [{
                        "tags": {
                            "host": ["warmans-VirtualBox"]
                        },
                        "name": req.params.metric,
                        "group_by": [{
                            "name": "tag",
                            "tags": ["host"]
                        }]
                    }],
                    "cache_time": 0,
                    "start_relative": {
                        "value": "10",
                        "unit": "minutes"
                    }
                })
            };

            request(options, function(error, response, body) {
                if (error) {
                    cb(error);
                } else {
                    if (response.statusCode === 200) {
                        try {
                            var data = JSON.parse(body);
                            console.log(body);
                            var result = data['queries'][0]['results'][0]['values'] ? data['queries'][0]['results'][0]['values'] : [];

                            //success
                            cb(null, result);

                        } catch (e) {
                            cb(e.message);
                        }
                    } else {
                        cb('Unexpected response status: '+response.statusCode);
                    }
                }
            });
        },
        -1, //todo increase cache duration
        function (err, result) {
            if (err) {
                responseHandler(false, 'ERROR', {}, [err]);
            }
            responseHandler(true, 'OK', result, []);
        }
    );
});


module.exports = router;
