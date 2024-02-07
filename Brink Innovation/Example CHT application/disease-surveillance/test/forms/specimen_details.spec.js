const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const formName = 'specimen_details';
const harness = new TestHarness();
const {specimenFormScenarios} = require('../forms/form_inputs')

describe('Specimen Details Form Test', () => {
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
    it(`${formName} form can be filled for positive cholera case`, async () => {
        const result = await harness.fillForm(`${formName}`, [...specimenFormScenarios.page1positiveCholeraCase],[...specimenFormScenarios.page2positiveCholeraCase]);   
        expect(result.errors).to.be.empty;    
        expect(result.report.fields).to.deep.include({
            patient_name: 'Household Head',
            cholera_specimen: { availability: 'yes', follow_up_date: '2024-02-05' },
            specimen_details_group: {
                specimen_type: 'both',
                specimen_id: 'SPEC01',
                result: 'positive',
                more_specimen_details: ''
            },

        })
    });
    it(`${formName} form filled for victim not reported to the hospital  `, async () => {
        const result = await harness.fillForm(`${formName}`, [...specimenFormScenarios.untestCholeraCase]);   
        expect(result.errors).to.be.empty;    
        expect(result.report.fields).to.deep.include({
            patient_name: 'Household Head',
            cholera_specimen: { availability: 'no'}           

        })
    });
    
});



