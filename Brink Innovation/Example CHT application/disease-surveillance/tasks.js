const extras = require('./nools-extras');
//const export = require('luxon');
const {
 // MAX_DAYS_IN_CHOLERA,
  //today,
  isAlive,
  isFormArraySubmittedInWindow,
  getDateISOLocal,
  addDays,
  isCholeraTaskMuted,
  getField
} = extras;

module.exports = [
  {
    name: 'assessment-after-registration',
    title: 'First Assessment',
    icon: 'icon-form-general.svg',
    appliesTo: 'contacts',
    appliesToType: ['patient'],
    appliesIf: (c) =>
      c.parent &&
      c.parent.contact_type === 'chp_area' &&
      !c.contact.date_of_death &&
      !c.contact.muted,
    actions: [{ form: 'assessment' }],
    events: [
      {
        start: 7,
        days: 7,
        end: 0,
      },
    ],
  },
  {
    name: 'suspicion_followup.from_report',
    icon: 'icon-follow-up',
    title: 'task.patient.suspicion_followup.title',
    appliesTo: 'contacts',
    appliesToType: ['patient.suspicion_followup'],
    appliesIf: function (contact, report) {
      return (
        getField(report, 't_danger_signs_referral_follow_up') === 'yes' &&
        isAlive(contact)
      );
    },
    resolvedIf: function (contact, report, event, dueDate) {
      // Check if the task is muted (refused or migrated) and cleared tasks
      if (isCholeraTaskMuted(contact)) {
        return true;
      }

      const startTime = Math.max(addDays(dueDate, -event.start).getTime(), report.reported_date + 1);
      // Ensure reported_date + 1 so that source ds_follow_up does not resolve itself
      const endTime = addDays(dueDate, event.end + 1).getTime();

      return isFormArraySubmittedInWindow(
        contact.reports,
        ['patient.suspicion_followup'],
        startTime,
        endTime
      );
    },
    actions: [
      {
        type: 'report',
        form: 'patient.suspicion_followup',
        modifyContent: function (content, contact, report) {
          content.delivery_uuid = getField(report, 'inputs.delivery_uuid');
        },
      },
    ],
    events: [
      {
        id: 'patient-danger-sign-follow-up',
        start: 3,
        end: 7,
        dueDate: function (event, contact, report) {
          return getDateISOLocal(getField(report, 't_danger_signs_referral_follow_up_date'));
        },
      },
    ],
  },
  // Add more objects as needed
];
  
