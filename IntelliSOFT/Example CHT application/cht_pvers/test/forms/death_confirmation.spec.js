const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const { deathConfirmationScenarios } = require('../form-inputs');
const formName = 'death_confirmation';
const harness = new TestHarness();

describe('Death Confirmation form test', () => {
    before(async () => {
        return await harness.start();
    });
    after(async () => {
        return await harness.stop();
    });
    beforeEach(async () => {
        await harness.clear();
        // set harnes date to Jan 1st 2023
        return await harness.setNow('2023-08-24');
    });
    afterEach(() => {
        expect(harness.consoleErrors).to.be.empty;
    });

    it('Death Confirmation  form can be loaded', async () => {
        await harness.loadForm(`${formName}`);
        expect(harness.state.pageContent).to.include(`${formName}`);
    });

    it('Death Confirmation  form can be filled and successfully saved - Patient died at the facility', async () => {
        // Load the Death Confirmation  form and fill in
        const result = await harness.fillForm(formName, ...deathConfirmationScenarios.facility);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            'death_details.place_of_death': 'Health Facility'
        });
        
    });
    it('Death Confirmation  form can be filled and successfully saved - Patient died at home', async () => {
        // Load the Death Confirmation  form and fill in
        const result = await harness.fillForm(formName, ...deathConfirmationScenarios.home);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            'death_details.place_of_death': 'Home'
        });
        
    });
 
   
});
