// Optional: rebuild the vendored runtime after npm installs its pinned dev dependencies.
const path=require('path'),{buildSync}=require('esbuild');
buildSync({entryPoints:[path.resolve(__dirname,'../src/runtime-entry.js')],outfile:path.resolve(__dirname,'../vendor/coastal-engine.min.js'),bundle:true,minify:true,format:'iife',globalName:'Coastal',platform:'browser',target:'es2020',legalComments:'inline',nodePaths:(process.env.NODE_PATH||'').split(path.delimiter).filter(Boolean)});
