module.exports = {
  followUpMemberScenarios: {
    memberVisitedFacility: { visited_facility: 'yes', any_danger_signs: 'no' },
  },
  houseHoldAssessmentScenarios: {
    choleraCaseDefinition: {
      danger_signs_present: 'yes',
      crucial_symptoms: 'acute watery diarrhea',
      number_of_motions: '4',
      dehydration: 'yes',
      muscle_cramps: 'no',
      rapid_heart_rate: 'yes',
      low_blood_pressure: 'no',
      shock: 'no',
      patient_well_being: 'worsening',
    },
    noCholeraCaseDefinition: { danger_signs_present: 'no' },
  },
  queryCholeraCaseScenarios:{
    seekVerification: {chp_to_verify: 'yes'}
  },
  confirmReportedCaseScenarios:{
    confirmedCase: {confirm_case: 'yes'},
    unconfirmedCase: {confirm_case: 'no'}
  },
  specimenCollectedScenarios: {
    specimenNotCollected: {specimen_collected: 'no'}
  },
  specimenFormScenarios:{
    page1positiveCholeraCase: ['yes','2024-02-05'],
    page2positiveCholeraCase:['both','SPEC01','positive',''],
    untestCholeraCase: ['no']
  },
  choleraFollowupScenarios:{
    choleraFollowup:['yes','yes','yes','yes','yes','yes','yes','yes','yes','yes'],
    nocholeraFollowup:['no','Recovered','no']
},
deathReportScenario:{
  reportedDeath:['2024-02-05','health_facility','Died while sleeping']
}
};
