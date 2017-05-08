const timeGrunt = require('time-grunt');
const loadGruntConfig = require('load-grunt-config');

module.exports = function gruntFile(grunt) {
  // determine time to complete tasks
  timeGrunt(grunt);

  // load all grunt tasks using load-grunt-config
  loadGruntConfig(grunt, {

    init: true,
    data: {
            // path to Grunt file for exclusion
      gruntfile: 'Gruntfile.js',
            // generalize the module information for banner output
      banner: '/**\n * NGS Project: <%= package.name %> - v<%= package.version %>\n' +
                  ' * Description: <%= package.description %>\n' +
                  ' * Date Built: <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                  ' * Copyright (c) <%= grunt.template.today("yyyy") %>' +
                  '  | <%= package.author.name %>;\n**/\n',
    },
    loadGruntTasks: {
      pattern: ['grunt-*', '@*/grunt-*', 'gruntify-*'],
    },

  });
};
