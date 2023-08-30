const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const { tasksScenario} = require('../form-inputs');
const harness = new TestHarness();
const { DateTime } = require('luxon');
const now = DateTime.now();

describe('No Recovery Follow Up Task', function () {
    this.timeout(10000);
    before(async () => await harness.start());
    after(async () => await harness.stop());
    beforeEach(async () => {
        await harness.clear();
        return await harness.setNow(now.toISODate());
    });
    afterEach(() => expect(harness.consoleErrors).to.be.empty);

     
    const noRecovery = async (creationDate) => {
        harness.setNow(creationDate.plus({ day: 5 }).toISODate());
        expect(await harness.getTasks({ name: 'no-recovery-after-referral' })).lengthOf(0); 
    };  
    it('Task to report no recovery after the facility referral', async () => {
        const creationDate = now.minus({ day: 1 });
        const result = await harness.fillForm('chw_follow', ...tasksScenario.noRecovery(creationDate.toISODate()));
        expect(result.errors).to.be.empty;
        await noRecovery(creationDate);
    });
 
   

});
