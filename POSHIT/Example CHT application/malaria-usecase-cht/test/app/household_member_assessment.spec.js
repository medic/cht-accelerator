const { expect } = require('chai');
const TestRunner = require('cht-conf-test-harness');
const { memberAssessment } = require('../form-inputs.js');
const harness = new TestRunner();

describe('Household Member Assessment Form', () => {
  before(() => harness.start());
  after(() => harness.stop());
  beforeEach(
    async () => {
      await harness.clear();
    });
  afterEach(() => expect(harness.consoleErrors).to.be.empty);
  it('Should mark for referral if contact presents any of the symptoms or does not sleep under treated net', async () => {
    // Load the child under 5 assessment form and fill it accordingly
    const result = await harness.fillForm('household_member_assessment', ...memberAssessment.showSymptoms);
    // Verify that the form successfully got submitted
    expect(result.errors).to.be.empty;
    // Verify that refer to facility is positive
    expect(result.report.fields.group_household_member_assessment).to.deep.include({
      refer_to_facility: memberAssessment.showSymptoms.flat()[0],
    });
  });
});
