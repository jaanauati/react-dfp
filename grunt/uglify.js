module.exports = {
    options: {
        banner: '<%= banner %>'
    },
    build: {
        files: {
            './build/<%= package.name %>.min.js': './build/<%= package.name %>.js'
        }
    }
};
