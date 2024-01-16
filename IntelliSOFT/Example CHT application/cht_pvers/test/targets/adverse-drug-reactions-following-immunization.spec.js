const { expect } = require('chai');
const Harness = require('cht-conf-test-harness');
const harness = new Harness();

describe('Target: total adverse drug reactions following immunization', () => {

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

   
    it('should compute total adverse drug reactions following immunization', async () => {
        const [target] = await harness.getTargets({ type: 'adverse-drug-reactions-following-immunization' });
        expect(target.value).to.include({ total: 0 });

        const padr = await harness.fillForm('assessment',
        ['Yes', 'Past 7 days', 'Yes', 'Beyond 7 days', 'Yes', 'Yes', 'No']
        );
        expect(padr.errors).to.be.empty;

        const [target2] = await harness.getTargets({ type: 'adverse-drug-reactions-following-immunization' });
        expect(target2).to.nested.include({ 'value.pass': 1, 'value.total': 1 });
    }); 

});
