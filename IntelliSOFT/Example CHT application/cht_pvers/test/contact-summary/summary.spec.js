const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const harness = new TestHarness();
const { contactScenario } = require('../form-inputs');
const { DateTime } = require('luxon');
const now = DateTime.now();

describe('contact summary - asessment card', () => {
  before(async () => await harness.start());
  after(async () => await harness.stop());
  beforeEach(async () => await harness.clear());
  afterEach(() => { expect(harness.consoleErrors).to.be.empty; });

  it('empty contact', async () => {
    const result = await harness.getContactSummary({}, []);
    expect(result).to.deep.eq({
      cards: [],
      fields: [],
      context: {}
    });
  });
   
});