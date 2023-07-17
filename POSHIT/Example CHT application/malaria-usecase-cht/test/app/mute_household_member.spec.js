const { expect } = require('chai');
const TestRunner = require('cht-conf-test-harness');
const { muteHouseholdMemberScenarios } = require('../form-inputs');
const { FORMS } = require('../../shared-extras');
const harness = new TestRunner();
describe('Mute household member form', () => {
  before(() => harness.start());
  after(() => harness.stop());
  beforeEach(
    async () => {
      await harness.clear();
    });
  afterEach(() => expect(harness.consoleErrors).to.be.empty);
  it('should successfully create a mute_household_member report', async () => {
    const result = await harness.fillForm(FORMS.MUTE_HOUSEHOLD_MEMBER, ...muteHouseholdMemberScenarios.withReason);
    expect(result.errors).to.be.empty;
    expect(result.report.fields.group_mute_household_member).to.deep.include({
      reason_for_muting: muteHouseholdMemberScenarios.withReason[0][0],
    });
  });
  it('should successfully create a mute_household report when reason for muting is other', async () => {
    const result = await harness.fillForm(FORMS.MUTE_HOUSEHOLD_MEMBER, ...muteHouseholdMemberScenarios.withOtherReason);
    expect(result.errors).to.be.empty;
    expect(result.report.fields.group_mute_household_member).to.deep.include({
      reason_for_muting: muteHouseholdMemberScenarios.withOtherReason[0][0],
      other_reason_for_muting: muteHouseholdMemberScenarios.withOtherReason[0][1]
    });
  });
});
