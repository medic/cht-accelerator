const { expect } = require('chai');
const Harness = require('cht-conf-test-harness');
const harness = new Harness();

describe('Target: hh-registration-alltime', () => {

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

  it('should compute hh-registration-alltime target', async () => {
    // Initial target fetch
    const initialTarget = await harness.getTargets({ type: 'hh-registration-alltime' });
    expect(initialTarget[0]).to.nested.include({ 'value.pass': 1, 'value.total': 1 });

    // Create a household without muting
    const household = await harness.fillContactForm('clinic', [
        'yes',
        'HOUSEHOLD ABC',
        'notes',
        'male',
        '45',
        '0392300687',
        '0392334687',
        '2023-11-25',
        'foreigner',
        'burundian',
        '123',
    ]);
    expect(household.errors).to.be.empty;
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Target after adding the household
    const targetAfterHousehold = await harness.getTargets({ type: 'hh-registration-alltime' });
    expect(targetAfterHousehold[0]).to.nested.include({ 'value.pass': 2, 'value.total': 2 });

    // debugging
    console.log('Household:', household);
    console.log('Target after household:', targetAfterHousehold);
  });

});
