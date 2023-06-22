const { expect } = require('chai');
const TestRunner = require('cht-conf-test-harness');
const { muteHouseholdScenarios } = require('../form-inputs');
const { FORMS } = require('../../shared-extras');
const harness = new TestRunner();
describe('Mute household form', () => {
  before(() => harness.start());
  after(() => harness.stop());
  beforeEach(
    async () => {
      await harness.clear();
    });
  afterEach(() => expect(harness.consoleErrors).to.be.empty);
  it('should successfully create a mute_household report', async () => {
    const result = await harness.fillForm(FORMS.MUTE_HOUSEHOLD, ...muteHouseholdScenarios.withReason);
    expect(result.errors).to.be.empty;
    expect(result.report.fields.group.mute_household).to.deep.include({
      reason_for_muting: muteHouseholdScenarios.withReason[0][0]
    });
  });
});
