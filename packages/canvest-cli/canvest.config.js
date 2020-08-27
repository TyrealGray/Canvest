const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const argv = require('yargs').argv;

const isDev = !fs.existsSync(path.join(__dirname, '../../@canvest'));
let canvestTSFolderPath = '';


if (isDev) {
	canvestTSFolderPath = path.join(__dirname, '../canvest-ts');
}

let canvestTS = null;

try {
	let canvestTSPath = '';
	if (isDev) {
		canvestTSPath = canvestTSFolderPath;
	} else {
		canvestTSPath = path.join(process.cwd(), 'node_modules', '@canvest/canvest-ts');
	}

	if (argv.ts) {
		canvestTS = fs.existsSync(canvestTSPath);
	}

} catch (e) {
	canvestTS = null;
}

const rules = [];
const extensions = ['*', '.js', '.jsx'];
const plugins = [];

rules.push({
	test: /\.(js|jsx|ts|tsx)$/,
	use: {
		loader: 'istanbul-instrumenter-loader',
		options: { esModules: true },
	},
	enforce: 'post',
	exclude: /(node_modules|canvest-dev-server|canvestInitScript|\.canvest\.(js|ts|jsx|tsx))/,
});

if (canvestTS) {
	console.log(chalk.yellow('loading ts-loader for Canvest'));

	extensions.push('.tsx', '.ts');
	let tsLoaderRule = {
		test: /\.tsx?$/,
		use: [
			{
				loader: `${isDev ? path.join(canvestTSFolderPath, '/node_modules/') : ''}ts-loader`,
				options: {
					transpileOnly: true,
				},
			},
		],
	};

	rules.push(tsLoaderRule);

	let tsPluginPath = '';
	if (isDev) {
		tsPluginPath = path.join(canvestTSFolderPath, 'node_modules/tsconfig-paths-webpack-plugin');
	} else {
		tsPluginPath = 'tsconfig-paths-webpack-plugin';
	}

	const TsconfigPathsPlugin = require(tsPluginPath);

	plugins.push(new TsconfigPathsPlugin({ configFile: path.join(process.cwd(), argv.ts) }));

} else {
	console.log(chalk.yellow('loading @babel/preset-env for Canvest'));
	let defaultBabelOptions = {
		presets: [
			[
				'@babel/preset-env',
				{
					useBuiltIns: 'usage',
					corejs: 3,
				},
			],
		],
	};

	if (fs.existsSync(path.join(process.cwd(), '.babelrc'))) {
		defaultBabelOptions = JSON.parse(fs.readFileSync(path.join(process.cwd(), '.babelrc')));
	}

	if (fs.existsSync(path.join(process.cwd(), '.babelrc.json'))) {
		defaultBabelOptions = JSON.parse(fs.readFileSync(path.join(process.cwd(), '.babelrc.json')));
	}

	const babelLoaderRule = {
		test: /\.(js|jsx)$/,
		exclude: /(node_modules|canvest-dev-server\/client)/,
		loader: 'babel-loader',
		options: defaultBabelOptions,
	};

	rules.push(babelLoaderRule);
}

const contentBase = [__dirname];

if (__dirname !== process.cwd()) {
	contentBase.push(process.cwd());
}

module.exports = {
	entry: [path.join(__dirname, './canvestInitScript/init.js'), path.join(__dirname, './canvestInitScript/run.js')],
	devtool: 'inline-source-map',
	mode: 'development',
	output: {
		filename: 'bundle.js',
		path: __dirname,
	},
	devServer: {
		contentBase: contentBase,
		open: true,
	},
	module: {
		rules,
	},
	resolve: {
		extensions,
		plugins,
	},
};