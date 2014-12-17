define([
    './controllers/dashboard',
    './controllers/host'
    ],

    function (dashboardController, hostController) {

        var app = angular.module('monitor.dashboard', []);

        //module config
        app.config(['$routeProvider', function($routeProvider){
            $routeProvider
                .when('/dashboard', {
                    templateUrl: '/assets/src/app/modules/dashboard/views/dashboard.html',
                    controller: 'dashboardController'
                })
                .when('/dashboard/host/:host', {
                    templateUrl: '/assets/src/app/modules/dashboard/views/host.html',
                    controller: 'hostController'
                });
        }]);

        app.controller('dashboardController', dashboardController);
        app.controller('hostController', hostController);
    }
);
