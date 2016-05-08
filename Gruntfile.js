'use strict';

module.exports = function(grunt) {
    // determine time to complete tasks
    require('time-grunt')(grunt);

    // load all grunt tasks using load-grunt-config
    require('load-grunt-config')(grunt, {

        init: true,
        data: {
            // path to Grunt file for exclusion
            gruntfile: 'Gruntfile.js',
            // generalize the module information for banner output
            banner: '/**\n' + ' * NGS Project: <%= package.name %> - v<%= package.version %>\n' +
                  ' * Description: <%= package.description %>\n' +
                  ' * Date Built: <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                  ' * Copyright (c) <%= grunt.template.today("yyyy") %>' +
                  '  | <%= package.author.name %>;\n' + '**/\n'
        },
        loadGruntTasks: {
            pattern: [ 'grunt-*', '@*/grunt-*', 'gruntify-*' ]
        }

    });
};
