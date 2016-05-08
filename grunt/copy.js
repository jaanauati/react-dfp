module.exports = {
    index: {
        src: 'src/index.html',
        dest: './index.html'
    },
    dist: {
        src: './build/<%= package.name %>.min.js',
        dest: './dist/<%= package.name %>.min.js'
    }
};
