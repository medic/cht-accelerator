const { expect } = require('chai');
const TestHarness = require('cht-conf-test-harness');
const {assessment} = require('./form-inputs');
const harness = new TestHarness({ verbose: true });
const {DateTime} = require('luxon');

describe('Household - Tasks', () => {
  before(async () => await harness.start());
  after(async () => await harness.stop());

  beforeEach(async () => {
    await harness.clear();
  });

  afterEach(() => {
    expect(harness.consoleErrors).to.be.empty;
  });
  it('Should not show tasks if not submitted forms', async () => {
    const tasks = await harness.getTasks();
    expect(tasks).to.not.be.undefined;
    expect(tasks.length).to.equal(0);
  });

  it('Should show correct task when provision is submitted', async () => {
    const provisionRDT = await harness.fillForm('household_assessment', ...assessment.provisionRDT(DateTime.local().plus(1).toISODate()));

    expect(provisionRDT.errors).to.be.empty;

    const tasks = await harness.getTasks();

    expect(tasks).to.not.be.undefined;
    expect(tasks.length).to.equal(1);

    const task = tasks[0];
    expect(task).to.include({
      user: 'org.couchdb.user:chw_area_contact_id',
      requester: 'patient_id',
      owner: 'patient_id',
      state: 'Ready'
    });
    expect(task.emission).to.include({
      title: 'task.household_assessment_followup.title',
      deleted: false,
      resolved: false,
      dueDate: DateTime.local().plus(1).toISODate(),
      forId: 'patient_id'
    });
    expect(task.emission.actions[0]).to.include({
      type: 'report',
      form: 'household_assessment'
    });
  });
  it('Should resolve task when results are captured', async () => {
    const provisionRDT = await harness.fillForm('household_assessment', ...assessment.provisionRDT(DateTime.local().plus(1).toISODate()));
    expect(provisionRDT.errors).to.be.empty;
    let tasks = await harness.getTasks();
    expect(tasks).to.not.be.undefined;
    expect(tasks.length).to.equal(1);
    harness.flush(1);
    await harness.loadAction(tasks[0]);
    await harness.fillForm(...assessment.captureResult(DateTime.local().plus(1).toISODate()));
    tasks = await harness.getTasks();
    expect(tasks).to.not.be.undefined;
    expect(tasks.length).to.equal(1);
  });

  it('Should show task for repeating a follow', async () => {
    const provisionRDT = await harness.fillForm('household_assessment', ...assessment.provisionRDT(DateTime.local().plus(1).toISODate()));
    expect(provisionRDT.errors).to.be.empty;
    let tasks = await harness.getTasks();
    expect(tasks).to.not.be.undefined;
    expect(tasks.length).to.equal(1);
    harness.flush(1);
    await harness.loadAction(tasks[0]);
    await harness.fillForm(...assessment.captureResultWithRepeat(DateTime.local().plus(1).toISODate()));
    tasks = await harness.getTasks();
    expect(tasks).to.not.be.undefined;
    expect(tasks.length).to.equal(1);
    const task = tasks[0];
    expect(task).to.include({
      user: 'org.couchdb.user:chw_area_contact_id',
      requester: 'patient_id',
      owner: 'patient_id',
      state: 'Ready'
    });
    expect(task.emission).to.include({
      title: 'task.household_assessment_followup.title',
      deleted: false,
      resolved: false,
      forId: 'patient_id'
    });
    expect(task.emission.actions[0]).to.include({
      type: 'report',
      form: 'household_assessment'
    });
  });

  it('Should resolve task for repeating a provision RDT and create a task for capturing results', async () => {
    const provisionRDT = await harness.fillForm('household_assessment', ...assessment.provisionRDT(DateTime.local().plus(2).toISODate()));
    expect(provisionRDT.errors).to.be.empty;
    harness.flush(1);
    let tasks = await harness.getTasks();
    await harness.loadAction(tasks[0]);
    await harness.fillForm(...assessment.captureResultWithRepeat(DateTime.local().plus(2).toISODate()));
    harness.flush(1);
    tasks = await harness.getTasks();
    await harness.loadAction(tasks[0]);
    await harness.fillForm(...assessment.provisionRDT(DateTime.local().plus(1).toISODate()));
    tasks = await harness.getTasks();
    expect(tasks).to.not.be.undefined;
    expect(tasks.length).to.equal(1);
    const task = tasks[0];
    expect(task).to.include({
      user: 'org.couchdb.user:chw_area_contact_id',
      requester: 'patient_id',
      owner: 'patient_id',
      state: 'Ready'
    });
    expect(task.emission).to.include({
      title: 'task.household_assessment_followup.title',
      deleted: false,
      resolved: false,
      forId: 'patient_id'
    });
    expect(task.emission.actions[0]).to.include({
      type: 'report',
      form: 'household_assessment'
    });
  });
});
