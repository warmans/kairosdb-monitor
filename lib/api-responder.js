module.exports.respond = function(res, success, payload, errors){
    res.json({
        success: success,
        payload: payload ? payload : {},
        errors: errors ? errors : []
    });
};
