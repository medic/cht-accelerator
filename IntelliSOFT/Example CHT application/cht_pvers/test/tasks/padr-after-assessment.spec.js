const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const { tasksScenario} = require('../form-inputs');
const harness = new TestHarness();
const { DateTime } = require('luxon');
const now = DateTime.now();

describe('Household Member Visit Task', function () {
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

    it('Task when a household member is assessed', async () => {
        const creationDate = now.minus({ day: 1 });
        const result = await harness.fillForm('assessment', ...tasksScenario.householdmembervisit(creationDate.toISODate()));
        expect(result.errors).to.be.empty;
        await showAssessment(creationDate);
    });
   
});
