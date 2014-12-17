var express = require('express');
var request = require('request');
var router = express.Router();


var kairosdb = require('../../lib/kairosdb');
var apiResponder = require('../../lib/api-responder');

router.get('/:host/graph/:metric', function(req, res) {

    kairosdb.query({
        "metrics": [{
            "tags": {
                "host": [req.params.host]
            },
            "name": req.params.metric
        }],
        "cache_time": 0,
        "start_relative": {
            "value": "10",
            "unit": "minutes"
        }
    },
    function (err, result) {
        if (err) {
            apiResponder.respond(res, false, {}, [err]);
            return;
        }

        var data = [];
        if (result['queries']) {
            data = result['queries'][0]['results'][0]['values'] ? result['queries'][0]['results'][0]['values'] : [];
        }
        apiResponder.respond(res, true, data, []);
    });
});

module.exports = router;
