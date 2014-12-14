define([
    './modules/dashboard/module',
    './filters/default'
    ],
    /**
     * Application entry point. Routes request into default module.
     */
    function (dashboardModule, defaultFilter) {
        var app = angular.module('monitor', ['ngRoute', 'angular-flot', 'monitor.dashboard']);

        app.config(['$routeProvider', function($routeProvider) {
            $routeProvider.otherwise({ redirectTo: '/dashboard' });
        }]);

        app.filter('default', defaultFilter);
    }
);
