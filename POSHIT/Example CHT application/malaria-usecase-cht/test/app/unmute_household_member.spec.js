const { expect } = require('chai');
const TestRunner = require('cht-conf-test-harness');
const { unMuteHouseholdMemberScenarios } = require('../form-inputs');
const { FORMS } = require('../../shared-extras');
const harness = new TestRunner();
describe('Unmute household member form', () => {
  before(() => harness.start());
  after(() => harness.stop());
  beforeEach(
    async () => {
      await harness.clear();
    });
  afterEach(() => expect(harness.consoleErrors).to.be.empty);
  it('should successfully create an unmute_household_member report', async () => {
    const result = await harness.fillForm(FORMS.UNMUTE_HOUSEHOLD_MEMBER, ...unMuteHouseholdMemberScenarios.withReason);
    expect(result.errors).to.be.empty;
    expect(result.report.fields.group_unmute_household_member).to.deep.include({
      reason_for_unmuting: unMuteHouseholdMemberScenarios.withReason[0][0],
    });
  });
});
