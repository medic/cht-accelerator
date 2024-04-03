const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const { chwFollowUpScenarios } = require('../form-inputs');
const formName = 'chw_follow';
const harness = new TestHarness();

describe('CHP Follow Up form test', () => {
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

    it('CHP Follow Up  form can be loaded', async () => {
        await harness.loadForm(`${formName}`);
        expect(harness.state.pageContent).to.include(`${formName}`);
    });

    it('CHP Follow Up  form can be filled and successfully saved - Patient visited the facility and fully recovered', async () => {
        // Load the CHW Follow Up  form and fill in
        const result = await harness.fillForm(formName, ...chwFollowUpScenarios.visitedfaciltyrecovered);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            'reporter.group_report.visit': 'Yes'
        });
        
    });
    it('CHP Follow Up  form can be filled and successfully saved - Patient visited the facility and never recovered', async () => {
        // Load the CHW Follow Up  form and fill in
        const result = await harness.fillForm(formName, ...chwFollowUpScenarios.visitedfaciltyneverrecovered);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            'reporter.group_report.fully_recovered': 'No'
        });
        
    });

    it('CHW Follow Up  form can be filled and successfully saved - Patient failed to visit the facility but fully recovered', async () => {
        // Load the CHW Follow Up  form and fill in
        const result = await harness.fillForm(formName, ...chwFollowUpScenarios.fullyrecovered);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            'reporter.group_report.status': 'Patient recovered'
        });
    });

    it('CHW Follow Up  form can be filled and successfully saved - Patient failed to visit the facility and never recovered', async () => {
        // Load the CHW Follow Up  form and fill in
        const result = await harness.fillForm(formName, ...chwFollowUpScenarios.neverrecovered);
        // Verify that the form successfully got submitted
        expect(result.errors).to.be.empty;

        // Verify some attributes on the resulting report
        expect(result.report.fields).to.nested.include({
            'reporter.group_report.status': 'Patient has not recovered',
        });
        
    });
 
   
});
