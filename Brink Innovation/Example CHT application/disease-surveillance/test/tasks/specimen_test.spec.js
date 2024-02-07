const { expect } = require('chai');
const Harness = require('cht-conf-test-harness');
const harness = new Harness({harnessDataPath: 'dso_user.defaults.json'});
const {
  confirmReportedCaseScenarios,
  specimenCollectedScenarios
} = require('../forms/form_inputs');
const { TASKS_TITLE } = require('../constants');
const { DateTime } = require('luxon');
const now = DateTime.now();
const triggerForm = 'cholera_verification';

describe('DSO Test Referred Patient Specimen Task', () => {
  before(async () => {
    return await harness.start();
  });
  after(async () => {
    return await harness.stop();
  });
  beforeEach(async () => {
    harness.setNow(now);
    return await harness.clear();
  });
  afterEach(async () => {
    expect(harness.consoleErrors).to.be.empty;
  });

  it('should not trigger if no reports exist', async () => {
    const tasks = await harness.getTasks({
      title: TASKS_TITLE.testPatientSpecimen,
    });
    expect(tasks.length).to.equal(0);
  });

  it('should not create test patient specimen task for unconfirmed case', async () => {
    const initialResult = await harness.fillForm(`${triggerForm}`, [
      ...Object.values(confirmReportedCaseScenarios.unconfirmedCase),
    ]);
    expect(initialResult.errors).to.be.empty;
    const tasks = await harness.getTasks({
      title: TASKS_TITLE.testPatientSpecimen,
    });
    expect(tasks.length).to.equal(0);
    });
  it('should create and resolve test patient specimen task for confirmed case', async () => {
    const initialResult = await harness.fillForm(`${triggerForm}`, [
    ...Object.values(confirmReportedCaseScenarios.confirmedCase),
    ]);
    expect(initialResult.errors).to.be.empty;
    await harness.flush({ days: 1 });
    let tasks = await harness.getTasks({
    title: TASKS_TITLE.testPatientSpecimen,
    });
    expect(tasks.length).to.equal(1);
    let taskSummary = await harness.countTaskDocsByState({
    title: TASKS_TITLE.testPatientSpecimen,
    });
    expect(taskSummary).to.nested.include({
    Completed: 0,
    Failed: 0,
    Draft: 0,
    Ready: 1,
    });
    const filledFollowUpForm = await harness.loadAction(tasks[0], [
        ...Object.values(specimenCollectedScenarios.specimenNotCollected),
      ]);
      expect(filledFollowUpForm.errors).to.be.empty;
      tasks = await harness.getTasks({
        title: TASKS_TITLE.testPatientSpecimen,
      });
      expect(tasks.length).to.equal(0);
      taskSummary = await harness.countTaskDocsByState({
        title: TASKS_TITLE.testPatientSpecimen,
      });
      expect(taskSummary).to.nested.include({
        Completed: 1,
        Failed: 0,
        Draft: 0,
        Ready: 0,
      });
});
});