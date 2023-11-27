const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const harness = new TestHarness();

describe('Device Functionality Follow-up', () => {
  before(async () => await harness.start());
  after(async () => await harness.stop());

  beforeEach(async () => {
    await harness.clear();
  });

  afterEach(() => {
    expect(harness.consoleErrors).to.be.empty;
  });

  it("should not trigger if stolen_device_reported is 'yes'", async () => {
    const result = await harness.fillForm('device_functionality', [
        'no',
        'stolen',
        'yes'
    ]);
    expect(result.errors).to.be.empty;

    const followUpTasks = await harness.getTasks({ type: 'device_functionality_follow_up' });
    expect(followUpTasks.length).to.equal(0);

    // debugging
    console.log('Device functionality Form:', result);
    console.log('Stolen Device Reported:', result.report.fields.g_device_functionality.stolen_device_reported);
    console.log('Task after Device functionalityForm Sumission:', followUpTasks);
  });

  it("should trigger when device_functionality_follow_up form with stolen_device_reported being 'no'", async () => {
    const result2 = await harness.fillForm('device_functionality', [
        'no',
        'stolen',
        'no'
    ]);
    expect(result2.errors).to.be.empty;

    console.log('Device functionality FOrm:', result2);
    console.log('Stolen Device Reported:', result2.report.fields.g_device_functionality.stolen_device_reported);
    
    const followUpTasks1 = await harness.getTasks({ type: 'device_functionality_follow_up' });
    expect(followUpTasks1.length).to.equal(1);

    // debugging
    console.log('Task after Device functionalityForm Sumission:', followUpTasks1);
  });
});
