define([],function(){
    function filter ($sce) {
        return function (val, labelCls) {
            var output = '';
            angular.forEach(val, function(tag){
                output += '<span class="label '+(labelCls ? labelCls : 'label-default')+'">'+tag+'</span> ';
            });
            return $sce.trustAsHtml(output);
        };
    }
    return filter;
});
