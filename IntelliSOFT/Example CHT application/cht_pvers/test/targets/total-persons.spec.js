const { expect } = require('chai');
const Harness = require('cht-conf-test-harness');
const harness = new Harness();

describe('Target: people-registered-all-time', () => {

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

  it('should compute people-registered-all-time', async () => {
    const t = await harness.getTargets({ type: 'people-registered-all-time' });
    expect(t[0]).to.nested.include({ 'value.pass': 1, 'value.total': 1});

    const person = await harness.fillContactForm('person',
      [
        'name',
        'male', 
        'no',
        '15',
        '0',
        undefined,
        undefined,
        'none'
      ]
    );
    expect(person.errors).to.be.empty;

    person.contacts[0].parent = harness.subject.parent;
    const t2 = await harness.getTargets({ type: 'people-registered-all-time' });
    expect(t2[0]).to.nested.include({ 'value.pass': 2, 'value.total': 2});
  });

});
