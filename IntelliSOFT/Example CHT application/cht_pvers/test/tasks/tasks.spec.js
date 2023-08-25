const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const { tasksScenario} = require('../form-inputs');
const harness = new TestHarness();
const { DateTime } = require('luxon');
const now = DateTime.now();

describe('Tasks', function () {
    this.timeout(10000);
    before(async () => await harness.start());
    after(async () => await harness.stop());
    beforeEach(async () => {
        await harness.clear();
        return await harness.setNow(now.toISODate());
    });
    afterEach(() => expect(harness.consoleErrors).to.be.empty);

    const showAssessment = async (creationDate) => {
        harness.setNow(creationDate.plus({ day: 7 }).toISODate());
        expect(await harness.getTasks({ name: 'padr-after-assessment' })).lengthOf(0); 
    };
    const confirmReferral = async (creationDate) => {
        harness.setNow(creationDate.plus({ day: 5 }).toISODate());
        expect(await harness.getTasks({ name: 'chw-follow-up' })).lengthOf(0); 
    };
    const deathCase = async (creationDate) => {
        harness.setNow(creationDate.plus({ day: 5 }).toISODate());
        expect(await harness.getTasks({ name: 'supervisor-death-confirmation' })).lengthOf(0); 
    };
    const patientNotAvailable = async (creationDate) => {
        harness.setNow(creationDate.plus({ day: 5 }).toISODate());
        expect(await harness.getTasks({ name: 'supervisor-padr-follow-up' })).lengthOf(0); 
    };
    const noRecovery = async (creationDate) => {
        harness.setNow(creationDate.plus({ day: 5 }).toISODate());
        expect(await harness.getTasks({ name: 'no-recovery-after-referral' })).lengthOf(0); 
    };
    
    

    it('Task when a household member is assessed', async () => {
        const creationDate = now.minus({ day: 1 });
        const result = await harness.fillForm('assessment', ...tasksScenario.householdmembervisit(creationDate.toISODate()));
        expect(result.errors).to.be.empty;
        await showAssessment(creationDate);
    });
    it('Task when a household member is referred to a facility', async () => {
        const creationDate = now.minus({ day: 1 });
        const result = await harness.fillForm('padr', ...tasksScenario.patientReferred(creationDate.toISODate()));
        expect(result.errors).to.be.empty;
        await confirmReferral(creationDate);
    });
    it('Task to confirm death of a household member', async () => {
        const creationDate = now.minus({ day: 1 });
        const result = await harness.fillForm('assessment', ...tasksScenario.deathCase(creationDate.toISODate()));
        expect(result.errors).to.be.empty;
        await deathCase(creationDate);
    });
    it('Task for the Supervisor to revisit the household since the patient was not available for assessment', async () => {
        const creationDate = now.minus({ day: 1 });
        const result = await harness.fillForm('padr', ...tasksScenario.patientNotAvailable(creationDate.toISODate()));
        expect(result.errors).to.be.empty;
        await patientNotAvailable(creationDate);
    });
    it('Task to report no recovery after the facility referral', async () => {
        const creationDate = now.minus({ day: 1 });
        const result = await harness.fillForm('chw_follow', ...tasksScenario.noRecovery(creationDate.toISODate()));
        expect(result.errors).to.be.empty;
        await noRecovery(creationDate);
    });
 
   

});
