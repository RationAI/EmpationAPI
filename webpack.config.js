import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//const dev = process.env.NODE_ENV !== 'production'

export default {
    context: path.resolve(__dirname),
    devtool: 'inline-source-map', //dev ? 'eval-cheap-module-source-map' : 'source-map',
    entry: './src/index.ts',
    mode: 'development',
    module: {
        rules: [{
            test: /\.ts$/,
            loader: 'ts-loader',
            exclude: /node_modules/
        }]
    },
    output: {
        filename: 'empationapi.js',
        path: path.resolve(__dirname, 'dist'),
        library: 'EmpationAPI'
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '.js', '.json']
    },
};
