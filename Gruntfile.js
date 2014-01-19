'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    coffee: {
      test: {
        expand: true,
        cwd: 'test',
        src: ['**/*.coffee'],
        dest: 'generated/coffee/test',
        ext: '.js'
      }
    },
    browserify: {
      lib: {
        src: ['lib/kozu.js'],
        dest: 'generated/browserify/lib/kozu.js',
        options: {
          standalone: 'kozu'
        }
      },
      test: {
        src: ['generated/coffee/test/common/kozu_test.js'],
        dest: 'generated/browserify/test/common/kozu_test.js'
      },
    },
    testem: {
      main: {
        src: ["test/browser/index.html"],
        dest: 'tests.tap'
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib: {
        src: ['lib/**/*.js']
      },
      test: {
        src: ['test/common/**/*.js', 'test/node/**/*.js']
      },
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib: {
        files: '<%= jshint.lib.src %>',
        tasks: ['jshint:lib', 'browserify:lib']
      },
      test: {
        files: ['test/**/*', 'lib/**/*'],
        tasks: ['jshint:test', 'coffee:test', 'browserify:test']
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-testem');

  // Default task.
  grunt.registerTask('default', ['jshint', 'coffee', 'browserify']);

};
