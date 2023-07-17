const { expect } = require('chai');
const TestRunner = require('cht-conf-test-harness');
const { unmuteHouseholdScenarios } = require('../form-inputs');
const { FORMS } = require('../../shared-extras');
const harness = new TestRunner();
describe('Unmute household form', () => {
  before(() => harness.start());
  after(() => harness.stop());
  beforeEach(
    async () => {
      await harness.clear();
    });
  afterEach(() => expect(harness.consoleErrors).to.be.empty);
  it('should successfully create a unmute household report', async () => {
    const result = await harness.fillForm(FORMS.UNMUTE_HOUSEHOLD, ...unmuteHouseholdScenarios.withReason);
    expect(result.errors).to.be.empty;
    expect(result.report.fields.group_unmute_household).to.deep.include({
      reason_for_unmuting: unmuteHouseholdScenarios.withReason[0][0]
    });
  });
  it('should successfully create a unmute household report when reason for unmuting is other', async () => {
    const result = await harness.fillForm(FORMS.UNMUTE_HOUSEHOLD, ...unmuteHouseholdScenarios.withOtherReason);
    expect(result.errors).to.be.empty;
    expect(result.report.fields.group_unmute_household).to.deep.include({
      reason_for_unmuting: unmuteHouseholdScenarios.withOtherReason[0][0],
      other_reason_for_unmuting: unmuteHouseholdScenarios.withOtherReason[0][1]
    });
  });
});
