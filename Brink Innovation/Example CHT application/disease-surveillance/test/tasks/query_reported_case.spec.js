const { expect } = require('chai');
const Harness = require('cht-conf-test-harness');
const harness = new Harness({harnessDataPath: 'cha_user.defaults.json'});
const {
  houseHoldAssessmentScenarios,
  queryCholeraCaseScenarios
} = require('../forms/form_inputs');
const { TASKS_TITLE } = require('../constants');
const { DateTime } = require('luxon');
const now = DateTime.now();
const triggerForm = 'household_member_assessment';

describe('CHA Query CHP About Reported Case Task', () => {
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
          title: TASKS_TITLE.queryReportedCase,
        });
        expect(tasks.length).to.equal(0);
    });
    it('should not create query reported case task for household member with no case definition', async () => {
        const initialResult = await harness.fillForm(`${triggerForm}`, [
          ...Object.values(houseHoldAssessmentScenarios.noCholeraCaseDefinition),
        ]);
        expect(initialResult.errors).to.be.empty;
        const tasks = await harness.getTasks({
          title: TASKS_TITLE.queryReportedCase,
        });
        expect(tasks.length).to.equal(0);
    });
    it('should create and resolve query reported case task for household member with case definition', async () => {
        const initialResult = await harness.fillForm(`${triggerForm}`, [
          ...Object.values(houseHoldAssessmentScenarios.choleraCaseDefinition),
        ]);
        expect(initialResult.errors).to.be.empty;
        await harness.flush({ days: 1 });
        let tasks = await harness.getTasks({
          title: TASKS_TITLE.queryReportedCase,
        });
        expect(tasks.length).to.equal(1);
        let taskSummary = await harness.countTaskDocsByState({
          title: TASKS_TITLE.queryReportedCase,
        });
        expect(taskSummary).to.nested.include({
            Completed: 0,
            Failed: 0,
            Draft: 0,
            Ready: 1,
        });
        const filledFollowUpForm = await harness.loadAction(tasks[0], [
            ...Object.values(queryCholeraCaseScenarios.seekVerification),
          ]);
          expect(filledFollowUpForm.errors).to.be.empty;
          tasks = await harness.getTasks({
            title: TASKS_TITLE.queryReportedCase,
          });
          expect(tasks.length).to.equal(0);
          taskSummary = await harness.countTaskDocsByState({
            title: TASKS_TITLE.queryReportedCase,
          });
          expect(taskSummary).to.nested.include({
            Completed: 1,
            Failed: 0,
            Draft: 0,
            Ready: 0,
          });
    });
});