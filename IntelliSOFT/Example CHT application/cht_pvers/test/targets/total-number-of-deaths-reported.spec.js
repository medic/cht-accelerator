const { expect } = require('chai');
const Harness = require('cht-conf-test-harness');
const harness = new Harness();

describe('Target: total number of deaths reported', () => {

    before(async () => {
        return await harness.start();
    });

    after(async () => {
        return await harness.stop();
    });

    beforeEach(async () => {
        await harness.clear();
    });

    afterEach(() => {
        expect(harness.consoleErrors).to.be.empty;
    });
 
    it('should compute total number of deaths reported', async () => {
        const [target] = await harness.getTargets({ type: 'total-number-of-deaths-reported' });
        expect(target.value).to.include({ total: 0 });

        const padr = await harness.fillForm('death_confirmation',
        ['2023-08-24', 'Home','No other description to be given']
        );
        expect(padr.errors).to.be.empty;

        const [target2] = await harness.getTargets({ type: 'total-number-of-deaths-reported' });
        expect(target2).to.nested.include({ 'value.pass': 1, 'value.total': 1 });
    });
   

});
