const { expect } = require('chai');
const TestRunner = require('cht-conf-test-harness');
const { communityHealthVolunteer } = require('../form-inputs');
const { CONTACT_TYPES } = require('../../shared-extras')
const harness = new TestRunner();
describe('Community Health Volunteer registration form', () => {
  before(() => harness.start());
  after(() => harness.stop());
  beforeEach(
    async () => {
      await harness.clear();
    });
  afterEach(() => expect(harness.consoleErrors).to.be.empty);
  it('should successfully create community health Volunteer with correct details', async() => {
    const result = await harness.fillContactCreateForm(CONTACT_TYPES.COMMUNITY_HEALTH_VOLUNTEER, ...communityHealthVolunteer.ok);
    expect(result.errors).to.be.empty;
    expect(result.contacts).to.have.lengthOf(1);
    expect(result.contacts.filter((contact) => contact.contact_type === CONTACT_TYPES.COMMUNITY_HEALTH_VOLUNTEER).length === 1).to.be.true;
    expect(result.contacts[0]).to.deep.include({
      name: communityHealthVolunteer.ok[0][0],
      gender: communityHealthVolunteer.ok[0][1],
      dob: communityHealthVolunteer.ok[0][2],
      primary_phone: communityHealthVolunteer.ok[0][3]
    });
  });
});
