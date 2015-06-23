module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    coffee: {
      compile: {
        options: { bare: "true" },
        files: {
          "www/slotmachine.js" : "coffee/**/*"
        }
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'slotmachine.min.js': 'www/slotmachine.js'
        }
      }
    },
    exec: {
    }
  })
  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  // Default task(s).
  grunt.registerTask('default', ['coffee', 'uglify']);
}
