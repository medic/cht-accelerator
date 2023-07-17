const { expect } = require('chai');
const TestRunner = require('cht-conf-test-harness');
const { pregnancyRegistrationScenarios } = require('../form-inputs');
const harness = new TestRunner();
const {DateTime} = require('luxon');
const { FORMS } = require('../../shared-extras');

describe('Pregnancy Registration Form', () => {
  before(() => harness.start());
  after(() => harness.stop());
  beforeEach(
    async () => {
      await harness.clear();
    });
  afterEach(() => expect(harness.consoleErrors).to.be.empty);

  it('should successfully create a report given inputs for a contact that is not pregnant', async() => {
    const result = await harness.fillForm(FORMS.PREGNANCY_REGISTRATION, ...pregnancyRegistrationScenarios.notPregnant);
    expect(result.errors).to.be.empty;
  });

  it('should successfully create a report for inputs suggestive of pregnancy confirmation referral after 3 days', async () => {
    const result = await harness.fillForm(FORMS.PREGNANCY_REGISTRATION, ...pregnancyRegistrationScenarios.pregnancyNotConfirmed(DateTime.local().plus({days: 3}).toISODate()));

    expect(result.errors).to.be.empty;
    expect(result.report.fields).to.deep.include({
      patient_name: 'Patient Name',
      pregnancy_confirmation_date: DateTime.local().plus({days: 3}).toISODate()
    });
  });

  it('should successfully create a report for a pregnancy confirmed with  follow up after 30 days', async () => {
    const result = await harness.fillForm(FORMS.PREGNANCY_REGISTRATION, ...pregnancyRegistrationScenarios.pregnancyNotConfirmed(DateTime.local().plus({days: 30}).toISODate()));

    expect(result.errors).to.be.empty;
    expect(result.report.fields).to.deep.include({
      patient_name: 'Patient Name',
      pregnancy_follow_up_date: DateTime.local().plus({days: 30}).toISODate()
    });
  });
});
