const { expect } = require('chai');
const TestRunner = require('cht-conf-test-harness');
const {DateTime} = require('luxon');
const { assessment } = require('../form-inputs');
const { FORMS } = require('../../shared-extras');
const harness = new TestRunner();

describe('Household Condition Card', () => {
  before(() => harness.start());
  after(async () => { return await harness.stop(); });
  beforeEach(async () => {
    await harness.clear();
  });
  afterEach(() => {
    expect(harness.consoleErrors).to.be.empty;
  });

  it('should show malaria assessment summary and date of next visit', async () => {
    // Load the pregnancy form and fill in
    const result = await harness.fillForm(FORMS.HOUSEHOLD_ASSESSMENT, ...assessment.provisionRDT(DateTime.local().plus({days: 2})));

    // Verify that the form successfully got submitted
    expect(result.errors).to.be.empty;

    // Verify condition card
    const contactSummary = await harness.getContactSummary();
    expect(contactSummary.cards).to.have.property('length', 2);
    const householdSummaryCard = contactSummary.cards.find(card => card.label === 'contact.profile.household');
    const fields = householdSummaryCard.fields;
    expect(fields.find(field => field.label === 'contact.profile.malaria_prone')).to.deep.include(
      {
        label: 'contact.profile.malaria_prone',
        value: 'Yes',
      });
    expect(fields.find(field => field.label === 'contact.profile.next_visit')).to.deep.include({
      label: 'contact.profile.next_visit',
      value: DateTime.local().plus({days: 2}).toISODate(),
      filter: 'simpleDate'
    });
  });
});