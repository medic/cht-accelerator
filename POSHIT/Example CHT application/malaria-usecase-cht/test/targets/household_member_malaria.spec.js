const chai = require('chai');
const expect = chai.expect;
const TestRunner = require('cht-conf-test-harness');
const { memberAssessment, memberAssessmentTask } = require('../form-inputs');
const { FORMS, TARGETS } = require('../../shared-extras');
const { DateTime } = require('luxon');
const harness = new TestRunner();


describe('Household Members with malaria Target', () => {
  before(async () => {
    return await harness.start();
  });
  after(async () => {
    return await harness.stop();
  });
  beforeEach(async () => {
    await harness.clear();
  });
  afterEach(() => {
    expect(harness.consoleErrors).to.be.empty;
  });

  it('should trigger incrementing of the target', async () => {
    //test target loads and is initially zero
    let householdMembersWithMalaria = await harness.getTargets({ type: TARGETS.MEMBERS_WITH_MALARIA });
    expect(householdMembersWithMalaria).to.have.property('length', 1);
    expect(householdMembersWithMalaria[0]).to.nested.include({ 'value.pass': 0, 'value.total': 0, 'value.percent': 0 });
    //test target increments after form is filled
    let householdMemberAssessmentResult = await harness.fillForm(FORMS.MEMBER_ASSESSMENT, ...memberAssessment.showSymptoms);
    expect(householdMemberAssessmentResult.errors).to.be.empty;
    householdMemberAssessmentResult = await harness.fillForm(FORMS.MEMBER_FOLLOW_UP, ...memberAssessmentTask.followUpMalaria);
    expect(householdMemberAssessmentResult.errors).to.be.empty;
    householdMembersWithMalaria = await harness.getTargets({ type: TARGETS.MEMBERS_WITH_MALARIA });
    expect(householdMembersWithMalaria).to.have.property('length', 1);
    expect(householdMembersWithMalaria[0]).to.nested.include({ 'value.pass': 1, 'value.total': 1, 'value.percent': 100 });
  });

  it('should reset target every beginning of the month', async () => {
    let householdMembersWithMalaria;
    //increment target
    let householdMemberAssessmentResult = await harness.fillForm(FORMS.MEMBER_ASSESSMENT, ...memberAssessment.showSymptoms);
    expect(householdMemberAssessmentResult.errors).to.be.empty;
    householdMemberAssessmentResult = await harness.fillForm(FORMS.MEMBER_FOLLOW_UP, ...memberAssessmentTask.followUpMalaria);
    expect(householdMemberAssessmentResult.errors).to.be.empty;
    householdMembersWithMalaria = await harness.getTargets({ type: TARGETS.MEMBERS_WITH_MALARIA });
    expect(householdMembersWithMalaria).to.have.property('length', 1);
    expect(householdMembersWithMalaria[0]).to.nested.include({ 'value.pass': 1, 'value.total': 1, 'value.percent': 100 });

    // set date to next month
    harness.setNow(DateTime.local().endOf('month').endOf('day').plus({ days: 1 }).toISODate());
    // check that targets reset
    householdMembersWithMalaria = await harness.getTargets({ type: TARGETS.HOUSEHOLDS_GTE_2_LLIN });
    expect(householdMembersWithMalaria).to.have.property('length', 1);
    expect(householdMembersWithMalaria[0]).to.nested.include({ 'value.pass': 0, 'value.total': 0, 'value.percent': 0 });
  });

  it('should not increment target if member has no malaria diagnosis', async () => {
    let householdMemberAssessmentResult = await harness.fillForm(FORMS.MEMBER_ASSESSMENT, ...memberAssessment.showSymptoms);
    expect(householdMemberAssessmentResult.errors).to.be.empty;
    householdMemberAssessmentResult = await harness.fillForm(FORMS.MEMBER_FOLLOW_UP, ...memberAssessmentTask.followUp);
    expect(householdMemberAssessmentResult.errors).to.be.empty;
    const householdMembersWithMalaria = await harness.getTargets({ type: TARGETS.MEMBERS_WITH_MALARIA });
    expect(householdMembersWithMalaria).to.have.property('length', 1);
    expect(householdMembersWithMalaria[0]).to.nested.include({ 'value.pass': 0, 'value.total': 1, 'value.percent': 0 });
  });
});
