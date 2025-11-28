const path = require('path');
const fs = require('fs-extra');

function findInDir(dir, filter, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.lstatSync(filePath);

    if (stat.isDirectory()) {
      findInDir(filePath, filter, fileList);
    } else if (filter.test(filePath)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function toWebPath(absFilePath) {
  // Convert absolute file path -> browser-safe path
  const relToProject = path.relative(process.cwd(), absFilePath);
  return '/' + relToProject.split(path.sep).join('/');
}

const createInitScript = (cachePort, isTS = null) => {
  const processFiles = isTS
    ? /\.canvest\.(ts|tsx)$/
    : /\.canvest\.(js|jsx)$/;

  const canvestDir = path.join(process.cwd(), 'canvest');
  const canvestFiles = findInDir(canvestDir, processFiles);

  let importTests = '';

  // import canvest.init.js or .ts if exists
  const initPath = path.join(
    canvestDir,
    `canvest.init.${isTS ? 'ts' : 'js'}`
  );
  if (fs.existsSync(initPath)) {
    importTests += `import '${toWebPath(initPath)}';\n`;
  }

  // import all .canvest.* files
  for (const file of canvestFiles) {
    importTests += `import '${toWebPath(file)}';\n`;
  }

  const runContent = `${importTests}
initCanvest({ cachePort: ${cachePort} });`;

  const outputFile = path.join(__dirname, '../canvestInitScript/run.js');
  fs.writeFileSync(outputFile, runContent);
};

exports.createInitScript = createInitScript;