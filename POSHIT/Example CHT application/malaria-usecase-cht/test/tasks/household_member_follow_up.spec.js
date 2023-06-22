const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const { memberAssessmentTask } = require('./form-inputs');
const { TASKS, FORMS } = require('../../shared-extras');
const { memberAssessment } = require('../form-inputs');
const {DateTime} = require('luxon');

const harness = new TestHarness();

describe('Household Member Assessment and Follow Up', () => {
  before(async () => await harness.start());
  after(async () => await harness.stop());

  beforeEach(async () => {
    await harness.clear();
  });

  afterEach(() => {
    expect(harness.consoleErrors).to.be.empty;
  });

  it('should not trigger if no reports exist', async () => {
    const tasks = await harness.getTasks({title: TASKS.HOUSEHOLD_MEMBER_FOLLOW_UP});
    expect(tasks.length).to.equal(0);
  });

  it('should trigger when an assessment form with member with symptoms is submitted and resolve accordingly', async () => {
    let report = await harness.fillForm(FORMS.MEMBER_ASSESSMENT, ...memberAssessment.showSymptoms);
    expect(report.errors).to.be.empty;
 
    await harness.flush({days: 1});
    let tasks = await harness.getTasks({title: TASKS.HOUSEHOLD_MEMBER_FOLLOW_UP});
    expect(tasks.length).to.equal(1);
 
    let summary = await harness.countTaskDocsByState({title: TASKS.HOUSEHOLD_MEMBER_FOLLOW_UP});
    expect(summary).to.nested.include({
      Completed: 0,
      Failed: 0,
      Draft: 0,
      Ready: 1
    });

    report = await harness.loadAction(tasks[0], ...memberAssessmentTask.followUp);
    expect(report.errors).to.be.empty;
    await harness.flush({days: 1});
    tasks = await harness.getTasks({title: TASKS.HOUSEHOLD_MEMBER_FOLLOW_UP});
    expect(tasks.length).to.equal(0);

    summary = await harness.countTaskDocsByState({title: TASKS.HOUSEHOLD_MEMBER_FOLLOW_UP});
    expect(summary).to.nested.include({
      Completed: 1,
      Failed: 0,
      Draft: 0,
      Ready: 0
    });
  });

  it('should trigger when a follow up task when member is not available', async () => {
    let report = await harness.fillForm(FORMS.MEMBER_ASSESSMENT, ...memberAssessment.showSymptoms);
    expect(report.errors).to.be.empty;
 
    await harness.flush({days: 1});
    let tasks = await harness.getTasks({title: TASKS.HOUSEHOLD_MEMBER_FOLLOW_UP});
    expect(tasks.length).to.equal(1);
 
    let summary = await harness.countTaskDocsByState({title: TASKS.HOUSEHOLD_MEMBER_FOLLOW_UP});
    expect(summary).to.nested.include({
      Completed: 0,
      Failed: 0,
      Draft: 0,
      Ready: 1
    });

    report = await harness.loadAction(tasks[0], ...memberAssessmentTask.followUpRepeat(DateTime.local().plus(2).toISODate()));
    expect(report.errors).to.be.empty;
    tasks = await harness.getTasks({title: TASKS.HOUSEHOLD_MEMBER_FOLLOW_UP});
    expect(tasks.length).to.equal(1);

    summary = await harness.countTaskDocsByState({title: TASKS.HOUSEHOLD_MEMBER_FOLLOW_UP});
    expect(summary).to.nested.include({
      Completed: 1,
      Failed: 0,
      Draft: 0,
      Ready: 1
    });

    report = await harness.loadAction(tasks[0], ...memberAssessmentTask.followUp);
    expect(report.errors).to.be.empty;
    await harness.flush({days: 2});
    tasks = await harness.getTasks({title: TASKS.HOUSEHOLD_MEMBER_FOLLOW_UP});
    expect(tasks.length).to.equal(1);
  
    summary = await harness.countTaskDocsByState({title: TASKS.HOUSEHOLD_MEMBER_FOLLOW_UP});
    expect(summary).to.nested.include({
      Completed: 1,
      Failed: 0,
      Draft: 0,
    });
  });

it('should not trigger repeated follow up task when no follow up is required', async () => {
  let report = await harness.fillForm(FORMS.MEMBER_ASSESSMENT, ...memberAssessment.showSymptoms);
  expect(report.errors).to.be.empty;

  await harness.flush({days: 1});
  let tasks = await harness.getTasks({title: TASKS.HOUSEHOLD_MEMBER_FOLLOW_UP});
  expect(tasks.length).to.equal(1);

  let summary = await harness.countTaskDocsByState({title: TASKS.HOUSEHOLD_MEMBER_FOLLOW_UP});
  expect(summary).to.nested.include({
    Completed: 0,
    Failed: 0,
    Draft: 0,
    Ready: 1
  });

  report = await harness.loadAction(tasks[0], ...memberAssessmentTask.followUp);
  expect(report.errors).to.be.empty;
  tasks = await harness.getTasks({title: TASKS.HOUSEHOLD_MEMBER_FOLLOW_UP});
  expect(tasks.length).to.equal(0);

  summary = await harness.countTaskDocsByState({title: TASKS.HOUSEHOLD_MEMBER_FOLLOW_UP});
  expect(summary).to.nested.include({
    Completed: 1,
    Failed: 0,
    Draft: 0,
    Ready: 0
  });
});
});


