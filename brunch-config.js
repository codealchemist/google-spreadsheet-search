module.exports = {
  paths: {
    public: 'dist',
    watched: [
      'src/public'
    ]
  },
  files: {
    javascripts: {joinTo: 'app.js'},
    stylesheets: {joinTo: 'app.css'}
  },
  modules: {
    wrapper: 'commonjs',
    nameCleaner: path => path
      .replace('src/public/js/', '')
      .replace('src/public/lib/', '')
      .replace('min.', '')
      .replace(/\.js$/, '')
  },
  plugins: {
    babel: {
      ignore: '**/*.min.js',
      presets: [
        ['env', {
          targets: {
            browsers: ['last 2 versions', 'safari >= 7']
          }
        }]
      ],
      plugins: ['transform-export-extensions']
    }
  }
}
