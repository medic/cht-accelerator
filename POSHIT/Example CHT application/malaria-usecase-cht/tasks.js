const extras = require('./nools-extras');
const {FORMS, TASKS} = require('./shared-extras');

const {
  isFormArraySubmittedInWindow,
} = extras;

module.exports = [
  {
    name: 'household-assessment-followup',
    title: 'task.household_assessment_followup.title',
    appliesTo: 'reports',
    appliesToType: ['household_assessment'],
    appliesIf: function (contact, report) {
      return Utils.getField(report, 'household_assessment.amendment_date');
    },

    resolvedIf: function (contact, report, event, dueDate) {
      const startTime = Math.max(Utils.addDate(dueDate, -event.start).getTime(), report.reported_date + 1);
      const endTime = Utils.addDate(dueDate, event.end + 1).getTime();
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
          return new Date(Utils.getField(report, 'household_assessment.amendment_date'));
        }
      }
    ]
  },
  {
    name: 'children_under_5_follow_up',
    icon: 'child-under-5.svg',
    title: TASKS.CHILD_ASSESSMENT_FOLLOW_UP,
    appliesTo: 'reports',
    appliesToType: [FORMS.CHILD_ASSESSMENT, FORMS.CHILD_FOLLOW_UP],
    appliesIf: function (contact, report) {
      return Utils.getField(report, 'referral_follow_up_date');
    },

    resolvedIf: function (contact, report, event, dueDate) {
      const startTime = Math.max(Utils.addDate(dueDate, -event.start).getTime(), report.reported_date + 1);
      const endTime = Utils.addDate(dueDate, event.end + 1).getTime();
      return isFormArraySubmittedInWindow(contact.reports, [FORMS.CHILD_ASSESSMENT,FORMS.CHILD_FOLLOW_UP], startTime, endTime);
    },
    actions: [
      {
        type: 'report',
        form: FORMS.CHILD_FOLLOW_UP,
      }
    ],
    events: [
      {
        id: FORMS.CHILD_FOLLOW_UP,
        start: 3,
        end: 3,
        dueDate: function (event, contact, report) {
          return new Date(Utils.getField(report, 'referral_follow_up_date'));
        }
      }
    ]
  }
];
