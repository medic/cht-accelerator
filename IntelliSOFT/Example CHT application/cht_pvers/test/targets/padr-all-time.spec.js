const { expect } = require('chai');
const Harness = require('cht-conf-test-harness');
const harness = new Harness();

describe('Target: Total adverse drug reaction Reports', () => {

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

    it('should compute total adverse drug reaction Reports', async () => {
        const [target] = await harness.getTargets({ type: 'padr-all-time' });
        expect(target.value).to.include({ total: 0 });

        const padr = await harness.fillForm('padr',
            ['Yes'],
            ['Japheth Kiprotich', '+254700123432', 'Self', 'Mombasa', 'Reaction'],
            ['Vomiting_or_diarrhea,Dizziness_or_drowsiness', '', '2023-08-23', 'Yes'],
            ['1', 'Medicine', 'Manufacturer', 'Location', '2023-08-20', '2023-08-23', '2024-10-20'],
            ['Death'],
        );
        expect(padr.errors).to.be.empty;

        const [target2] = await harness.getTargets({ type: 'padr-all-time' });
        expect(target2).to.nested.include({ 'value.pass': 1, 'value.total': 1 });
    }); 

});
