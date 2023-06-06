const { expect } = require('chai');
const TestRunner = require('cht-conf-test-harness');
const { healthFacility } = require('../form-inputs');

const harness = new TestRunner();
let TODAY = '2023-03-15';

describe('Health Facilty Creation', () => {
  before(() => harness.start());

  after(() => harness.stop());

  beforeEach(
    async () => {
      await harness.clear();
      await harness.setNow(new Date(TODAY));
    });

  afterEach(() => expect(harness.consoleErrors).to.be.empty);

  it('saves data succesfully when health facility is created with contact', async() => {
    const result = await harness.fillContactCreateForm('area_health_facility', ...healthFacility.full);
    expect(result.errors).to.be.empty;
    expect(result.contacts).to.have.lengthOf(2);
    expect(result.contacts.filter((contact) => contact.contact_type === 'area_health_facility').length === 1).to.be.true;
    expect(result.contacts.filter((contact) => contact.contact_type === 'area_health_facility_nurse').length === 1).to.be.true;

  });
  it('saves data succesfully when health facility is created without contact', async() => {
    const result = await harness.fillContactCreateForm('area_health_facility', ...healthFacility.withoutHead);
    expect(result.errors).to.be.empty;
    expect(result.contacts).to.have.lengthOf(1);
    expect(result.contacts.filter((contact) => contact.contact_type === 'area_health_facility').length === 1).to.be.true;
  });
});
