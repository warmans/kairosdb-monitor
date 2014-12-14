define([],function(){
    function filter () {
        return function (val, def) {
            return (val === undefined || val === null) ? def : val;
        };
    }
    return filter;
});
