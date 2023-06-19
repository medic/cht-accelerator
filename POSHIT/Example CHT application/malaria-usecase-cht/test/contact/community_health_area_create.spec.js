const { expect } = require('chai');
const TestRunner = require('cht-conf-test-harness');
const { communityHealthArea } = require('../form-inputs');
const { CONTACT_TYPES } = require('../../shared-extras')
const harness = new TestRunner();
describe('Community Health Area registration form', () => {
  before(() => harness.start());
  after(() => harness.stop());
  beforeEach(
    async () => {
      await harness.clear();
    });
  afterEach(() => expect(harness.consoleErrors).to.be.empty);
  it('should create a community health area with the correct details', async() => {
    const result = await harness.fillContactCreateForm(CONTACT_TYPES.COMMUNITY_HEALTH_AREA, ...communityHealthArea.ok);
    expect(result.errors).to.be.empty;
    expect(result.contacts).to.have.lengthOf(2);
    expect(result.contacts.filter((contact) => contact.contact_type === CONTACT_TYPES.COMMUNITY_HEALTH_AREA).length === 1).to.be.true;
    expect(result.contacts[1]).to.deep.include({
      name: communityHealthArea.ok[0][1],
      phone: communityHealthArea.ok[0][2]
    });
  });
});
