const path = require('path');
const fs = require('fs-extra');

let defaultBabelOptions = {
	presets: [
		[
			"@babel/preset-env",
			{
				useBuiltIns: "usage",
				corejs: 3
			}
		]
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
		contentBase: [path.join(__dirname), path.join(process.cwd())],
		open: true,
		quiet: true
	},
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /(node_modules|canvest-dev-server\/client)/,
				loader: 'babel-loader',
				options: defaultBabelOptions,
			}
		],
	}
};