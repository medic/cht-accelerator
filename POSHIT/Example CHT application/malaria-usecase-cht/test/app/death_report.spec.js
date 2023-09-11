const { expect } = require('chai');
const TestRunner = require('cht-conf-test-harness');
const { DateTime } = require('luxon');
const { deathReportScenarios } = require('../form-inputs');
const harnessDefaults = require('../../harness.defaults.json');
const harness = new TestRunner();
const today = DateTime.local().toISODate();
const patientDoc = harnessDefaults.docs.find(doc => doc._id === harnessDefaults.subject);
describe('Death Report form', () => {
  before(() => harness.start());
  after(() => harness.stop());
  beforeEach(
    async() => {
      await harness.clear();
    });
  afterEach(() => expect(harness.consoleErrors).to.be.empty);
  it('should save data when today is the date of death', async() => {
    const result = await harness.fillForm('death_report', ...deathReportScenarios.withDeathDate(today));
    const report = deathReportScenarios.withDeathDate(today);
    expect(result.errors).to.be.empty;
    expect(result.report.fields.patient_death_details).to.deep.include({
      date_of_death: today,
      place_of_death: report[0][1],
      death_information: report[0][2],
      meta: {
        household_uuid: patientDoc.parent._id,
        patient_uuid: 'patient_id',
        patient_id: '',
        source: 'action',
        source_id: ''
      }
    });
  });
});
