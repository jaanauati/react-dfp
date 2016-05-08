module.exports = {
  serve: {
    files: {
        src: [
            './build/app.js',
        ]
    },
    options: {
      watchTask: true,
      watchOptions: {
          ignored: ''
      },
      server: {
          baseDir: '.'
      }
    }
  }
};
