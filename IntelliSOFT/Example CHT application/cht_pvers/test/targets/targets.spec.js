const { expect } = require('chai');
const Harness = require('cht-conf-test-harness');
const harness = new Harness();

describe('Target: Total Adverse Drug Reaction Reports', () => {

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
    it('should compute total poor quality medicine', async () => {
        const [target] = await harness.getTargets({ type: 'poor-quality-padr-all-time' });
        expect(target.value).to.include({ total: 0 });

        const padr = await harness.fillForm('padr',
            ['Yes'],
            ['Japheth Kiprotich', '+254700123432', 'Self', 'Mombasa', 'Medicine'],
            ['The_label_looks_wrong'],
            ['1', 'Medicine', 'Manufacturer', 'Location', '2023-08-20', '2023-08-23', '2024-10-20'],
            ['Unknown'],
        );
        expect(padr.errors).to.be.empty;

        const [target2] = await harness.getTargets({ type: 'poor-quality-padr-all-time' });
        expect(target2).to.nested.include({ 'value.pass': 1, 'value.total': 1 });
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
    it('should compute total referrals completed', async () => {
        const [target] = await harness.getTargets({ type: 'completed-referrals' });
        expect(target.value).to.include({ total: 0 });

        const padr = await harness.fillForm('padr',
        ['Yes'],
        ['Japheth Kiprotich', '+254700123432', 'Self', 'Mombasa', 'Medicine'],
        ['The_label_looks_wrong'],
        ['1', 'Medicine', 'Manufacturer', 'Location', '2023-08-20', '2023-08-23', '2024-10-20'],
        ['Unknown'],
        );
        expect(padr.errors).to.be.empty;

        const [target2] = await harness.getTargets({ type: 'completed-referrals' });
        expect(target2).to.nested.include({ 'value.pass': 1, 'value.total': 1 });
    });
    it('should compute total adverse drug reactions identified', async () => {
        const [target] = await harness.getTargets({ type: 'adverse-drug-reactions-identified' });
        expect(target.value).to.include({ total: 0 });

        const padr = await harness.fillForm('assessment',
        ['Yes', 'Past 7 days', 'Yes', 'Beyond 7 days', 'Yes', 'Yes', 'No']
        );
        expect(padr.errors).to.be.empty;

        const [target2] = await harness.getTargets({ type: 'adverse-drug-reactions-identified' });
        expect(target2).to.nested.include({ 'value.pass': 1, 'value.total': 1 });
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
    it('should compute total number of recoveries reported', async () => {
        const [target] = await harness.getTargets({ type: 'total-number-of-recoveries-reported' });
        expect(target.value).to.include({ total: 0 });

        const padr = await harness.fillForm('padr',
        ['Yes'],
        ['Japheth Kiprotich', '+254700123432', 'Self', 'Mombasa', 'Reaction'],
        ['Vomiting_or_diarrhea,Dizziness_or_drowsiness', '', '2023-08-23', 'Yes'],
        ['1', 'Medicine', 'Manufacturer', 'Location', '2023-08-20', '2023-08-23', '2024-10-20'],
        ['Recovered/Resolved'],
        );
        expect(padr.errors).to.be.empty;

        const [target2] = await harness.getTargets({ type: 'total-number-of-recoveries-reported' });
        expect(target2).to.nested.include({ 'value.pass': 1, 'value.total': 1 });
    });

});
