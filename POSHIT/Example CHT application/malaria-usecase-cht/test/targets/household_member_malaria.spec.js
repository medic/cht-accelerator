const chai = require('chai');
const expect = chai.expect;
const TestRunner = require('cht-conf-test-harness');
const { memberAssessment, memberAssessmentTask, householdMember } = require('../form-inputs');
const { FORMS, TARGETS, CONTACT_TYPES } = require('../../shared-extras');
const { DateTime } = require('luxon');
const harness = new TestRunner();


describe('Target: Household Members with Malaria Diagnosis', () => {
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

  it('should increment if a malaria diagnosis report is submitted', async () => {
    //test target loads and is initially zero
    let householdMembersWithMalaria = await harness.getTargets({ type: TARGETS.MEMBERS_WITH_MALARIA });
    expect(householdMembersWithMalaria).to.have.property('length', 1);
    expect(householdMembersWithMalaria[0]).to.nested.include({ 'value.pass': 0, 'value.total': 0, 'value.percent': 0 });
    //test target increments after form is filled
    //create a household member
    let result = await harness.fillContactCreateForm(CONTACT_TYPES.HOUSEHOLD_MEMBER, ...householdMember.ok('male', DateTime.local().minus({ years: 22, months: 2 }).toJSDate()));
    expect(result.errors).to.be.empty;
    harness.subject = result.contacts[0];
    //assess member
    let householdMemberAssessmentResult = await harness.fillForm(FORMS.MEMBER_ASSESSMENT, ...memberAssessment.showSymptoms);
    expect(householdMemberAssessmentResult.errors).to.be.empty;
    //submit malaria diagnosis
    householdMemberAssessmentResult = await harness.fillForm(FORMS.MEMBER_FOLLOW_UP, ...memberAssessmentTask.followUpMalaria);
    expect(householdMemberAssessmentResult.errors).to.be.empty;
    //check that target increments
    householdMembersWithMalaria = await harness.getTargets({ type: TARGETS.MEMBERS_WITH_MALARIA });
    expect(householdMembersWithMalaria).to.have.property('length', 1);
    expect(householdMembersWithMalaria[0]).to.nested.include({ 'value.pass': 1, 'value.total': 1, 'value.percent': 100 });
    //add a new member and confirm value.percent is 50
    result = await harness.fillContactCreateForm(CONTACT_TYPES.HOUSEHOLD_MEMBER, ...householdMember.ok('female', DateTime.local().minus({ years: 20, months: 2 }).toJSDate()));
    householdMembersWithMalaria = await harness.getTargets({ type: TARGETS.MEMBERS_WITH_MALARIA });
    expect(householdMembersWithMalaria).to.have.property('length', 1);
    expect(householdMembersWithMalaria[0]).to.nested.include({ 'value.pass': 1, 'value.total': 2, 'value.percent': 50 });
    
    harness.subject = result.contacts[0];
    //assess new member
    householdMemberAssessmentResult = await harness.fillForm(FORMS.MEMBER_ASSESSMENT, ...memberAssessment.showSymptoms);
    expect(householdMemberAssessmentResult.errors).to.be.empty;
    //submit malaria diagnosis
    householdMemberAssessmentResult = await harness.fillForm(FORMS.MEMBER_FOLLOW_UP, ...memberAssessmentTask.followUpMalaria);
    expect(householdMemberAssessmentResult.errors).to.be.empty;
    //check that target increments
    householdMembersWithMalaria = await harness.getTargets({ type: TARGETS.MEMBERS_WITH_MALARIA });
    expect(householdMembersWithMalaria).to.have.property('length', 1);
    expect(householdMembersWithMalaria[0]).to.nested.include({ 'value.pass': 2, 'value.total': 2, 'value.percent': 100 });
  });

  it('should reset target every beginning of the month', async () => {
    //test target loads and is initially zero
    let householdMembersWithMalaria = await harness.getTargets({ type: TARGETS.MEMBERS_WITH_MALARIA });
    expect(householdMembersWithMalaria).to.have.property('length', 1);
    expect(householdMembersWithMalaria[0]).to.nested.include({ 'value.pass': 0, 'value.total': 0, 'value.percent': 0 });
    //increment target
    //create a household member
    const result = await harness.fillContactCreateForm(CONTACT_TYPES.HOUSEHOLD_MEMBER, ...householdMember.ok('male', DateTime.local().minus({ years: 26, months: 2 }).toJSDate()));
    expect(result.errors).to.be.empty;
    expect(result.contacts).to.have.lengthOf(1);
    harness.subject = result.contacts[0];
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
    //create a household member
    const result = await harness.fillContactCreateForm(CONTACT_TYPES.HOUSEHOLD_MEMBER, ...householdMember.ok('male', DateTime.local().minus({ years: 28, months: 2 }).toJSDate()));
    expect(result.errors).to.be.empty;
    expect(result.contacts).to.have.lengthOf(1);
    harness.subject = result.contacts[0];
    let householdMemberAssessmentResult = await harness.fillForm(FORMS.MEMBER_ASSESSMENT, ...memberAssessment.showSymptoms);
    expect(householdMemberAssessmentResult.errors).to.be.empty;
    householdMemberAssessmentResult = await harness.fillForm(FORMS.MEMBER_FOLLOW_UP, ...memberAssessmentTask.followUp);
    expect(householdMemberAssessmentResult.errors).to.be.empty;
    const householdMembersWithMalaria = await harness.getTargets({ type: TARGETS.MEMBERS_WITH_MALARIA });
    expect(householdMembersWithMalaria).to.have.property('length', 1);
    expect(householdMembersWithMalaria[0]).to.nested.include({ 'value.pass': 0, 'value.total': 1, 'value.percent': 0 });
  });
});
