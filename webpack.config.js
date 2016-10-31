module.exports = {
  entry: './src/backend.js',

  output: {
    path: __dirname,
    filename: 'dist/index.js',
    libraryTarget: 'umd',
    library: 'react-dnd-jquery-backend'
  },

  externals: {
    "jquery": "jQuery"
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['react', 'es2015', 'stage-0']
        }
      }
    ]
  }
};
