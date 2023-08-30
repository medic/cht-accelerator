const { expect } = require('chai');
const Harness = require('cht-conf-test-harness');
const harness = new Harness();

describe('Target: Total poor quality medicine identified', () => {

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
    it('should compute total poor quality medicine identified', async () => {
        const [target] = await harness.getTargets({ type: 'poor-quality-medicine-identified' });
        expect(target.value).to.include({ total: 0 });

        const padr = await harness.fillForm('assessment',
        ['Yes', 'Past 7 days', 'Yes', 'Beyond 7 days', 'Yes', 'Yes', 'No']
        );
        expect(padr.errors).to.be.empty;

        const [target2] = await harness.getTargets({ type: 'poor-quality-medicine-identified' });
        expect(target2).to.nested.include({ 'value.pass': 1, 'value.total': 1 });
    });
   

});
