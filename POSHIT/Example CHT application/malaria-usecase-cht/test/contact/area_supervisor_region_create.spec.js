const { expect } = require('chai');
const TestRunner = require('cht-conf-test-harness');
const { supervisorRegion } = require('../form-inputs');

const harness = new TestRunner();
const TODAY = '2023-03-15';

describe('Supervisor Region Creation', () => {
  before(() => harness.start());

  after(() => harness.stop());

  beforeEach(
    async () => {
      await harness.clear();
      await harness.setNow(new Date(TODAY));
    });

  afterEach(() => expect(harness.consoleErrors).to.be.empty);

  it('saves data succesfully when supervisor region is created with contact', async() => {
    const result = await harness.fillContactCreateForm('area_supervisor_region', ...supervisorRegion.full);
    expect(result.errors).to.be.empty;
    expect(result.contacts).to.have.lengthOf(2);
    expect(result.contacts.filter((contact) => contact.contact_type === 'area_supervisor_region').length === 1).to.be.true;
    expect(result.contacts.filter((contact) => contact.contact_type === 'area_community_health_supervisor').length === 1).to.be.true;

  });
  it('saves data succesfully when supervisor region is created without contact', async() => {
    const result = await harness.fillContactCreateForm('area_supervisor_region', ...supervisorRegion.withoutHead);
    expect(result.errors).to.be.empty;
    expect(result.contacts).to.have.lengthOf(1);
    expect(result.contacts.filter((contact) => contact.contact_type === 'area_supervisor_region').length === 1).to.be.true;
  });
});
