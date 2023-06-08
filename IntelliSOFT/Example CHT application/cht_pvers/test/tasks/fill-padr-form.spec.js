const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const formName = 'padr';
const { submissionScenario} = require('../form-inputs');
const harness = new TestHarness();
const { DateTime } = require('luxon');
const now = DateTime.now();

describe('Patient Registration Task', function () {
    this.timeout(10000);
    before(async () => await harness.start());
    after(async () => await harness.stop());
    beforeEach(async () => {
        await harness.clear();
        return await harness.setNow(now.toISODate());
    });
    afterEach(() => expect(harness.consoleErrors).to.be.empty);

    const validateSchedule = async (creationDate) => {
        harness.setNow(creationDate.plus({ day: 3 }).toISODate());
        expect(await harness.getTasks({ title: 'Patient Consultation' })).lengthOf(1); 
    };

    it('Consultation task appears on schedule triggered by contact creation', async () => {
        const creationDate = now.minus({ day: 1 });

        const result = await harness.fillForm(formName, ...submissionScenario.male(creationDate.toISODate()));
        expect(result.errors).to.be.empty;

        await validateSchedule(creationDate);
    });
 
   

});
