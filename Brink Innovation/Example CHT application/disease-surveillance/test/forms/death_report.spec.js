const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const formName = 'death_report';
const harness = new TestHarness();
const {deathReportScenario} = require('../forms/form_inputs')

describe('Death Report Form Test', () => {
    before(async () => {
        return await harness.start();
    });
    after(async () => {
        return await harness.stop();
    });
    beforeEach(async () => {
        return await harness.clear();
    });
    afterEach(() => {
        expect(harness.consoleErrors).to.be.empty;
    });

    it(`${formName} form can be loaded`, async () => {
        await harness.loadForm(`${formName}`);
        expect(harness.state.pageContent).to.include(`${formName}`);
    });
    it(`${formName} form filled when death date is not greater than today`, async () => {
        const result = await harness.fillForm(`${formName}`, [...deathReportScenario.reportedDeath]);
        expect(result.errors).to.be.empty;
        expect(result.report.fields).to.deep.include({
            patient_death_details: {
                date_of_death: '2024-02-05',
                place_of_death: 'health_facility',
                death_information: 'Died while sleeping',
                meta: {
                    household_uuid: 'household_id',
                    patient_id: '',
                    patient_uuid: 'patient_id',
                    source: 'action',
                    source_id: ''
                      }
              
              },      
        })
    });
});