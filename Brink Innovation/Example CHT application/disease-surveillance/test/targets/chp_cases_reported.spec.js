const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const formName = 'household_member_assessment';
const harness = new TestHarness();
const { houseHoldAssessmentScenarios } = require('../forms/form_inputs');

describe('Suspicious Cholera Case Reported Targets', () => {
  before(async () => {
    return await harness.start();
  });
  after(async () => {
    return await harness.stop();
  });
  beforeEach(async () => {
    const result = await harness.fillForm(`${formName}`, [
        ...Object.values(houseHoldAssessmentScenarios.choleraCaseDefinition),
      ]);
      expect(result.errors).to.be.empty;
      expect(result.report.fields).to.deep.include({
        patient_name: 'Household Head',
        household_member_assessment: {
          initial_symptoms: 'yes',
          crucial_symptoms: 'acute watery diarrhea',
          duration: '4',
          symptoms: '',
          dehydration: 'yes',
          muscle_cramps: 'no',
          rapid_heart_rate: 'yes',
          low_blood_pressure: 'no',
          shock: 'no',
          patient_well_being: 'worsening',
        },
      });
  });
  afterEach(() => {
    expect(harness.consoleErrors).to.be.empty;
  });

  it(`Referrals Given Incremented When ${formName} Report Is Submitted`, async () => {
    const referralsGiven = await harness.getTargets({ type: 'referrals_given_target' });
    expect(referralsGiven).to.have.lengthOf(1);
    expect(referralsGiven[0].value).to.nested.include({pass: 1, total: 1, percent: 100});
  });

  it(`Reported Cholera Cases Incremented When ${formName} Report Is Submitted`, async () => {
    const referralsGiven = await harness.getTargets({ type: 'cholera-cases-reported' });
    expect(referralsGiven).to.have.lengthOf(1);
    expect(referralsGiven[0].value).to.nested.include({pass: 1, total: 1});
 });
});
