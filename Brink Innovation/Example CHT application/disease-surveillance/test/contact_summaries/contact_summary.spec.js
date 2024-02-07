const { expect } = require('chai');
const TestRunner = require('cht-conf-test-harness');
const { householdFormInputs } = require('../contact_summaries/summary_inputs');
const { CONTACT_TYPES } = require('../constants');
const harness = new TestRunner();
describe('Household Contact Creation', () => {
  before(() => harness.start());
  after(() => harness.stop());
  beforeEach(
    async () => {
      await harness.clear();
    });
 
  it('should successfully create a household with correct details', async() => {
    const result = await harness.fillContactCreateForm(
      CONTACT_TYPES.HOUSEHOLD,
      [...Object.values(householdFormInputs.createHouseholdPage1)], 
      [...Object.values(householdFormInputs.createHouseholdPage2)]
    );
    expect(result.errors).to.be.empty;    
    expect(result.contacts).to.have.lengthOf(2);
    expect(result.contacts.filter((contact) => contact.contact_type === CONTACT_TYPES.HOUSEHOLD).length === 1).to.be.true;
    expect(result.contacts[0]).to.deep.include({
      household_name: `${householdFormInputs.createHouseholdPage1.name_of_head} Household`,
      contact_type: CONTACT_TYPES.HOUSEHOLD
    });
    expect(result.contacts[1]).to.deep.include({
      contact_type: CONTACT_TYPES.HOUSEHOLD_CONTACT,
      name: householdFormInputs.createHouseholdPage1.name_of_head,
      sex: householdFormInputs.createHouseholdPage1.gender,
    });

    const contactSummary = await harness.getContactSummary();
    expect(contactSummary.fields).to.have.lengthOf(1);
    let field = contactSummary.fields[0];
    expect(field.label).to.equal('Household Head');
    expect(field.value).to.equal(householdFormInputs.createHouseholdPage1.name_of_head);
  });
});