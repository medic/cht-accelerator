const { expect } = require('chai');
const TestRunner = require('cht-conf-test-harness');
const { householdMember } = require('../form-inputs');
const { CONTACT_TYPES } = require('../../shared-extras');
const harness = new TestRunner();
describe('Household Member registration form', () => {
  before(() => harness.start());
  after(() => harness.stop());
  beforeEach(
    async () => {
      await harness.clear();
    });
  afterEach(() => expect(harness.consoleErrors).to.be.empty);
  it('should successfully create a household member with correct details', async() => {
    const result = await harness.fillContactCreateForm(CONTACT_TYPES.HOUSEHOLD_MEMBER, ...householdMember.ok);
    expect(result.errors).to.be.empty;
    expect(result.contacts).to.have.lengthOf(1);
    expect(result.contacts.filter((contact) => contact.contact_type === CONTACT_TYPES.HOUSEHOLD_MEMBER).length === 1).to.be.true;
    expect(result.contacts[0]).to.deep.include({
      name: householdMember.ok[0][0],
      sex: householdMember.ok[0][1],
      age_set: householdMember.ok[0][2],
      dob_known: householdMember.ok[0][3],
      date_of_birth: householdMember.ok[0][4],
      phone: householdMember.ok[0][5],
      secondary_phone: householdMember.ok[0][6],
      relationship_to_primary_caregiver: householdMember.ok[0][7]
    });
  });
});
