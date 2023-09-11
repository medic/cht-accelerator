const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const { householdAssessment } = require('../form-inputs');
const { TASKS, FORMS } = require('../../shared-extras');

const harness = new TestHarness();
const {DateTime} = require('luxon');

describe('Household Assessment Tasks', () => {
  before(async () => await harness.start());
  after(async () => await harness.stop());
  beforeEach(async () => {
    await harness.clear();
  });
  afterEach(() => {
    expect(harness.consoleErrors).to.be.empty;
  });
  it('should not trigger if no reports exist', async () => {
    const tasks = await harness.getTasks({title: TASKS.HOUSEHOLD_ASSESSMENT});
    expect(tasks.length).to.equal(0);
  });
  it('should trigger when an assessment with amendment date is submitted and resolve accordingly', async () => {
    let report = await harness.fillForm(FORMS.HOUSEHOLD_ASSESSMENT, ...householdAssessment.provisionRDT(DateTime.local().plus({days: 1}).toISODate()));
    expect(report.errors).to.be.empty;
    await harness.flush({days: 4});
    let tasks = await harness.getTasks({title: TASKS.HOUSEHOLD_ASSESSMENT});
    expect(tasks.length).to.equal(1);
    let summary = await harness.countTaskDocsByState({title: TASKS.HOUSEHOLD_ASSESSMENT});
    expect(summary).to.nested.include({
      Completed: 0,
      Failed: 0,
      Draft: 0,
      Ready: 1
    });
    report = await harness.loadAction(tasks[0], ...householdAssessment.provisionRDTCopy(DateTime.local().plus({days: 18}).toISODate()));
    expect(report.errors).to.be.empty;
    await harness.flush({days: 18});
    tasks = await harness.getTasks({title: TASKS.HOUSEHOLD_ASSESSMENT});
    expect(tasks.length).to.equal(1);
    summary = await harness.countTaskDocsByState({title: TASKS.HOUSEHOLD_ASSESSMENT});
    expect(summary).to.nested.include({
      Completed: 1,
      Failed: 0,
      Draft: 0,
      Ready: 1
    });
    // Complete the task's action
    await harness.loadAction(tasks[0]);
    const followupResult = await harness.fillForm(FORMS.HOUSEHOLD_ASSESSMENT, householdAssessment.captureResultComplete);
    expect(followupResult.errors).to.be.empty;
    // Verify the task got resolved
    const actual = await harness.getTasks({title: TASKS.HOUSEHOLD_ASSESSMENT});
    expect(actual).to.be.empty;
    summary = await harness.countTaskDocsByState({title: TASKS.HOUSEHOLD_ASSESSMENT});
    expect(summary).to.nested.include({
      Completed: 2,
      Failed: 0,
      Draft: 0,
      Ready: 0
    });
  });
});
