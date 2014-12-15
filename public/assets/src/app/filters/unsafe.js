define([],function(){
    function filter ($sce) {
        return function (val) {
            return $sce.trustAsHtml(val);
        };
    }
    return filter;
});
