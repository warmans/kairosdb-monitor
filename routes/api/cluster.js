var express = require('express');
var router = express.Router();

var cacheManager = require('cache-manager');
var request = require('request');

var monitor = require('../../lib/status-monitor');
var kairosdb = require('../../lib/kairosdb');
var apiResponder = require('../../lib/api-responder');

//-------------------------------------------------------------------------------------------------------------------
// Handle Status Updates (push)
//-------------------------------------------------------------------------------------------------------------------
var openConnections = [];

router.get('/status', function(req, res) {

    //don't timeout
    req.socket.setTimeout(Infinity);

    // send headers for event-stream connection
    // see spec for more information
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
    });
    res.write('\n');

    // push this res object to our global variable
    openConnections.push(res);

    //clean up disconnected clients
    req.on('close', function(){
        openConnections.splice(openConnections.indexOf(res), 1);
    });

});

monitor.addSubscriber(function(status){
    //update clients with latest status
    openConnections.forEach(function(resp) {
        var d = new Date();
        resp.write('id: ' + d.getMilliseconds() + '\n');
        resp.write('data:' + JSON.stringify({success: true, payload: monitor.status ? monitor.status : {}, errors: []}) + '\n\n');
    });
});

//-------------------------------------------------------------------------------------------------------------------
// Handle data queries (pull)
//-------------------------------------------------------------------------------------------------------------------

router.post('/query', function(req, res) {
    var startTime = Date.now();

    kairosdb.query(
        req.body,
        function (err, result) {
            if (err) {
                apiResponder.respond(res, false, {}, [err]);
                return;
            }

            var payload = {
                query_time_ms: Date.now() - startTime,
                data:  [],
                updated: new Date()
            };

            if (result['queries']) {
                payload.data = result['queries'][0]['results'][0]['values'] ? result['queries'][0]['results'][0]['values'] : [];
            }
            apiResponder.respond(res, true, payload, []);
        },
        60);
});

module.exports = router;
