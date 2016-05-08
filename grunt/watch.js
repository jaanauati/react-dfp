module.exports = {
    scripts: {
        files: [ 'js/{**/,}*.{js,jsx}' ],
        tasks: [ 'build' ],
        options: {
            spawn: false
        }
    }
};
