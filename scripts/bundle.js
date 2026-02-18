const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

async function build() {
  try {
    // Bundle the code
    await esbuild.build({
      entryPoints: [path.join(__dirname, '../dist/index.js')],
      bundle: true,
      platform: 'node',
      target: 'node18',
      outfile: path.join(__dirname, '../dist/mctl.js'),
      external: ['prompts'], // Keep prompts external for now
    });

    // Add shebang to the bundled file
    const bundlePath = path.join(__dirname, '../dist/mctl.js');
    const content = fs.readFileSync(bundlePath, 'utf-8');
    const withShebang = `#!/usr/bin/env node\n${content}`;
    fs.writeFileSync(bundlePath, withShebang);

    // Make executable on Unix systems
    if (process.platform !== 'win32') {
      fs.chmodSync(bundlePath, '755');
    }

    console.log('✅ Bundle created successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build();
