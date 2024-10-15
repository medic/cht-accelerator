const TestRunner = require('cht-conf-test-harness');
const harness = new TestRunner();
const { expect } = require('chai');

describe('PNC form tests', () => {
    before(async () => { return await harness.start(); });
    after(async () => { return await harness.stop(); });
  
    beforeEach(
        async () => {
          await harness.clear();
          await harness.setNow('2024-10-13');
        });
        afterEach(() => {
            expect(harness.consoleErrors).to.be.empty;
          });
        
          it('wash-assessments this month  should show correct counts', async () => {
            //set the current date
            harness.setNow('2024-10-13');
        
            //assessment form filled
            const result = await harness.fillForm('wash_assessment', ['yes'], ['7']);
            expect(result.errors).to.be.empty;
        
            const thisMonth = await harness.getTargets({ type: 'wash-assessments this month' });
            expect(thisMonth).to.have.property('length', 1);
        
            //The number of assessments in this month should be 1
            expect(thisMonth[0]).to.nested.include({ 'value.pass': 1, 'value.total': 1 });
        
        
        
            const nextMonth = await harness.getTargets({ type: 'wash-assessments this month' });
            expect(nextMonth).to.have.property('length', 1);
        
            //The number of assessments this month now should be reset to 0
            expect(nextMonth[0]).to.nested.include({ 'value.pass': 0, 'value.total': 0 });
        
          });
        });