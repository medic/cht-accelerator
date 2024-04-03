const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const { referralScenarios } = require('../form-inputs');
const formName = 'follow';
const harness = new TestHarness();

describe('CHW Supervisor Confirmation form test', () => {
    before(async () => {
        return await harness.start();
    });
    after(async () => {
        return await harness.stop();
    });
    beforeEach(async () => {
        await harness.clear();
        // set harnes date to Jan 1st 2023
        return await harness.setNow('2024-04-03');
    });
    afterEach(() => {
        expect(harness.consoleErrors).to.be.empty;
    });

    it('CHW Supervisor Confirmation form can be loaded', async () => {
        await harness.loadForm(`${formName}`);
        expect(harness.state.pageContent).to.include(`${formName}`);
    });

    it('CHW Supervisor Confirmation form can be filled and successfully saved - Confirm Patient did not recover', async () => {
        // Load the CHW Supervisor Confirmation form and fill in
        const result = await harness.fillForm(formName, ...referralScenarios.confirm);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            'reporter.group_report.revisit': 'Yes'
        });
        
    });
    it('CHW Supervisor Confirmation form can be filled and successfully saved - Reject Patient did not recover', async () => {
        // Load the CHW Supervisor Confirmation form and fill in
        const result = await harness.fillForm(formName, ...referralScenarios.reject);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            'reporter.group_report.revisit': 'No'
        });
        
    });
 
   
});
