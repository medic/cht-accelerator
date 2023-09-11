const chai = require('chai');
const expect = chai.expect;
const TestRunner = require('cht-conf-test-harness');
const { householdAssessment } = require('../form-inputs');
const { FORMS, TARGETS } = require('../../shared-extras');
const { DateTime } = require('luxon');
const harness = new TestRunner();


describe('Household with LLINs Target', () => {
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

  it('should trigger incrementing of the target', async () => {
    //test target loads and is initially zero
    let householdsWithLLIN = await harness.getTargets({ type: TARGETS.HOUSEHOLDS_GTE_2_LLIN });
    expect(householdsWithLLIN).to.have.property('length', 1);
    expect(householdsWithLLIN[0]).to.nested.include({ 'value.pass': 0, 'value.total': 0, 'value.percent': 0 });
    //test target increments after form is filled
    const householdAssessmentResult = await harness.fillForm(FORMS.HOUSEHOLD_ASSESSMENT, [...householdAssessment.captureResultComplete]);
    expect(householdAssessmentResult.errors).to.be.empty;
    householdsWithLLIN = await harness.getTargets({ type: TARGETS.HOUSEHOLDS_GTE_2_LLIN });
    expect(householdsWithLLIN).to.have.property('length', 1);
    expect(householdsWithLLIN[0]).to.nested.include({ 'value.pass': 1, 'value.total': 1, 'value.percent': 100 });
  });

  it('should reset target every beginning of the month', async () => {
    let householdsWithLLIN;
    //increment target
    const householdAssessmentResult = await harness.fillForm(FORMS.HOUSEHOLD_ASSESSMENT, [...householdAssessment.captureResultComplete]);
    expect(householdAssessmentResult.errors).to.be.empty;
    householdsWithLLIN = await harness.getTargets({ type: TARGETS.HOUSEHOLDS_GTE_2_LLIN });
    expect(householdsWithLLIN).to.have.property('length', 1);
    expect(householdsWithLLIN[0]).to.nested.include({ 'value.pass': 1, 'value.total': 1, 'value.percent': 100 });
    // set date to next month
    harness.setNow(DateTime.local().endOf('month').endOf('day').plus({ days: 1 }).toISODate());
    // check that targets reset
    householdsWithLLIN = await harness.getTargets({ type: TARGETS.HOUSEHOLDS_GTE_2_LLIN });
    expect(householdsWithLLIN).to.have.property('length', 1);
    expect(householdsWithLLIN[0]).to.nested.include({ 'value.pass': 0, 'value.total': 0, 'value.percent': 0 });
  });

  it('should not increment target if llins < 2', async () => {
    const householdAssessmentResult = await harness.fillForm(FORMS.HOUSEHOLD_ASSESSMENT, [...householdAssessment.captureResultLowLLN]);
    expect(householdAssessmentResult.errors).to.be.empty;
    const householdsWithLLIN = await harness.getTargets({ type: TARGETS.HOUSEHOLDS_GTE_2_LLIN });
    expect(householdsWithLLIN).to.have.property('length', 1);
    expect(householdsWithLLIN[0]).to.nested.include({ 'value.pass': 0, 'value.total': 1, 'value.percent': 0 });
  });
});
