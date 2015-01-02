define([
    './lib/sparkline',
    './controllers/dashboard'
    ],

    function (sparkLineModule, dashboardController, hostController) {

        var app = angular.module('monitor.dashboard', ['sparkline']);

        //module config
        app.config(['$routeProvider', function($routeProvider){
            $routeProvider
                .when('/dashboard', {
                    templateUrl: '/assets/src/app/modules/dashboard/views/dashboard.html',
                    controller: 'dashboardController'
                });
        }]);

        app.controller('dashboardController', dashboardController);
    }
);
