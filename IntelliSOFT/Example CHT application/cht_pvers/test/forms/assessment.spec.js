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
        return await harness.setNow(new Date());
    });
    afterEach(() => {
        expect(harness.consoleErrors).to.be.empty;
    });

    it('assessment form can be loaded', async () => {
        await harness.loadForm(`${formName}`);
        expect(harness.state.pageContent).to.include(`${formName}`);
    });

    // Test that the Patient is taking any medication
    it('assessment form can be filled and successfully saved - medication', async () => {
        // Load the assessment form and fill in
        const result = await harness.fillForm(formName, ...assessmentScenarios.medication);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            'reporter.group_report.group_report_adr.medication': 'Yes'
        });
        
    });
    // Test that a Poor Quality Medicine is reported
    it('assessment form can be filled and successfully saved - Poor Quality Medicine', async () => {
        // Load the assessment form and fill in
        const result = await harness.fillForm(formName, ...assessmentScenarios.poorQuality);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            'reporter.group_report.group_report_quality.medicine': 'Yes'
        });
        
    });
    it('assessment form can be filled and successfully saved - Within Within the Immunization Window', async () => {
        // Load the assessment form and fill in
        const result = await harness.fillForm(formName, ...assessmentScenarios.immunization);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            'reporter.group_report.group_report_adr.immunization_time': 'Within the Immunization Window'
        });
    });

    it('assessment form can be filled and successfully saved - Death Case Reported', async () => {
        // Load the assessment form and fill in
        const result = await harness.fillForm(formName, ...assessmentScenarios.death);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            'reporter.group_report.group_report_death.death': 'Yes',
        });
        
    });
 
   
});
