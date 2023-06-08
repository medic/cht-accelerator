const { expect } = require('chai');
const TestRunner = require('cht-conf-test-harness');
const { nurseCreate } = require('../form-inputs');

const harness = new TestRunner();
let TODAY = '2023-03-15';

describe('Facility Nurse Creation', () => {
  before(() => harness.start());

  after(() => harness.stop());

  beforeEach(
    async () => {
      await harness.clear();
      await harness.setNow(new Date(TODAY));
    });

  afterEach(() => expect(harness.consoleErrors).to.be.empty);

  it('saves data succesfully when health facility is created', async() => {
    const result = await harness.fillContactCreateForm('area_health_facility_nurse', ...nurseCreate.full);
    expect(result.errors).to.be.empty;
    expect(result.contacts).to.have.lengthOf(1);
    expect(result.contacts.filter((contact) => contact.contact_type === 'area_health_facility_nurse').length === 1).to.be.true;

  });
});
