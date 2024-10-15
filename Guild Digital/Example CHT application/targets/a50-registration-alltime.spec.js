const { expect } = require('chai');
const Harness = require('cht-conf-test-harness');
const harness = new Harness();

describe('Target: a50-registration-alltime', () => {

  before(async () => {
    return await harness.start();
  });

  after(async () => {
    return await harness.stop();
  });

  beforeEach(async () => {
    await harness.clear();
  });

  afterEach(() => {
    expect(harness.consoleErrors).to.be.empty;
  });

  it('should compute a50-registration-alltime target', async () => {
    const t = await harness.getTargets({ type: 'a50-registration-alltime' });
    console.log('Target:', t);

    if (t) {
      expect(t[0]).to.nested.include({ 'value.pass': 1, 'value.total': 1 });

      const person = await harness.fillContactForm('clinic', [
        'yes',
        'JAMES CAMERON',
        'notes',
        'male',
        '75',
        '0392345687',
        '0392344687',
        '2023-11-25',
        'foreigner',
        'congolese',
        '123',
      ]);
      expect(person.errors).to.be.empty;
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const t1 = await harness.getTargets({ type: 'a50-registration-alltime' });
      expect(t1[0]).to.nested.include({ 'value.pass': 2, 'value.total': 2 });

      // debugging
      console.log('Test Person:', person);
      console.log('Target after test person:', t1);
    }
  });

});
