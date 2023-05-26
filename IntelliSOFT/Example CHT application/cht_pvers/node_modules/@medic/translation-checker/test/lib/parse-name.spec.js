const { assert, expect } = require('chai');
const {isLanguageCodeValid, translationFileNames} = require('../../lib/parse-name');

describe('translationFileNames', () => {

  const data = 'test/lib/data/parse-name';

  it('when nonexistent dir provided cannot-access-dir error expected', async () => {
    try {
      await translationFileNames('/dir/that/does/not/exist');
      assert.fail('Expected Error to be thrown.');
    } catch (e) {
      expect(e.name).to.be.eq('TranslationException');
      expect(e.errors.length).to.be.eq(1);
      expect(e.errors[0].error).to.be.eq('cannot-access-dir');
    }
  });

  it('when called with right path only translation files are returned', async () => {
    const files = await translationFileNames(`${data}/dir-some-translations`);
    expect(files).to.be.an('array').to.include.all.members([
      'messages-en.properties',
      'messages-es.properties'
    ]);
    expect(files).to.be.an('array').that.not.includes(
      '.gitignore'
    );
  });

  it('when invalid filenames error expected', async () => {
    try {
      await translationFileNames(`${data}/wrong-filename-translations`);
      assert.fail('Expected Error to be thrown.');
    } catch (e) {
      expect(e.name).to.be.eq('TranslationException');
      expect(e.errors.length).to.be.eq(1);
      const error = e.errors[0];
      expect(error.error).to.be.eq('wrong-file-name');
      expect(error.message).to.have.string('messages-$a.properties');
      expect(error.message).to.have.string('messages-abc.properties');
      expect(error.message).to.have.string('messages-bad(code.properties');
      expect(error.message).to.not.have.string('messages-en.properties');
      expect(error.message).to.not.have.string('messages-ex.properties');
    }
  });

  it('when valid language code passed true expected',  () => {
    expect(isLanguageCodeValid('es')).to.be.true;
    expect(isLanguageCodeValid('en')).to.be.true;
    expect(isLanguageCodeValid('it')).to.be.true;
    expect(isLanguageCodeValid('xx')).to.be.true; // Not recognized ISO
  });

  it('when invalid language code passed false expected',  () => {
    expect(isLanguageCodeValid('bad)code')).to.be.false;
    expect(isLanguageCodeValid('e s')).to.be.false;
  });
});
