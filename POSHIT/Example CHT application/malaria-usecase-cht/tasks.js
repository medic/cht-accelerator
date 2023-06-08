const extras = require('./tools-extra');
const {
  isFormArraySubmittedInWindow,
  addDays,
  getField
} = extras;

module.exports = [
  {
    name: 'household-assessment-followup',
    title: 'task.household_assessment_followup.title',
    appliesTo: 'reports',
    appliesToType: ['household_assessment'],
    appliesIf: function (contact, report) {
      return getField(report, 'household_assessment.amendment_date');
    },

    resolvedIf: function (contact, report, event, dueDate) {
      const startTime = Math.max(addDays(dueDate, -event.start).getTime(), report.reported_date + 1);
      const endTime = addDays(dueDate, event.end + 1).getTime();
      return isFormArraySubmittedInWindow(contact.reports, ['household_assessment'], startTime, endTime);
    },
    actions: [
      {
        type: 'report',
        form: 'household_assessment',
        modifyContent: function (content){
          content.visitType = 'follow_up';
        } 
      }
    ],
    events: [
      {
        id: 'household_assessment',
        start: 7,
        end: 7,
        dueDate: function (event, contact, report) {
          return new Date(getField(report, 'household_assessment.amendment_date'));
        }
      }
    ]
  }
];
