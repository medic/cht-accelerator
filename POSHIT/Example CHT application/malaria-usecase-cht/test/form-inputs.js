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
    childUnder5Assesmentment: {
      treatedNetHealthy: [[...Array(2).fill('yes'), ...Array(11).fill('no') ]],
      showSymptoms: [[...Array(2).fill('no'), ...Array(9).fill('no'), 'yes' ]],
    },
}
