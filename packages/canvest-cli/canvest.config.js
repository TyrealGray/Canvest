const path = require('path');
const fs = require('fs-extra');

let defaultBabelOptions = {
	presets: [
		[
			"@babel/preset-env",
			{
				useBuiltIns: "usage",
				corejs: 3
			},
		],
		"@babel/preset-typescript"
	]
};

if (fs.existsSync(path.join(process.cwd(), '.babelrc'))) {
	defaultBabelOptions = JSON.parse(fs.readFileSync(path.join(process.cwd(), '.babelrc')));
}

if(fs.existsSync(path.join(process.cwd(), '.babelrc.json'))) {
	defaultBabelOptions = JSON.parse(fs.readFileSync(path.join(process.cwd(), '.babelrc.json')));
}

module.exports = {
	entry: [path.join(__dirname, './script/init.js'), path.join(__dirname, './script/run.js')],
	devtool: 'inline-source-map',
	mode: 'development',
	output: {
		filename: 'index.js',
		path: __dirname,
	},
	devServer: {
		contentBase: [path.join(process.cwd())],
		open: true
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx|tsx|ts)$/,
				exclude: /(node_modules|canvest-dev-server\/client)/,
				loader: 'babel-loader',
				options: defaultBabelOptions,
			}
		],
	},
	resolve: {
		extensions: ['*', '.js', '.jsx', '.tsx', '.ts'],
	},
};