const chai = require('chai');
const expect = chai.expect;
const TestRunner = require('cht-conf-test-harness');
const { childUnder5Assesmentment, childAssessment, householdMember } = require('../form-inputs');
const { FORMS, TARGETS, CONTACT_TYPES } = require('../../shared-extras');
const { DateTime } = require('luxon');
const harness = new TestRunner();


describe('Target: Under Five Members with Malaria symptoms', () => {
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
    let under5MembersWithMalaria = await harness.getTargets({ type: TARGETS.MEMBERS_WITH_MALARIA });
    expect(under5MembersWithMalaria).to.have.property('length', 1);
    expect(under5MembersWithMalaria[0]).to.nested.include({ 'value.pass': 0, 'value.total': 0, 'value.percent': 0 });
    //test target increments after form is filled

    //create a household member
    let result = await harness.fillContactCreateForm(CONTACT_TYPES.HOUSEHOLD_MEMBER, ...householdMember.ok('male', DateTime.local().minus8({ years: 3, months: 2 }).toJSDate()));
    expect(result.errors).to.be.empty;
    harness.subject = result.contacts[0];

    //assess member
    let under5MemberAssessmentResult = await harness.fillForm(FORMS.CHILD_ASSESSMENT, ...childUnder5Assesmentment.showSymptoms);
    expect(under5MemberAssessmentResult.errors).to.be.empty;

    //submit malaria diagnosis
    under5MemberAssessmentResult = await harness.fillForm(FORMS.CHILD_FOLLOW_UP, ...childAssessment.followUp);
    expect(under5MemberAssessmentResult.errors).to.be.empty;

    //check that target increments
    under5MembersWithMalaria = await harness.getTargets({ type: TARGETS.UNDER5_MEMBERS_WITH_MALARIA });
    expect(under5MembersWithMalaria).to.have.property('length', 1);
    expect(under5MembersWithMalaria[0]).to.nested.include({ 'value.pass': 1, 'value.total': 1, 'value.percent': 100 });

    //add a new member and confirm value.percent is 50
    result = await harness.fillContactCreateForm(CONTACT_TYPES.HOUSEHOLD_MEMBER, ...householdMember.ok('female', DateTime.local().minus({ years: 2, months: 2 }).toJSDate()));
    under5MembersWithMalaria = await harness.getTargets({ type: TARGETS.UNDER5_MEMBERS_WITH_MALARIA });
    expect(under5MembersWithMalaria).to.have.property('length', 1);
    expect(under5MembersWithMalaria[0]).to.nested.include({ 'value.pass': 1, 'value.total': 2, 'value.percent': 50 });

    harness.subject = result.contacts[0];
    //assess new member
    under5MemberAssessmentResult = await harness.fillForm(FORMS.CHILD_ASSESSMENT, ...childUnder5Assesmentment.showSymptoms);
    expect(under5MemberAssessmentResult.errors).to.be.empty;
    //submit malaria diagnosis
    under5MemberAssessmentResult = await harness.fillForm(FORMS.CHILD_FOLLOW_UP, ...childAssessment.followUp);
    expect(under5MemberAssessmentResult.errors).to.be.empty;
    //check that target increments
    under5MembersWithMalaria = await harness.getTargets({ type: TARGETS.UNDER5_MEMBERS_WITH_MALARIA });
    expect(under5MembersWithMalaria).to.have.property('length', 1);
    expect(under5MembersWithMalaria[0]).to.nested.include({ 'value.pass': 2, 'value.total': 2, 'value.percent': 100 });
  });

  it('should reset target every beginning of the month', async () => {
    //test target loads and is initially zero
    let under5MembersWithMalaria = await harness.getTargets({ type: TARGETS.UNDER5_MEMBERS_WITH_MALARIA });
    expect(under5MembersWithMalaria).to.have.property('length', 1);
    expect(under5MembersWithMalaria[0]).to.nested.include({ 'value.pass': 0, 'value.total': 0, 'value.percent': 0 });
    //increment target
    //create a household member
    const result = await harness.fillContactCreateForm(CONTACT_TYPES.HOUSEHOLD_MEMBER, ...householdMember.ok('male', DateTime.local().minus({ years: 3, months: 2 }).toJSDate()));
    expect(result.errors).to.be.empty;
    expect(result.contacts).to.have.lengthOf(1);
    harness.subject = result.contacts[0];
    let under5MemberAssessmentResult = await harness.fillForm(FORMS.CHILD_ASSESSMENT_ASSESSMENT, ...childAssessment.showSymptoms);
    expect(under5MemberAssessmentResult.errors).to.be.empty;
    under5MemberAssessmentResult = await harness.fillForm(FORMS.CHILD_FOLLOW_UP, ...childAssessment.followUp);
    expect(under5MemberAssessmentResult.errors).to.be.empty;
    under5MembersWithMalaria = await harness.getTargets({ type: TARGETS.UNDER5_MEMBERS_WITH_MALARIA });
    expect(under5MembersWithMalaria).to.have.property('length', 1);
    expect(under5MembersWithMalaria[0]).to.nested.include({ 'value.pass': 1, 'value.total': 1, 'value.percent': 100 });

    // set date to next month
    harness.setNow(DateTime.local().endOf('month').endOf('day').plus({ days: 1 }).toISODate());
    // check that targets reset
    under5MembersWithMalaria = await harness.getTargets({ type: TARGETS.UNDER5_MEMBERS_WITH_MALARIA });
    expect(under5MembersWithMalaria).to.have.property('length', 1);
    expect(under5MembersWithMalaria[0]).to.nested.include({ 'value.pass': 0, 'value.total': 0, 'value.percent': 0 });
  });

  it('should not increment target if member has no malaria diagnosis', async () => {
    //create a household member
    const result = await harness.fillContactCreateForm(CONTACT_TYPES.HOUSEHOLD_MEMBER, ...householdMember.ok('male', DateTime.local().minus({ years: 45, months: 2 }).toJSDate()));
    expect(result.errors).to.be.empty;
    expect(result.contacts).to.have.lengthOf(1);
    harness.subject = result.contacts[0];
    let under5MemberAssessmentResult = await harness.fillForm(FORMS.CHILD_ASSESSMENT_ASSESSMENT, ...childUnder5Assesmentment.showSymptoms);
    expect(under5MemberAssessmentResult.errors).to.be.empty;
    under5MemberAssessmentResult = await harness.fillForm(FORMS.CHILD_FOLLOW_UP, ...childAssessment.followUp);
    expect(under5MemberAssessmentResult.errors).to.be.empty;
    const under5MembersWithMalaria = await harness.getTargets({ type: TARGETS.UNDER5_MEMBERS_WITH_MALARIA });
    expect(under5MembersWithMalaria).to.have.property('length', 1);
    expect(under5MembersWithMalaria[0]).to.nested.include({ 'value.pass': 0, 'value.total': 1, 'value.percent': 0 });
  });
});
