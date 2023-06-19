const { expect } = require('chai');
const TestRunner = require('cht-conf-test-harness');
const { childUnder5Assesmentment } = require('../form-inputs.js');
const harness = new TestRunner();

describe('Children under 5 Assessment Form', () => {
  before(() => harness.start());
  after(() => harness.stop());
  beforeEach(
    async () => {
      await harness.clear();
    });
  afterEach(() => expect(harness.consoleErrors).to.be.empty);
  it('Should not mark for referral if contact does not present with symptoms and sleeps under treated net', async () => {
    // Load the child under 5 assessment form and fill it accordingly
    const result = await harness.fillForm('children_under_assessment', ...childUnder5Assesmentment.treatedNetHealthy);

    // Verify that the form successfully got submitted
    expect(result.errors).to.be.empty;

    // Verify that refer to facility is no
    expect(result.report.fields.children_under_assessment).to.not.deep.include({
      refer_to_facility: childUnder5Assesmentment.treatedNetHealthy.flat()[3],
    });
  });
  it('Should mark for referral if contact presents any of the symptoms or does not sleep under treated net', async () => {
    // Load the child under 5 assessment form and fill it accordingly
    const result = await harness.fillForm('children_under_assessment', ...childUnder5Assesmentment.showSymptoms);

    // Verify that the form successfully got submitted
    expect(result.errors).to.be.empty;
    // Verify that refer to facility is positive
    expect(result.report.fields.children_under_assessment).to.not.deep.include({
      refer_to_facility: childUnder5Assesmentment.showSymptoms.flat()[11],
    });
  });
});
