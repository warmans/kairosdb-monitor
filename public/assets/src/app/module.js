define([
    './modules/dashboard/module',
    './filters/default',
    './filters/tags',
    './filters/unsafe',
    ],
    /**
     * Application entry point. Routes request into default module.
     */
    function (dashboardModule, defaultFilter, tagsFilter, unsafeFilter) {
        var app = angular.module('monitor', ['ngRoute', 'angular-flot', 'monitor.dashboard']);

        app.config(['$routeProvider', function($routeProvider) {
            $routeProvider.otherwise({ redirectTo: '/dashboard' });
        }]);

        app.filter('default', defaultFilter);
        app.filter('tags', tagsFilter);
        app.filter('unsafe', unsafeFilter);
    }
);
