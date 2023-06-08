const { expect } = require('chai');
const TestRunner = require('cht-conf-test-harness');
const { household } = require('../form-inputs');
const { CONTACT_TYPES } = require('../../shared-extras');
const harness = new TestRunner();
describe('Household creation form', () => {
  before(() => harness.start());
  after(() => harness.stop());
  beforeEach(
    async () => {
      await harness.clear();
    });
  it('should successfully create a household with correct details', async() => {
    const result = await harness.fillContactCreateForm(CONTACT_TYPES.HOUSEHOLD, ...household.ok);
    expect(result.errors).to.be.empty;
    expect(result.contacts).to.have.lengthOf(1);
    expect(result.contacts.filter((contact) => contact.contact_type === CONTACT_TYPES.HOUSEHOLD).length === 1).to.be.true;
    expect(result.contacts[0]).to.deep.include({
      name: household.ok[0][0]
    });
  });
});
