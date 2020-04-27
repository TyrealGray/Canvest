const path = require('path');
const fs = require('fs-extra')

const defaultBabelOptions = {
	presets: ['@babel/preset-env'],
	env: {
		test: {
			plugins: ['@babel/plugin-transform-runtime'],
		},
	},
};

let scriptLoaderPath = null;
if(fs.existsSync(path.join(__dirname,'node_modules','script-loader'))){
	scriptLoaderPath = path.join(__dirname,'node_modules','script-loader')
}
else {
	scriptLoaderPath = path.join(process.cwd(),'node_modules','script-loader');
}

//...JSON.parse(fs.readFileSync(path.resolve(__dirname, '../.babelrc'))),

module.exports = {
	entry: [path.join(__dirname, './script/init.js'),path.join(__dirname, './script/run.js')],
	devtool: 'inline-source-map',
	mode: 'development',
	output: {
		filename: 'index.js',
		path: __dirname,
	},
	devServer: {
		contentBase: path.join(__dirname),
		open: true,
	},
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /(node_modules)/,
				loader: 'babel-loader',
				options: defaultBabelOptions,
			},
			{
				test: /\.exec\.js$/,
				use: [ scriptLoaderPath ]
			}
		],
	},
};