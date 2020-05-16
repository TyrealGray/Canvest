const path = require('path');
const fs = require('fs-extra');

function findInDir (dir, filter, fileList = []) {
	const files = fs.readdirSync(dir);

	files.forEach((file) => {
		const filePath = path.join(dir, file);
		const fileStat = fs.lstatSync(filePath);

		if (fileStat.isDirectory()) {
			findInDir(filePath, filter, fileList);
		} else if (filter.test(filePath)) {
			let relativePath = filePath.replace(process.cwd(),'');

			fileList.push(relativePath);
		}
	});

	return fileList;
}



const createInitScript = (cachePort, isTS = null) => {
	const processFiles = isTS? /\.canvest.(js|jsx|ts|tsx)$/ : /\.canvest.(js|jsx)$/;
	const canvestFiles = findInDir(path.join(process.cwd(),'./canvest/'), processFiles);

	let importTests = '';
	canvestFiles.map((canvestFile) => {
		const filePath = canvestFile.replace(processFiles,'.canvest');
		importTests += `import '${path.join(process.cwd(),filePath)}';`;
	});

	const runContent = `${importTests}
	initCanvest({cachePort:${cachePort}});`;

	fs.writeFileSync(path.join(__dirname,'../script/run.js'), runContent);
};

exports.createInitScript = createInitScript;