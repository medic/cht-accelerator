const { DateTime, Duration } = require('luxon');
const NOW = DateTime.local();

module.exports = {
  padrScenarios: {
    availability: [
      ['No'],
    ],
    reaction: [
      ['Yes'],
      ['Japheth Kiprotich', '+254700123432', 'Self', 'Mombasa', 'Reaction'],
      ['Vomiting_or_diarrhea,Dizziness_or_drowsiness', '', '2023-08-23', 'Yes'],
      ['1', 'Medicine', 'Manufacturer', 'Location', '2023-08-20', '2023-08-23', '2024-10-20'],
      ['Death'],
    ],

    // Poor Quality Medicine
    medicine: [
      ['Yes'],
      ['Japheth Kiprotich', '+254700123432', 'Self', 'Mombasa', 'Medicine'],
      ['The_label_looks_wrong'],
      ['1', 'Medicine', 'Manufacturer', 'Location', '2023-08-20', '2023-08-23', '2024-10-20'],
      ['Unknown'],
    ]
  },
  assessmentScenarios: {
    medication: [
      ['Yes', 'Past 7 days', 'Yes', 'Beyond 7 days', 'Yes', 'Yes', 'No']
    ],
    immunization: [
      ['No', 'Yes', 'Within the Immunization Window', 'Yes', 'Yes', 'No']
    ],
    death: [
      ['No', 'No', 'No', 'Yes']
    ]
  },
  chwFollowUpScenarios: {
    visitedfaciltyrecovered: [
      ['Yes', 'Yes']
    ],
    visitedfaciltyneverrecovered: [
      ['Yes', 'No']
    ],
    fullyrecovered: [
      ['No', 'Patient recovered']
    ],
    neverrecovered: [
      ['No', 'Patient has not recovered']
    ]
  },
  deathConfirmationScenarios: {
    home: [
      ['2023-08-24', 'Home']
    ],
    facility: [
      ['2023-08-24', 'Health Facility']
    ]
  },
  referralScenarios: {
    confirm: [
      ['Yes']
    ],
    reject: [
      ['No']
    ]
  },
  tasksScenario: {
    householdmembervisit: (creationDate) => [
      ['Yes', 'Past 7 days', 'Yes', 'Beyond 7 days', 'Yes', 'Yes', 'No']
    ],
    patientReferred: (creationDate) => [
      ['Yes'],
      ['Japheth Kiprotich', '+254700123432', 'Self', 'Mombasa', 'Reaction'],
      ['Vomiting_or_diarrhea,Dizziness_or_drowsiness', '', '2023-08-23', 'Yes'],
      ['1', 'Medicine', 'Manufacturer', 'Location', '2023-08-20', '2023-08-23', '2024-10-20'],
      ['Not Recovered/Not Resolved'],
    ],
    deathCase: (creationDate) => [
      ['Yes', 'Past 7 days', 'Yes', 'Beyond 7 days', 'Yes', 'Yes', 'Yes']
    ],
    patientNotAvailable: (creationDate) => [
      ['No']
    ],
    noRecovery: (creationDate) => [
      ['No', 'Patient has not recovered']
    ],
    
  },
  contactScenario: {
    guardian: [
      ['Yes'],
      ['Japheth Kiprotich', '+254700123432', 'Guardian', 'Mombasa', 'Reaction'],
      ['Vomiting_or_diarrhea,Dizziness_or_drowsiness', '', '2023-08-23', 'Yes'],
      ['1', 'Medicine', 'Manufacturer', 'Location', '2023-08-20', '2023-08-23', '2024-10-20'],
      ['Death'],
    ],
    visitedfaciltyneverrecovered: [
      ['Yes', 'No']
    ],
    fullyrecovered: [
      ['No', 'Patient recovered']
    ],
    neverrecovered: [
      ['No', 'Patient has not recovered']
    ]
  },
   
};
