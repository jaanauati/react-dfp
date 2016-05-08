
module.exports = {
    dist: {
        files: {
            'build/app.js': [ 'js/*.{jsx,js}' ]
        },
        options: {
            browserifyOptions: {
                debug: true, // sourcemaps
                extensions: [ '.jsx', '.js' ] // consider jsx files as modules
            },
            transform: [["babelify", { presets: ["react", "es2015"] }]]
        }
    }
};