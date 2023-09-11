const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const { childAssessment } = require('../form-inputs');
const { TASKS, FORMS } = require('../../shared-extras');

const harness = new TestHarness();

describe('Children under 5 Assessment and Follow Up', () => {
  before(async () => await harness.start());
  after(async () => await harness.stop());

  beforeEach(async () => {
    await harness.clear();
  });

  afterEach(() => {
    expect(harness.consoleErrors).to.be.empty;
  });

  it('should not trigger if no reports exist', async () => {
    const tasks = await harness.getTasks({title: TASKS.CHILD_ASSESSMENT_FOLLOW_UP});
    expect(tasks.length).to.equal(0);
  });

  it('should trigger when an assessment form with child with symptoms is submitted', async () => {
    let report = await harness.fillForm(FORMS.CHILD_ASSESSMENT, ...childAssessment.provisionRDT);
    expect(report.errors).to.be.empty;
    await harness.flush({days: 1});
    let tasks = await harness.getTasks({title: TASKS.CHILD_ASSESSMENT_FOLLOW_UP});
    expect(tasks.length).to.equal(1);

    let summary = await harness.countTaskDocsByState({title: TASKS.CHILD_ASSESSMENT_FOLLOW_UP});
    expect(summary).to.nested.include({
      Completed: 0,
      Failed: 0,
      Draft: 0,
      Ready: 1
    });

    report = await harness.loadAction(tasks[0], ...childAssessment.followUp);
    
    expect(report.errors).to.be.empty;
    await harness.flush({days: 1});
    tasks = await harness.getTasks({title: TASKS.CHILD_ASSESSMENT_FOLLOW_UP});
    expect(tasks.length).to.equal(0);

    summary = await harness.countTaskDocsByState({title: TASKS.CHILD_ASSESSMENT_FOLLOW_UP});
    expect(summary).to.nested.include({
      Completed: 1,
      Failed: 0,
      Draft: 0,
      Ready: 0
    });
  });
});
