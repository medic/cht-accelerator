const usage = () => console.log(`
npm run benchmark -- [options]

Options:
	iterations=N  number of iterations to run for each file
        skip=IMPLEMENTATION don't run benchmarks for a particular implementation

EXAMPLE:
	npm run benchmark -- --skip=json2xml --iterations=1000
`);

const fs = require('fs');
const path = require('path');

// Implementations
const pojo2xml = require('../src/index');
const json2xml = require('json2xml');
const xml2js = require('xml2js');
const xml2jsBuilder = new xml2js.Builder({ renderOpts:{ pretty:false } });

const implementations = {
  pojo2xml: input => {
    pojo2xml(input);
  },
  json2xml: input => {
    json2xml(input);
  },
  xml2js: input => {
    xml2jsBuilder.buildObject(input);
  },
};

const results = {
  ephemeral: {},
};

const args = process.argv.slice(2);
let iterations = 1;

let argI = -1;
while(++argI < args.length) {
  const arg = args[argI];
  if(arg === '--help') {
    usage();
    process.exit();
  } else if(arg.startsWith('--iterations=')) {
    iterations = Number.parseInt(args[argI].substring('--iterations='.length), 10);
  } else if(arg.startsWith('--skip=')) {
    delete implementations[arg.substring('--skip='.length)];
  }
}

console.log(`
JS -> XML BENCHMARK
===================
For more information (including how to disable slow algorithms):

	npm run benchmark -- --help

RUNNING ${iterations} iterations for ${Object.keys(implementations)}…`);
Object.keys(implementations).forEach(name => runFor(name, implementations[name]));

console.log(`
-------
RESULTS
${JSON.stringify(results, null, 2)}
`);

function runFor(implementationName, fn) {
  console.log(`BENCHMARKING: ${implementationName}…`);

  const ephemeralTestRoot = 'test/data/ephemeral';
  fs.readdirSync(ephemeralTestRoot)
    .filter(f => f.endsWith('.json'))
    .forEach(jsonTestFile => {
      if(!results.ephemeral[jsonTestFile]) results.ephemeral[jsonTestFile] = {};

      let count = iterations;
      const start = Date.now();
      while(count-- > 0) {
        const json = JSON.parse(readFile(ephemeralTestRoot, jsonTestFile));
        fn(json);
      }
      const duration = Date.now() - start;

      results.ephemeral[jsonTestFile][implementationName] = duration;
    });
}

function readFile(...pathParts) {
  return fs.readFileSync(path.join(...pathParts), { encoding:'utf8' });
}
