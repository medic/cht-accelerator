module.exports = {
  healthFacility: {
    full: [
      ['new_person','Njeru'],
      ['true']
    ],
    withoutHead: [
      ['none'],
      ['Omondi']
    ]
  },
  supervisorRegion: {
    full: [
      ['new_person','Mumbi'],
      ['true']
    ],
    withoutHead: [
      ['none'],
      ['Albright']
    ]
  },
  supervisorCreate: {
    full: [
      ['Mumbi'],
    ]
  },
  nurseCreate: {
    full: [
      ['Wambui'],
    ]
  },
  communityHealthArea: {
    ok: [
      ['new_person', 'Joseph', '+254723567876'],
      ['Kianjogu Area', 'QA678', 'mombasa', 'jomvu', 'mikindani', 'Mirangi', 'Main road'],
      ['true']
    ]
  },
  communityHealthVolunteer: {
    ok: [
      ['Joyce Kim', 'female', '1997-05-05', '+254718789765']
    ],
  },
  household: {
    ok: [
      ['Johnson Sulman', 'Some notes', 'male', 'no', 50, '+254712345600', '+254712345671'],
      ['3.074695 37.608244 0 0'],
      ['yes', 'false']
    ]
  },
  householdMember: {
    ok: [
      ['Melvin Makinya', 'male', 'over5', 'yes', '2002-06-02', '+254712345120', '+254712345842', 'child']
    ],
  },
  deathReportScenarios: {
    withDeathDate: deathDate => [
      [deathDate, 'health_facility', 'Died while sleeping.'],
    ]
  },
  childAssessment: {
    provisionRDT: [[...Array(10).fill('no'), 'yes', 'yes']],
    followUp: [['yes'], ['improving']]
  },
  memberAssessmentTask: {
    followUp: [['yes'], ['yes', 'yes', 'no', 'improving']],
    followUpMalaria: [['yes'], [...Array(3).fill('yes'), 'improving']],
    followUpRepeat: (amendmentDate) => [['no', amendmentDate]]
  },
  memberAssessment: {
    showSymptoms: [['yes', 'yes', 'fever', 'no', 2, 'no', 'worsening', 'yes']]
  },
  childUnder5Assesmentment: {
    treatedNetHealthy: [[...Array(2).fill('yes'), ...Array(11).fill('no') ]],
    showSymptoms: [[...Array(2).fill('no'), ...Array(9).fill('no'), 'yes' ]],
  },
  unmuteHouseholdScenarios: {
    withReason: [
      ['all_members_came_back']
    ],
    withOtherReason: [
      ['other', 'household resolved issues']
    ]
  },
  unMuteHouseholdMemberScenarios: {
    withReason: [
      ['came_back']
    ],
  },
  muteHouseholdMemberScenarios: {
    withReason: [
      ['refused_chw_services']
    ],
    withOtherReason: [
      ['other', 'Negativity and illiteracy']
    ]
  },
  muteHouseholdScenarios: {
    withReason: [
      ['household_refused_chv_services']
    ],
    withOtherReason: [
      ['other', 'household personal issues']
    ]
  },
  pregnancyRegistrationScenarios: {
    notPregnant: [
      ['no'],
    ],
    pregnancyNotConfirmed: (followUpDate)=>[
      ['yes','no', 0, followUpDate]
    ]
  },
  householdAssessment: {
    provisionRDT: (amendmentDate) => [['yes', 2, 'no', ...Array(5).fill('yes'), amendmentDate]],
    provisionRDTCopy: (amendmentDate) => [['yes','no', ...Array(5).fill('yes'), amendmentDate]],
    captureResult: (amendmentDate) => [['yes', 2, 'no', ...Array(5).fill('yes'), amendmentDate]],
    captureResultWithRepeat: (amendmentDate) => [['yes', 2, 'no', ...Array(5).fill('yes'), amendmentDate]],
    captureResultComplete: ['yes', 3, 'yes', 3,'yes', 'yes', 'yes', 'no', 'no'],
    captureResultLowLLN: ['yes', 1, 'yes', 1,'yes', 'yes', 'yes', 'no', 'no'],
  },
  assessment: {
    provisionRDT: (amendmentDate) => [['yes', 2, 'no', ...Array(5).fill('yes'), amendmentDate]],
    provisionRDTCopy: (amendmentDate) => [['yes', 'no', ...Array(5).fill('yes'), amendmentDate]],
    captureResult: (amendmentDate) => [['yes', 2, 'no', ...Array(5).fill('yes'), amendmentDate]],
    captureResultWithRepeat: (amendmentDate) => [['yes', 2, 'no', ...Array(5).fill('yes'), amendmentDate]]
  }
};