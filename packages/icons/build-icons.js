// Written in JS for now
const svgr = require('@svgr/core').default;
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { exec } = require('child_process');
const xmlParser = require('xml2json');
const traverse = require('traverse');

const distDir = './dist/';
const srcDir = './src/';

const colorMap = {
  colorPrimary: '#0B4566',
  colorSecondary: '#00A4EC',
  colorDarkGreyMain: '#86A2B3',
  colorWhite: '#FFF',
  colorError: '#FD3F75',
  colorWarning: '#FFC20A',
};

const template = ({ template }, opts, { imports, componentName, jsx }) =>
  template.smart({ plugins: ['typescript'] }).ast`
        ${imports}
        ${'\n'}
        const ${componentName} = (props?: React.SVGProps<SVGSVGElement>): React.ReactElement<SVGElement> => ${jsx};
        export default ${componentName};
    `;

if (fs.existsSync(distDir)) fs.rmdirSync(distDir, { recursive: true });
fs.mkdirSync(distDir);

const svgFiles = glob.sync(path.join(srcDir, '/**.svg'));

// Generate TSX components with template
console.log('🔧 Generating...');
for (const svgFile of svgFiles) {
  const svg = fs.readFileSync(svgFile, 'utf-8');
  const componentName = path
    .parse(svgFile)
    .name.split('-')
    .map((substr) => substr.charAt(0).toUpperCase() + substr.slice(1))
    .join('');

  const { svg: svgObj } = JSON.parse(xmlParser.toJson(svg));

  const updatedSVG = traverse(svgObj).map(function (x) {
    if (!this.isLeaf) return;
    if (!Object.keys(colorMap).includes(x)) return;

    this.update(colorMap[x]);
  });

  const newSvg = xmlParser.toXml(JSON.stringify({ svg: { ...updatedSVG } }));
  const height = svgObj.height ?? 40;
  const width = svgObj.width ?? 40;
  const componentCode = svgr.sync(
    newSvg,
    {
      template,
      plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
      svgoConfig: {
        plugins: [{ removeXMLNS: { active: true } }],
      },
      svgProps: {
        height,
        width,
        color: colorMap['colorPrimary'],
        viewBox: `0 0 ${height} ${width}`,
      },
    },
    { componentName }
  );
  const filePath = path.join(distDir, `${componentName}.tsx`);
  fs.writeFileSync(filePath, componentCode);

  fs.appendFileSync(
    path.join(distDir, 'index.ts'),
    `export { default as ${componentName} } from './${componentName}';\n`
  );

  console.log(`${svgFile} -> ${filePath}`);
}

// Compile TS for dist
console.log('🔧 Compiling...');
exec(`tsc`, () => {
  const tsxFiles = glob.sync(path.join(distDir, '/**.tsx'));

  for (const tsxFile of tsxFiles) {
    console.log(
      `${tsxFile} -> ${tsxFile.replace('tsx', 'js')} & ${tsxFile.replace(
        'tsx',
        'd.ts'
      )}`
    );
    fs.unlink(tsxFile, (err) => {
      if (err) throw Error(err);
    });
  }

  const indexTsPath = path.join(distDir, 'index.ts');
  fs.unlink(indexTsPath, (err) => {
    if (err) throw Error(err);
    console.log(`Removed ${indexTsPath}`);
  });
});
