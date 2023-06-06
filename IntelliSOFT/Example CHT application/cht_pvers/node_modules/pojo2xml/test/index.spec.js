const assert = require('chai').assert;
const fs = require('fs');
const path = require('path');

const pojo2xml = require('../src/index');

const TEST_DATA = [
  { in:'', expected:'' },

  { in:0, expected:'0' },
  { in:1, expected:'1' },

  { in:false, expected:'false' },
  { in:true, expected:'true' },

  { in:'a string', expected:'a string' },

  { in:null, expected:'' },
  { in:undefined, expected:'' },
  { in:{ a:'' }, expected:'<a/>' },
  { in:{ a:[''] }, expected:'<a/>' },
  { in:{ a:null }, expected:'<a/>' },
  { in:{ a:undefined }, expected:'<a/>' },

  { in:{ a:1, b:2 }, expected:'<a>1</a><b>2</b>' },
  { in:{ a:false }, expected:'<a>false</a>' },
  { in:{ a:{ b:[] } }, expected:'<a><b/></a>' },
  { in:{ a:{ b:[''] } }, expected:'<a><b/></a>' },
  { in:{ a:{ b:['', '', ''] } }, expected:'<a><b/></a>' },
  { in:{ root: { fields: [ { idx:1 }, { idx:2 } ] } }, expected:'<root><fields><idx>1</idx><idx>2</idx></fields></root>' },

  // XML special chars
  { in:'<<<>>>', expected:'&lt;&lt;&lt;&gt;&gt;&gt;' },
  { in:'""""', expected:'&quot;&quot;&quot;&quot;' },
  { in:'&&&&', expected:'&amp;&amp;&amp;&amp;' },
  { in:'s<p"e>c&i>a"l', expected:'s&lt;p&quot;e&gt;c&amp;i&gt;a&quot;l' },
];

const BAD_TEST_DATA = [
  { 'bad"': true },
  { 'bad&': true },
  { 'bad<': true },
  { 'bad>': true },
];

describe('pojo2xml', function() {
  TEST_DATA.forEach(t => {
    const expected = t.expected;
    it(`should convert ${JSON.stringify(t.in)} to ${expected}`, function() {
      assert.equal(pojo2xml(t.in), expected);
    });
  });

  BAD_TEST_DATA.forEach(input => {
    it(`Should throw exception for bad input: ${JSON.stringify(input)}`, function() {
      let caught = false;
      try {
        pojo2xml(input);
      } catch(e) {
        caught = true;
      }
      if(!caught) assert.fail('Expected exception to be thrown.');
    });
  });

  const ephemeralTestRoot = 'test/data/ephemeral';
  fs.readdirSync(ephemeralTestRoot)
    .filter(f => f.endsWith('.xml'))
    .forEach(xmlTestFile => {
      it(`should convert data in ${ephemeralTestRoot}/${xmlTestFile} as expected`, function() {
        // given
        const jsonTestFile = xmlTestFile.replace(/\.xml$/, '.json');
        const json = JSON.parse(readFile(ephemeralTestRoot, jsonTestFile));
        const expectedXml = readFile(ephemeralTestRoot, xmlTestFile);

        // expect
        assert.equal(pojo2xml(json), expectedXml);
      });
    });
});

function readFile(...pathParts) {
  return fs.readFileSync(path.join(...pathParts), { encoding:'utf8' });
}
