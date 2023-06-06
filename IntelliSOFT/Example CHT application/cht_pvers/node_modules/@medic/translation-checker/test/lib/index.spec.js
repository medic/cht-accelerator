const { assert, expect } = require('chai');
const {checkTranslations} = require('../../lib/index');

describe('checkTranslations', () => {

  const data = 'test/lib/data/index';

  it('when nonexistent dir provided cannot-access-dir error expected', async () => {
    try {
      await checkTranslations('/dir/that/does/not/exist');
      assert.fail('Expected TranslationException to be thrown.');
    } catch (e) {
      expect(e.name).to.be.eq('TranslationException');
      expect(e.message).to.be.not.empty;
      expect(e.errors).to.be.not.empty;
      expect(e.errors[0].error).to.be.eq('cannot-access-dir');
    }
  });

  it('when right translations provided no error expected', async () => {
    const fileNames = await checkTranslations(`${data}/right-translations`);
    expect(fileNames).to.be.an('array').to.include.all.members([
      'messages-en.properties',
      'messages-es.properties'
    ]);
  });

  it('when right translations with operators provided no error expected', async () => {
    const fileNames = await checkTranslations(`${data}/right-translations-placeholders-with-operators`);
    expect(fileNames).to.be.an('array').to.include.all.members([
      'messages-en.properties',
      'messages-es.properties'
    ]);
  });

  it('when wrong messageformat translations error expected', async () => {
    try {
      await checkTranslations(`${data}/contains-messageformat-wrong`);
      assert.fail('Expected TranslationException to be thrown.');
    } catch (e) {
      expect(e.name).to.be.eq('TranslationException');
      expect(e.message).to.be.eq('Error trying to compile translations');
      expect(e.fileNames).to.include.all.members([
        'messages-en.properties',
        'messages-es.properties'
      ]);
      expect((e.errors || []).length).to.be.eq(1);
      expect(e.errors[0].error).to.be.eq('wrong-messageformat');
      expect(e.errors[0].lang).to.be.eq('en');
    }
  });

  it('when wrong messageformat but check disabled no error expected', async () => {
    await checkTranslations(
      `${data}/contains-messageformat-wrong`,
      {checkMessageformat: false}
    );
  });

  it('when wrong messageformat translations in selected lang error expected', async () => {
    try {
      await checkTranslations(
        `${data}/contains-messageformat-wrong`,
        { languages: ['en'] }
      );
    } catch (e) {
      expect((e.errors || []).length).to.be.eq(1);
      expect(e.errors[0]).to.deep.include({
        error: 'wrong-messageformat',
        lang: 'en',
        key: 'n.month2'
      });
    }
  });

  it('when wrong messageformat translations but not in selected lang no error expected', async () => {
    await checkTranslations(
      `${data}/contains-messageformat-wrong`,
      { languages: ['es'] }
    );
  });

  it('when empty translation error expected', async () => {
    try {
      await checkTranslations(`${data}/contains-empty-messages`);
      assert.fail('Expected TranslationException to be thrown.');
    } catch (e) {
      expect(e.name).to.be.eq('TranslationException');
      expect((e.errors || []).length).to.be.eq(1);
      expect(e.errors[0]).to.deep.include({
        error: 'empty-message',
        lang: 'en',
        key: 'empty.msg'
      });
    }
  });

  it('when empty translation but check disabled no error expected', async () => {
    await checkTranslations(
      `${data}/contains-empty-messages`,
      {checkEmpties: false}
    );
  });

  it('when {{ var || \'constant\' }} inside placeholder are used no error expected', async () => {
    await checkTranslations(
      `${data}/contains-placeholders-with-constants`,
    );
  });

  it('when {{ var || \'\' }} inside placeholder are used no error expected', async () => {
    await checkTranslations(
      `${data}/contains-placeholders-with-empty-constants`
    );
  });

  it('when escaped placeholders used no error expected', async () => {
    await checkTranslations(
      `${data}/constains-scaped-placeholders`,
    );
  });

  it('when placeholder found in translation but not in template error expected', async () => {
    try {
      await checkTranslations(`${data}/contains-wrong-placeholder`);
      assert.fail('Expected TranslationException to be thrown.');
    } catch (e) {
      expect(e.name).to.be.eq('TranslationException');
      expect((e.errors || []).length).to.be.eq(1);
      expect(e.errors[0]).to.deep.include({
        error: 'wrong-placeholder',
        lang: 'es',
        key: 'Number in month'
      });
    }
  });

  it('when placeholder found in translation but template does not have placeholders error expected', async () => {
    try {
      await checkTranslations(`${data}/contains-missed-placeholder`);
      assert.fail('Expected TranslationException to be thrown.');
    } catch (e) {
      expect(e.name).to.be.eq('TranslationException');
      expect((e.errors || []).length).to.be.eq(1);
      expect(e.errors[0]).to.deep.include({
        error: 'missed-placeholder',
        lang: 'es',
        key: 'hello'
      });
    }
  });

  it('when missed placeholder but checkPlaceholders is false no errors expected', async () => {
    await checkTranslations(
      `${data}/contains-missed-placeholder`,
      {checkPlaceholders: false}
    );
  });

  it('multiple errors are all captured in error raised', async () => {
    try {
      await checkTranslations(`${data}/contains-many-errors`);
      assert.fail('Expected TranslationException to be thrown.');
    } catch (e) {
      expect(e.name).to.be.eq('TranslationException');
      expect(e.errors).to.have.deep.members([
        {
          'lang': 'en',
          'error': 'wrong-messageformat',
          'key': 'n.month2',
          'message': 'Cannot compile \'en\' translation n.month2 = ' +
                     '\'{MONTHS, plural one{1 month} other{# months}}\' : Expected "," but "o" found.'
        },
        {
          'lang': 'es',
          'error': 'empty-message',
          'key': 'some.missed',
          'message': 'Empty message found for key \'some.missed\' in \'es\' translation'
        },
        {
          'lang': 'es',
          'error': 'wrong-messageformat',
          'key': 'n.month2',
          'message': 'Cannot compile \'es\' translation n.month2 = ' +
                     '\'{MONTHS, plural, one{1 month} other{# months}\' : Expected "=", "}", ' +
                     'or identifier but end of input found.'
        },
        {
          'lang': 'es',
          'error': 'wrong-placeholder',
          'key': 'some.wrong.placeholder1',
          'message': 'Cannot compile \'es\' translation with key \'some.wrong.placeholder1\' ' +
                     'has placeholders that do not match any in the base translation provided'
        }
      ]);
    }
  });
});
