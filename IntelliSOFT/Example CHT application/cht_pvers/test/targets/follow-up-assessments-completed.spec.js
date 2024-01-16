const { expect } = require('chai');
const Harness = require('cht-conf-test-harness');
const harness = new Harness();

describe('Target: Total follow up assessments completed', () => {

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
 
    it('should compute total follow up assessments completed', async () => {
        const [target] = await harness.getTargets({ type: 'follow-up-assessments-completed' });
        expect(target.value).to.include({ total: 0 });

        const padr = await harness.fillForm('chw_follow',
            ['Yes', 'Yes']
        );
        expect(padr.errors).to.be.empty;

        const [target2] = await harness.getTargets({ type: 'follow-up-assessments-completed' });
        expect(target2).to.nested.include({ 'value.pass': 1, 'value.total': 1 });
    }); 
});
