const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const { assessmentScenarios } = require('../form-inputs');
const formName = 'assessment';
const harness = new TestHarness();

describe('Assessment form test', () => {
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

    it('assessment form can be loaded', async () => {
        await harness.loadForm(`${formName}`);
        expect(harness.state.pageContent).to.include(`${formName}`);
    });

    // Test that the Patient is not available for Assessment
    it('assessment form can be filled and successfully saved - medication', async () => {
        // Load the assessment form and fill in
        const result = await harness.fillForm(formName, ...assessmentScenarios.medication);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            'reporter.group_report.reaction': 'Yes'
        });
        
    });
    // Test that the Patient is not available for Assessment
    it('assessment form can be filled and successfully saved - Poor Quality Medicine', async () => {
        // Load the assessment form and fill in
        const result = await harness.fillForm(formName, ...assessmentScenarios.poorQuality);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            'reporter.group_report.medicine': 'Yes'
        });
        
    });
    it('assessment form can be filled and successfully saved - Within Within the Immunization Window', async () => {
        // Load the assessment form and fill in
        const result = await harness.fillForm(formName, ...assessmentScenarios.immunization);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            'reporter.group_report.immunization_time': 'Within the Immunization Window'
        });
    });

    it('assessment form can be filled and successfully saved - Death Case Reported', async () => {
        // Load the assessment form and fill in
        const result = await harness.fillForm(formName, ...assessmentScenarios.death);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            'reporter.group_report.death': 'Yes',
        });
        
    });
 
   
});
