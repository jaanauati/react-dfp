module.exports = {
  dist: {
    files: [{
      expand: true,
      cwd: 'js',
      src: ['*.js'],
      dest: 'lib',
      ext: '.js',
    }],
    options: {
      sourceMap: false,
      presets: ['babel-preset-es2015', 'react'],
      plugins: ['transform-class-properties'],
    },
  },
};
