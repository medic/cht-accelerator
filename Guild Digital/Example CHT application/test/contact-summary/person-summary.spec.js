const { expect } = require('chai');
const TestRunner = require('cht-conf-test-harness');
const { DateTime } = require('luxon');
const personSummary = require('../../person-summary.js');
const harness = new TestRunner();

describe('Person Contact Summary', () => {
  before(() => harness.start());
  after(async () => { return await harness.stop(); });
  beforeEach(async () => {
    await harness.clear();
  });
  afterEach(() => {
    expect(harness.consoleErrors).to.be.empty;
  });

  it('should display person contact summary with correct information', async () => {
    
    const reports = [
      {
        form: 'Pregnancy Assessment',
        reported_date: DateTime.local().minus({ days: 5 }).toMillis(),
      },
      {
        form: 'ANC Visit',
        reported_date: DateTime.local().plus({ days: 2 }).toMillis(),
      },
    ];

    const contact = {
      patient_id: '123',
      sex: 'male',
      date_of_birth: '1990-01-01',
      phone: '1234567890',
      notes: 'Test notes',
    };

    const lineage = [
      {
        _id: 'parent_contact_id',
        type: 'clinic',
        name: 'Parent Clinic',
      },
    ];

    // context for the person summary template
    const context = {
      recentlyAssessed: true,
      isHIVPositive: false,
      isPregnant: true,
      hasRecentlyDelivered: false,
      firstParentType: 'clinic',
      newestANCAppointmentDate: DateTime.local().plus({ days: 2 }).toISODate(),
      hasBeenRecentlyScreened: true,
      isOfChildBearingAge: true,
      currentEDD: DateTime.local().plus({ days: 5 }).toISODate(),
      fpMethodLabel: 'Test FP Method',
    };

   
    const personSummaryData = await personSummary(context, contact, reports, lineage);

    
    expect(personSummaryData).to.have.property('fields');
    expect(personSummaryData).to.have.property('cards');


    expect(personSummaryData.fields).to.be.an('array').that.is.not.empty;
    expect(personSummaryData.cards).to.be.an('array').that.is.not.empty;

    console.log('Person Summary Data:', personSummaryData);
  });
});
