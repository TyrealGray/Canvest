console.log('canvest cli');

const fs = require('fs');
const path = require('path');

function findInDir (dir, filter, fileList = []) {
	const files = fs.readdirSync(dir);

	files.forEach((file) => {
		const filePath = path.join(dir, file);
		const fileStat = fs.lstatSync(filePath);

		if (fileStat.isDirectory()) {
			findInDir(filePath, filter, fileList);
		} else if (filter.test(filePath)) {
			fileList.push(filePath.replace(process.cwd(),''));
		}
	});

	return fileList;
}

console.log(findInDir(path.join(process.cwd(),'./'),/\.js/));