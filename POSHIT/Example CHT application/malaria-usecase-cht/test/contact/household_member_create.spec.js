const { expect } = require('chai');
const TestRunner = require('cht-conf-test-harness');
const { householdMember } = require('../form-inputs');
const { CONTACT_TYPES } = require('../../shared-extras');
const { DateTime } = require('luxon');

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
    const result = await harness.fillContactCreateForm(CONTACT_TYPES.HOUSEHOLD_MEMBER, ...householdMember.ok('male', DateTime.local().minus({ years: 32, months: 2 }).toJSDate()));
    expect(result.errors).to.be.empty;
    expect(result.contacts).to.have.lengthOf(1);
    expect(result.contacts.filter((contact) => contact.contact_type === CONTACT_TYPES.HOUSEHOLD_MEMBER).length === 1).to.be.true;
    expect(result.contacts[0]).to.deep.include({
      date_of_birth: householdMember.ok('male', DateTime.local().minus({years: 32, months: 2}).toFormat('yyyy-MM-dd'))[0][4],
    });
  });
});
