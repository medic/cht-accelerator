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
 
    const confirmReferral = async (creationDate) => {
        harness.setNow(creationDate.plus({ day: 5 }).toISODate());
        expect(await harness.getTasks({ name: 'chw-follow-up' })).lengthOf(0); 
    };  
    it('Task when a household member is referred to a facility', async () => {
        const creationDate = now.minus({ day: 1 });
        const result = await harness.fillForm('padr', ...tasksScenario.patientReferred(creationDate.toISODate()));
        expect(result.errors).to.be.empty;
        await confirmReferral(creationDate);
    }); 
   

});
