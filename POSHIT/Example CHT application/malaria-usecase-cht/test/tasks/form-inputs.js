module.exports = {
  assessment: {
    provisionRDT: (amendmentDate) => [['yes', 2, 'no', ...Array(5).fill('yes'), amendmentDate]],
    provisionRDTCopy: (amendmentDate) => [['yes', 'no', ...Array(5).fill('yes'), amendmentDate]],
    captureResult: (amendmentDate) => [['yes', 2, 'no', ...Array(5).fill('yes'), amendmentDate]],
    captureResultWithRepeat: (amendmentDate) => [['yes', 2, 'no', ...Array(5).fill('yes'), amendmentDate]]
  },
  childAssessment: {
    provisionRDT: [[...Array(10).fill('no'), 'yes', 'yes']],
    followUp: [['yes'], ['improving']]
  }
};
