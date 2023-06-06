const { expect } = require('chai');
const Harness = require('cht-conf-test-harness');
const { now } = require('../../shared');
const harness = new Harness();

describe('Target: households-registered-all-time', () => {

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

  it('should compute households-registered-all-time', async () => {
    const [target] = await harness.getTargets({ type: 'households-registered-all-time' });
    expect(target.value).to.include({ total: 1 });

    const household = await harness.fillContactForm('household',
      [
        'Imeja',
        'male',
        'yes',
        new Date(now.setFullYear(now.getFullYear() - 10)).toISOString().slice(0, 10),
        '',
        '',
        'none'
      ],
      ['no']
    );
    expect(household.errors).to.be.empty;

    const [target2] = await harness.getTargets({ type: 'households-registered-all-time' });
    expect(target2).to.nested.include({ 'value.pass': 2, 'value.total': 2});
  });

});
