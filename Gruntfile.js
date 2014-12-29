module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
          options: {
            separator: '\n\n'
          },
          dist: {
              files: {
                  'public/assets/dist/vendor.js': [
                      //jquery
                      'bower_components/jquery/dist/jquery.js',
                      'bower_components/jquery.sparkline.build/dist/jquery.sparkline.min.js',
                      //angular
                      'bower_components/angular/angular.js',
                      'bower_components/angular-route/angular-route.js',
                      //bootstrap
                      'bower_components/bootstrap/dist/js/bootstrap.min.js',
                      //charts
                      'bower_components/flot/jquery.flot.js',
                      'bower_components/flot/jquery.flot.time.js',
                      'bower_components/flot/jquery.flot.resize.js',
                      'bower_components/flot.tooltip/js/jquery.flot.tooltip.min.js',
                      'bower_components/angular-flot/angular-flot.js',
                      //require
                      'bower_components/requirejs/require.js'
                  ],
                  'public/assets/dist/vendor.css': [

                  ]
              }
          }
        },
        less: {
            production: {
                options: {
                    paths: ['bower_components/bootstrap/less']
                },
                files: {
                    "public/assets/dist/style.css": "public/assets/src/less/style.less"
                }
            }
        },
        watch: {
            files: ['public/assets/src/style.less'],
            tasks: ['less']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['concat', 'less']);
}
