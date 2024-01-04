const extras = require('./nools-extras');
const {FORMS, TASKS} = require('./shared-extras');

const {
  isFormArraySubmittedInWindow,
  isAlive,
  isPregnancyTaskMuted
} = extras;

module.exports = [
  {
    icon: 'household-assessment-followup',
    name: 'household-assessment-followup',
    title: 'task.household_assessment_followup.title',
    appliesTo: 'reports',
    appliesToType: [FORMS.HOUSEHOLD_ASSESSMENT, 'household_assesment_follow_up'],
    appliesIf: function (contact, report) {
      return Utils.getField(report, 'referral_follow_up_date');
    },

    resolvedIf: function (contact, report, event, dueDate) {
      const startTime = Math.max(Utils.addDate(dueDate, -event.start).getTime(), report.reported_date + 1);
      const endTime = Utils.addDate(dueDate, event.end + 1).getTime();
      return isFormArraySubmittedInWindow(contact.reports, ['household_assessment', 'household_assesment_follow_up'], startTime, endTime);
    },
    actions: [
      {
        type: 'report',
        form: 'household_assesment_follow_up'
      }
    ],
    events: [
      {
        id: 'household_assesment_follow_up',
        start: 3,
        end: 3,
        dueDate: function (event, contact, report) {
          return new Date(Utils.getField(report, 'referral_follow_up_date'));
        }
      }
    ]
  },
  {
    name: 'children_under_5_follow_up',
    icon: 'child-under-5',
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
  },
  {
    name: 'household_member_follow_up',
    icon: 'member-follow-up',
    title: TASKS.HOUSEHOLD_MEMBER_FOLLOW_UP,
    appliesTo: 'reports',
    appliesToType: [FORMS.MEMBER_ASSESSMENT, FORMS.MEMBER_FOLLOW_UP],
    appliesIf: function (contact, report) {
      return Utils.getField(report, 'referral_follow_up_date');
    },

    resolvedIf: function (contact, report, event, dueDate) {
      const startTime = Math.max(Utils.addDate(dueDate, -event.start).getTime(), report.reported_date + 1);
      const endTime = Utils.addDate(dueDate, event.end + 1).getTime();
      return isFormArraySubmittedInWindow(contact.reports, [FORMS.MEMBER_ASSESSMENT,FORMS.MEMBER_FOLLOW_UP], startTime, endTime);
    },
    actions: [
      {
        type: 'report',
        form: FORMS.MEMBER_FOLLOW_UP,
      }
    ],
    events: [
      {
        id: FORMS.MEMBER_FOLLOW_UP,
        start: 3,
        end: 3,
        dueDate: function (event, contact, report) {
          return new Date(Utils.getField(report, 'referral_follow_up_date'));
        }
      },
    ]
  },
  //{
  //   name: 'pregnant_mother_treatment_follow_up',
  //   icon: 'malaria-assessment-for-pregnant-mothers',
  //   title: TASKS.PREGNANT_MOTHER_TREATMENT_FOLLOW_UP,
  //   appliesTo: 'reports',
  //   appliesToType: [FORMS.MALARIA_ASSESSMENT_FOR_PREGNANT_MOTHERS],
  //   appliesIf: function (contact, report) {
  //     return isAlive(contact) && !isPregnancyTaskMuted(contact) && Utils.getField(report, 'group_malaria_assessment_for_pregnant_mothers.treatment_referral_follow_up_date');
  //   },

  //   resolvedIf: function (contact, report, event, dueDate) {
  //     if(isPregnancyTaskMuted(contact) && !isAlive(contact)) {return true;}
  //     const startTime = Math.max(Utils.addDate(dueDate, -event.start).getTime(), report.reported_date + 1);
  //     const endTime = Utils.addDate(dueDate, event.end + 1).getTime();
  //     return isFormArraySubmittedInWindow(contact.reports, [FORMS.MALARIA_ASSESSMENT_FOR_PREGNANT_MOTHERS], startTime, endTime);
  //   },
  //   actions: [
  //     {
  //       type: 'report',
  //       form: FORMS.MALARIA_TREATMENT_FOLLOW_UP,
  //       modifyContent: function (content){
  //         content.visitType = 'follow_up';
  //       } 
  //     }
  //   ],
  //   events: [
  //     {
  //       id: FORMS.MALARIA_TREATMENT_FOLLOW_UP,
  //       start: 30,
  //       end: 30,
  //       dueDate: function (event, contact, report) {
  //         return new Date(Utils.getField(report, 'group_malaria_assessment_for_pregnant_mothers.referral_follow_up_date'));
  //       }
  //     }
  //   ]
  // },
  {
    name: 'pregnant_mother_treatment_follow_up',
    icon: 'malaria-assessment-for-pregnant-mothers',
    title: TASKS.PREGNANT_MOTHER_TREATMENT_FOLLOW_UP,
    appliesTo: 'reports',
    appliesToType: [FORMS.MALARIA_ASSESSMENT_FOR_PREGNANT_MOTHERS],
    appliesIf: function (contact, report) {
      return isAlive(contact) && !isPregnancyTaskMuted(contact) && Utils.getField(report, 'group_malaria_assessment_for_pregnant_mothers.referral_follow_up_date');
    },

    resolvedIf: function (contact, report, event, dueDate) {
      if(isPregnancyTaskMuted(contact) && !isAlive(contact)) {return true;}
      const startTime = Math.max(Utils.addDate(dueDate, -event.start).getTime(), report.reported_date + 1);
      const endTime = Utils.addDate(dueDate, event.end + 1).getTime();
      return isFormArraySubmittedInWindow(contact.reports, [FORMS.MALARIA_ASSESSMENT_FOR_PREGNANT_MOTHERS], startTime, endTime);
    },
    actions: [
      {
        type: 'report',
        form: FORMS.MALARIA_TREATMENT_FOLLOW_UP,
        modifyContent: function (content){
          content.visitType = 'follow_up';
        } 
      }
    ],
    events: [
      {
        id: FORMS.MALARIA_TREATMENT_FOLLOW_UP,
        start: 30,
        end: 30,
        dueDate: function (event, contact, report) {
          return new Date(Utils.getField(report, 'group_malaria_assessment_for_pregnant_mothers.referral_follow_up_date'));
        }
      }
    ]
  },
  {
    name: 'pregnant_mother_referal_follow_up',
    icon: 'malaria-assessment-for-pregnant-mothers',
    title: TASKS.PREGNANT_MOTHER_TREATMENT_REFERAL_FOLLOW_UP,
    appliesTo: 'reports',
    appliesToType: [FORMS.MALARIA_ASSESSMENT_FOR_PREGNANT_MOTHERS],
    appliesIf: function (contact, report) {
      return isAlive(contact) && !isPregnancyTaskMuted(contact) && Utils.getField(report, 'group_malaria_assessment_for_pregnant_mothers.referral_follow_up_date');
    },

    resolvedIf: function (contact, report, event, dueDate) {
      if(isPregnancyTaskMuted(contact) && !isAlive(contact)) {return true;}
      const startTime = Math.max(Utils.addDate(dueDate, -event.start).getTime(), report.reported_date + 1);
      const endTime = Utils.addDate(dueDate, event.end + 1).getTime();
      return isFormArraySubmittedInWindow(contact.reports, [FORMS.MALARIA_ASSESSMENT_FOR_PREGNANT_MOTHERS], startTime, endTime);
    },
    actions: [
      {
        type: 'report',
        form: FORMS.MALARIA_ASSESSMENT_FOR_PREGNANT_MOTHERS,
        modifyContent: function (content){
          content.visitType = 'follow_up';
        } 
      }
    ],
    events: [
      {
        id: FORMS.MALARIA_ASSESSMENT_FOR_PREGNANT_MOTHERS,
        start: 30,
        end: 30,
        dueDate: function (event, contact, report) {
          return new Date(Utils.getField(report, 'group_malaria_assessment_for_pregnant_mothers.referral_follow_up_date'));
        }
      }
    ]
  },
  {
    name: 'pregnant_registration_follow_up',
    icon: 'malaria-assessment-for-pregnant-mothers',
    title: TASKS.PREGNANT_REGISTRATION_FOLLOW_UP,
    appliesTo: 'reports',
    appliesToType: [FORMS.PREGNANCY_REGISTRATION, FORMS.PREGNANCY_REGISTRATION_FOLLOWUP],
    appliesIf: function (contact, report) {
      return isAlive(contact) && Utils.getField(report, 'pregnancy_follow_up_date');
    },

    resolvedIf: function (contact, report, event, dueDate) {
      if(!isAlive(contact)) {return true;}
      // eslint-disable-next-line
      //console.log(report)
      const startTime = Math.max(Utils.addDate(dueDate, -event.start).getTime(), report.reported_date + 1);
      const endTime = Utils.addDate(dueDate, event.end + 1).getTime();
      return isFormArraySubmittedInWindow(contact.reports, [FORMS.PREGNANCY_REGISTRATION,FORMS.PREGNANCY_REGISTRATION_FOLLOWUP], startTime, endTime);
    },
    actions: [
      {
        type: 'report',
        form: FORMS.PREGNANCY_REGISTRATION_FOLLOWUP,
        modifyContent: function (content){
          //content.visitType = 'follow_up';
          // eslint-disable-next-line
          console.log(content);
        } 
      }
    ],
    events: [
      {
        id: FORMS.PREGNANCY_REGISTRATION_FOLLOWUP,
        start: 30,
        end: 30,
        dueDate: function (event, contact, report) {
          return new Date(Utils.getField(report, 'pregnancy_follow_up_date'));
        }
      }
    ]
  }
];
