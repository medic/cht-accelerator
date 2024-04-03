const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const { padrScenarios } = require('../form-inputs');
const formName = 'padr';
const harness = new TestHarness();

describe('PADR form test', () => {
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

    it('padr form can be loaded', async () => {
        await harness.loadForm(`${formName}`);
        expect(harness.state.pageContent).to.include(`${formName}`);
    });

    // Test that the Patient is not available for Assessment
    it('padr form can be filled and successfully saved - patient not available', async () => {
        // Load the padr form and fill in
        const result = await harness.fillForm(formName, ...padrScenarios.availability);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            'availability.availability_report.available': 'No'
        });
        
    });

    it('padr form can be filled and successfully saved - adverse drug reaction', async () => {
        // Load the padr form and fill in
        const result = await harness.fillForm(formName, ...padrScenarios.reaction);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            'availability.availability_report.available': 'Yes'
        });
    });

    it('padr form can be filled and successfully saved - poor quality medicine', async () => {
        // Load the padr form and fill in
        const result = await harness.fillForm(formName, ...padrScenarios.medicine);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            'form.reporter.group_quality.signs': 'The_label_looks_wrong',
        });
        
    });
 
   
});
