define([
    './controllers/dashboard'
    ],

    function (dashboardController) {

        var app = angular.module('monitor.dashboard', []);

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
