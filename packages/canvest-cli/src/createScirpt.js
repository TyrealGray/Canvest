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



const createInitScript = () => {
	const canvestFiles = findInDir(path.join(process.cwd(),'./canvest/'),/\.canvest.(js|jsx|ts|tsx)$/);

	let importTests = '';
	canvestFiles.map((canvestFile) => {
		importTests += `import '${path.join(process.cwd(),canvestFile.replace(/\.canvest.(js|jsx|ts|tsx)$/,'.canvest'))}';`;
	});

	const runContent = `${importTests}
	initCanvest();`;

	fs.writeFileSync(path.join(__dirname,'../script/run.js'), runContent);
};

exports.createInitScript = createInitScript;