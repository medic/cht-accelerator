const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const inputs = require('../form-inputs');
const harness = new TestHarness({
  subject: 'patient_id1'
});

describe('patient relation - guardian', () => {

  before(async () => await harness.start());

  after(async () => await harness.stop());

  beforeEach(async () => await harness.clear());
  
  afterEach(() => { expect(harness.consoleErrors).to.be.empty; });
 
  it('relation is a guardian', async () => {
    const result = await harness.fillContactForm('padr', ['reportername','+254700123456', 'guardian', 'Mombasa', 'reaction', 'Vomiting or Diarrhoea', 'No Other Side Effects', '2023-04-30', 'yes','1','Medicine Name','Manufacturer Name','Location','2023-04-30','2023-05-10','2023-09-30','1','recovered/resolved']);
    expect(result.errors).to.be.empty;
    
    const summary = await harness.getContactSummary(result.contacts[0]);
    const guardianField = summary.fields.find(f => f.inputName === 'reporter.group_report.relation');
    expect(guardianField).to.exist;
    expect(guardianField.value).to.equal('guardian');
    
  });
 
});