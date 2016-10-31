module.exports = {
  entry: './src/backend.js',

  output: {
    path: __dirname,
    filename: 'dist/index.js',
    libraryTarget: 'umd',
    library: 'react-dnd-jquery-backend',
    umdNamedDefine: true
  },

  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel'
      }
    ]
  }
};
