var express = require('express');
var router = express.Router();

router.get('/status', function(req, res) {
    global.memoryCache.get('cluster.status', function(err, result){
        if (err) {
            res.json({success: false, msg: 'ERROR', payload: {}, errors: [err]});
            return;
        }
        res.json({success: true, msg: 'OK', payload: result ? result : {}});
    });
});

router.get('/ingest', function(req, res) {
    global.memoryCache.get('cluster.ingest_stats', function(err, result){
        if (err) {
            res.json({success: false, msg: err, payload: {}, errors: [err]});
            return;
        }
        if (result) {
            res.json({success: result.success, msg: result.msg, payload: result});
        } else {
            res.json({success: true, msg: 'No data in cache', payload: {}});
        }
    });
});

module.exports = router;
