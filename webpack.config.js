var path = require('path');

module.exports = [
    {
        mode: 'production',
        entry: './src/index.ts',
        devtool: 'source-map',
        module: {
            rules: [{
                test: /\.ts$/,
                use: 'ts-loader'
            }]
        },
        resolve: {
            extensions: [ '.ts', '.js' ]
        },
        output: {
            library: 'jinaga-visualizer',
            libraryTarget: 'amd',
            path: path.resolve(__dirname, './dist'),
            filename: 'jinaga-visualizer.js'
        }
    }
]