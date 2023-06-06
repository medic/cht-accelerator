const { DateTime, Duration } = require('luxon');
const NOW = DateTime.local();

module.exports = {
  padrScenarios: {
    reaction: [
      ['Vomiting_or_diarrhea', 'No Other Side Effects', '2023-04-30', 'yes'],
    ],
    medicine: [
      ['The_label_looks_wrong', 'None'],
    ]
  },
  submissionScenario: {
    male: (creationDate) => [
      [creationDate, 'facility', 'no'],
      [1, 1],
      ['Test Male Person', 'male', 'none']
    ],
    female: (creationDate) => [
      [creationDate, 'facility', 'no'],
      [1, 1],
      ['Test Female Person', 'female', 'yes']
    ]
  },
};
