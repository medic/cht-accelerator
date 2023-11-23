const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const { tasksScenario} = require('../form-inputs');
const harness = new TestHarness();
const { DateTime } = require('luxon');
const now = DateTime.now();

describe('CHW Supervisor Revisit Task', function () {
    this.timeout(10000);
    before(async () => await harness.start());
    after(async () => await harness.stop());
    beforeEach(async () => {
        await harness.clear();
        return await harness.setNow(now.toISODate());
    });
    afterEach(() => expect(harness.consoleErrors).to.be.empty);
 
    const patientNotAvailable = async (creationDate) => {
        harness.setNow(creationDate.plus({ day: 5 }).toISODate());
        expect(await harness.getTasks({ name: 'supervisor-padr-follow-up' })).lengthOf(0); 
    };
   
     it('Task for the Supervisor to revisit the household since the patient was not available for assessment', async () => {
        const creationDate = now.minus({ day: 1 });
        const result = await harness.fillForm('padr', ...tasksScenario.patientNotAvailable(creationDate.toISODate()));
        expect(result.errors).to.be.empty;
        await patientNotAvailable(creationDate);
    }); 

});
