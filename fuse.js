const fs = require('fs-extra');
const { DateTime } = require('luxon');
const {
  EnvPlugin,
  FuseBox,
  QuantumPlugin,
  WebIndexPlugin,
  JSONPlugin,
} = require('fuse-box');
const GraphQLPlugin = require('fuse-box-graphql-plugin');
const path = require('path');
const FBT = require('fuse-box-typechecker');

const { GOOGLE_CLIENT_ID, GC_URL } = process.env;
const isProduction =
  process.env.NODE_ENV === 'production' || process.argv[2] === 'dist';

// copy assets
fs.copySync('./src/assets', './dist/public/assets', {
  overwrite: true,
  preserveTimestamps: true,
});

// prep index.html template
const htmlPath = path.resolve('src', 'index.html');
const htmlFile = fs.readFileSync(htmlPath, 'utf8');

if (process.argv[2] === 'server') {
  const serverFuse = FuseBox.init({
    sourceMaps: false,
    homeDir: 'src/',
    target: 'server@esnext',
    output: 'dist/$name.js',
    // allowSyntheticDefaultImports: true,
    plugins: [
      EnvPlugin({ NODE_ENV: isProduction ? 'production' : 'development' }),
      JSONPlugin(),
      ['.graphql|.gql', GraphQLPlugin()],
    ],
  });

  serverFuse.bundle('server').instructions('> server.ts');
  serverFuse.run();
} else {
  // get typechecker
  const typechecker = FBT.TypeHelper({
    tsConfig: '../tsconfig.json',
    name: 'src',
    basePath: './src',
    tsLint: '../tslint.json',
    yellowOnLint: true,
    shortenFilenames: true,
  });

  // create thread
  typechecker.createThread();

  const runTypeChecker = (quit) => {
    // same color..
    console.log('\x1b[36m%s\x1b[0m', 'app bundled- running type check');

    // call thread (both are called right away, result comes later)
    typechecker.inspectCodeWithWorker({
      ...typechecker.options,
      quit,
      type: quit ? null : 'watch',
    });
    typechecker.printResultWithWorker();
  };
  // fuse config
  const clientFuse = FuseBox.init({
    cache: !isProduction,
    sourceMaps: true,
    homeDir: 'src/',
    target: 'browser@es5', // stay at es5 because uglify-es is broken
    output: 'dist/public/$name.js',
    allowSyntheticDefaultImports: true,
    plugins: [
      EnvPlugin({
        NODE_ENV: isProduction ? 'production' : 'development',
        GC_URL,
        GOOGLE_CLIENT_ID,
        BUILD: DateTime.local().toFormat('yyLLddHHmmss'),
      }),
      WebIndexPlugin({
        title: 'help out with us',
        path: 'js',
        templateString: htmlFile.replace(
          '{GOOGLE_CLIENT_ID}',
          GOOGLE_CLIENT_ID,
        ),
      }),
      ['.graphql|.gql', GraphQLPlugin()],
      isProduction &&
        QuantumPlugin({
          uglify: true,
          treeshake: true,
          bakeApiIntoBundle: true, //'vendor',
          removeExportsInterop: false,
          processPolyfill: true, // fix in 3.6.0 ?
        }),
    ],
  });

  let bundler;

  if (true || isProduction) {
    clientFuse.bundle('vendor').instructions('~ client.tsx');
    bundler = clientFuse
      .bundle('app')
      .instructions('!> [client.tsx] + queries/*');
  } else {
    bundler = clientFuse.bundle('app').instructions('> client.tsx');
  }

  if (isProduction) {
    bundler.completed(() => {
      console.log('\x1b[36m%s\x1b[0m', 'client bundled');
      // run the type checking
      runTypeChecker(true);
    });
  } else {
    clientFuse.dev({
      socketURI: 'wss://0.0.0.0:4444',
      port: 4444,
      httpServer: false,
      hmr: true,
    }); // launch hmr server

    //   vendorBundler.hmr({ reload: false }).watch();
    bundler
      .hmr({ reload: false })
      .watch()
      .completed(() => {
        console.log('\x1b[36m%s\x1b[0m', 'client bundled');
        // run the type checking
        runTypeChecker(false);
      });
    require('./dist/server');
  }
  clientFuse.run();
}
