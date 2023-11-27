const { DateTime } = require('luxon');
const { getCurrentEDD } = require('./helper');
const {
  resolveIfClosure_isReportInEventWindow,
  getLatestReferralStatus,
  isVHT,
  //isSupervisor,
  toDate,
  pregnancyEnded,
  isMuted,
  formInSubmittedWindowMatchesFields,
  ANC_VISITS,
  getDaysToNextANCVisit
} = require('./task-extras');

const ancReferralTemplate = (taskName, appliesIf, events, reportForm = 'anc_visit_follow_up') => ({
  name: `${reportForm}_yields_${taskName}`,
  icon: 'medic-health-center',
  title: `task.${taskName}.title`,
  appliesTo: 'reports',
  appliesToType: [reportForm],
  appliesIf,
  resolvedIf: (contact, report, event, dueDate) =>
    (pregnancyEnded(contact, report) ||
    formInSubmittedWindowMatchesFields(contact, event, dueDate, 'anc_referral_follow_up',
      { 'inputs.task_name': taskName })),
  actions: [{
    type: 'report',
    form: 'anc_referral_follow_up',
    label: `task.${taskName}.label`,
    modifyContent: (content, contact, report) => {
      content.task_name = taskName;
      content.anc_appointment_date = Utils.getField(report, 'group_upcoming_anc_visits.anc_appointment_date');
    },
  }],
  events
});

const pncFollowUpTemplate = (taskName, appliesIf, events) => ({
  name: taskName,
  icon: 'mother-child',
  title: `task.${taskName}.title`,
  appliesTo: 'reports',
  appliesToType: ['delivery'],
  appliesIf,
  resolvedIf: (contact, report, event, dueDate) => (
    Utils.getMostRecentReport(contact.reports, 'pnc_follow_up', { 'inputs.task_name': taskName })
    && resolveIfClosure_isReportInEventWindow('pnc_follow_up')(contact, report, event, dueDate)
  ),
  actions: [{
    form: 'pnc_follow_up',
    label: `task.${taskName}.label`,
    modifyContent: (content) => {
      content.task_name = taskName;
    },
  }],
  events
});

const maternalNutritionFollowUpTemplate = (taskName, appliesIf, isReferralFollowUp, events) => ({
  name: taskName,
  icon: 'nutrition',
  title: `task.${taskName}.title`,
  appliesTo: 'reports',
  appliesToType: ['pregnancy', 'anc_visit_follow_up', 'delivery', 'pnc_follow_up'],
  appliesIf,
  resolvedIf: (contact, report, event, dueDate) => {
    const fieldsToMatch = { 'inputs.is_referral_follow_up': isReferralFollowUp };
    return formInSubmittedWindowMatchesFields(contact, event, dueDate, 'maternal_nutrition_follow_up', fieldsToMatch);
  },
  actions: [{
    form: 'maternal_nutrition_follow_up',
    label: `task.${taskName}.label`,
    modifyContent: (content) => {
      content.is_referral_follow_up = isReferralFollowUp;
    },
  }],
  events
});

module.exports = [

  {
    name: 'device_functionality_report_follow_up',
    icon: 'device',
    title: 'task.device_functionality',
    appliesTo: 'reports',
    appliesToType: [ 'device_functionality'],
    appliesIf: function (report) {
      return Utils.getField(report, 'g_device_functionality.stolen_device_reported') === 'no';
    },  
    resolvedIf: (report ) => formInSubmittedWindowMatchesFields( report,
      {'file_report': 'yes' }),
    actions: [
      {
        type:'report',
        form: 'device_functionality_follow_up',
        label: 'task.device_functionality.label',
      },
    ],
    events: [
      {
        start: 0,
        days: 30,
        end: 30,
      }
    ],
  },

  {
    name: `assessment_treatment_followup`,
    icon: 'treatment',
    title: 'task.assessement_treatment.title',
    appliesTo: 'reports',
    appliesToType: ['assessment'],
    appliesIf: (contact, report) => isVHT() && !isMuted(contact) && 
      Utils.getField(report, 'treat_child_for_diagnosis') === 'yes',
    resolvedIf: resolveIfClosure_isReportInEventWindow('treatment_follow_up'),
    actions: [
      {
        type: 'report',
        form: 'treatment_follow_up',
        label: 'task.assessement_treatment.label',
        modifyContent: (content, contact, report) => {
          content.latest_referral_status = getLatestReferralStatus(
            contact,
            report
          );
        },
      },
    ],
    events: [
      { id: 'treatment_follow_up1', start: 1, days: 1, end: 0 },
      { id: 'treatment_follow_up2', start: 1, days: 3, end: 2 },
      { id: 'treatment_follow_up3', start: 1, days: 7, end: 2 }
    ]
  },
  {
    name: `assessment_referral_followup`,
    icon: 'treatment',
    title: 'task.assessement_referral.title',
    appliesTo: 'reports',
    appliesToType: ['assessment', 'treatment_follow_up'],
    appliesIf: (contact, report) => {
      let hasReferralFollowUp;
      if (report.form === 'treatment_follow_up') {
        hasReferralFollowUp = Utils.getField(report, 'trigger_referral_follow_up') === 'yes';
      } else {
        hasReferralFollowUp = Utils.getField(report, 'group_patient_summary.have_you_referred') === 'yes';
      }
      return isVHT() && !isMuted(contact) && hasReferralFollowUp;
    },
    resolvedIf: resolveIfClosure_isReportInEventWindow('referral_follow_up'),
    actions: [
      {
        type: 'report',
        form: 'referral_follow_up',
        label: 'task.assessement_referral.label',
      },
    ],
    events: [
      { id: 'referral_follow_up1', start: 1, days: 1, end: 0 },
      { id: 'referral_follow_up2', start: 1, days: 3, end: 2 },
      { id: 'referral_follow_up3', start: 1, days: 7, end: 2 }
    ]
  },
  {
    name: 'wash_report',
    icon: 'survey',
    title: 'task.wash_report.title',
    appliesTo: 'contacts',
    appliesToType: ['clinic'],
    appliesIf: (contact) => isVHT() && !isMuted(contact),
    resolvedIf: resolveIfClosure_isReportInEventWindow('wash_report'),
    actions: [
      {
        type: 'report',
        form: 'wash_report',
        label: 'task.wash_report.label',
      },
    ],
    events: ['01', '04', '07', '10'].map(month => {
      const year = Utils.now().getFullYear();
      const dueDate = DateTime.fromObject({ year, month, day: 1 });

      return {
        id: `wash_report_${dueDate.month}-${dueDate.year}`,
        dueDate: () => dueDate.toJSDate(),
        start: 1,
        end: 14,
      };
    }),
  },
  {
    name: 'anc_visit_follow_up',
    icon: 'pregnancy-3',
    title: 'task.anc_visit_follow_up.title',
    appliesTo: 'reports',
    appliesToType: ['pregnancy'],
    appliesIf: (contact, report) => isVHT() && !isMuted(contact) && !!Utils.getField(report, 'lmp'),
    resolvedIf: (contact, report, event, dueDate) => (
      pregnancyEnded(contact, report) ||
      resolveIfClosure_isReportInEventWindow('anc_visit_follow_up')(contact, report, event, dueDate)
    ),
    actions: [{
      type: 'report',
      form: 'anc_visit_follow_up',
      label: 'task.anc_visit_follow_up.label',
      modifyContent: (content, contact) => {
        content.current_edd_std = getCurrentEDD(contact.reports);
      },
    }],
    events: ANC_VISITS.map((weeks, index) => ({
      id: `lmp+${weeks}`,
      start: 3,
      dueDate: (event, contact, report) => {
        const lmp = Utils.getField(report, 'lmp');
        const daysSinceLmp = weeks * 7;
        return toDate(lmp, daysSinceLmp);
      },
      end: (getDaysToNextANCVisit(index, weeks) - 5) || 7
    }))
  },
  {
    name: 'anc_danger_sign_follow_up',
    icon: 'risk',
    title: 'task.anc_danger_sign_follow_up.title',
    appliesTo: 'reports',
    appliesToType: ['anc_danger_sign', 'pregnancy'],
    appliesIf: (contact, report) => (
      isVHT() && !isMuted(contact) && Utils.getField(report, 'group_danger_sign_check.has_danger_signs') === 'yes' &&
      ((Utils.getField(report, 'inputs.is_follow_up') === 'no' && report.form === 'anc_danger_sign')
        || report.form === 'pregnancy')
    ),
    resolvedIf: (contact, report, event, dueDate) =>
      (pregnancyEnded(contact, report) ||
        formInSubmittedWindowMatchesFields(contact, event, dueDate, 'anc_danger_sign',
          { 'inputs.is_follow_up': 'yes' })),
    actions: [{
      type: 'report',
      form: 'anc_danger_sign',
      label: 'task.anc_danger_sign_follow_up.label',
      modifyContent: (content) => {
        content.is_follow_up = 'yes';
      },
    }],
    events: [
      {
        start: 3,
        days: 3,
        end: 4
      }
    ]
  },
  ancReferralTemplate(
    'health_facility_anc_reminder',
    function (contact, report) {
      this.ancAppointmentDate = Utils.getField(report, 'group_upcoming_anc_visits.anc_appointment_date');
      return isVHT() && !isMuted(contact) && !!this.ancAppointmentDate;
    },
    [
      {
        start: 3,
        end: 2,
        dueDate: function () {
          return toDate(this.ancAppointmentDate);
        }
      }
    ]
  ),
  ancReferralTemplate(
    'anc_defaulter_follow_up',
    (contact, report) => isVHT() && !isMuted(contact) &&
      Utils.getField(report, 'group_past_anc_visits.completed_scheduled_anc_visit') === 'no',
    [
      {
        start: 3,
        days: 3,
        end: 3
      }
    ]
  ),
  {
    name: 'fp-referral-follow-up',
    icon: 'icon-follow-up',
    title: 'task.fp_referral_follow_up.title',
    appliesTo: 'reports',
    appliesToType: ['fp_registration', 'fp_follow_up'],
    appliesIf: (contact, report) => isVHT() && (!isMuted(contact)) && Utils.getField(report, 'needs_method_change') === 'true',
    actions: [{ form: 'fp_referral_follow_up' }],
    events: [{
      id: 'fp-referral-follow-up',
      start: 3, 
      end: 14,
      days: 3
    }]
  },
  {
    name: 'fp-follow-up',
    icon: 'icon-follow-up',
    title: 'task.fp_follow_up.title',
    appliesTo: 'reports',
    appliesToType: ['fp_registration', 'fp_follow_up'],
    appliesIf: (contact, report) => isVHT() && !isMuted(contact) && Utils.getField(report, `${report.form}.continue_current_fp_method`) === 'yes',
    actions: [{ form: 'fp_follow_up' }],
    events:[{
      id: 'fp-follow-up',
      start: 2,
      end: 14,
      dueDate: (event, contact, report) => {
        return new Date(Utils.getField(report, `${report.form}.next_appt_date`));
      }
    }]
  },
  {
    name: 'delivery_check',
    icon: 'pregnancy-4',
    title: 'task.delivery_check.title',
    appliesTo: 'reports',
    appliesToType: ['pregnancy'],
    appliesIf: (contact) => isVHT() && !isMuted(contact),
    resolvedIf: (contact, report, event, dueDate) => (
      pregnancyEnded(contact, report) ||
      resolveIfClosure_isReportInEventWindow('delivery_check')(contact, report, event, dueDate)
    ),
    actions: [{
      form: 'delivery_check',
      label: 'task.delivery_check.label',
    }],
    events: [{
      dueDate: (event, contact) => {
        return toDate(getCurrentEDD(contact.reports));
      },
      start: 3,
      end: 0,
    }],
  },
  ancReferralTemplate(
    'anc_referral_follow_up',
    (contact, report) => isVHT() && !isMuted(contact) &&
      Utils.getField(report, 'group_pregnancy_screening.referred_to_health_facility_anc') === 'yes',
    [
      {
        start: 3,
        days: 3,
        end: 2
      }
    ],
    'screening'
  ),
  pncFollowUpTemplate(
    'pnc_follow_up_mother',
    (contact, report) => isVHT() && !isMuted(contact) && Utils.getField(report, 'group_woman_condition.woman_outcome') !== 'dead',
    [1, 7, 42].map(days => ({
      id: `delivery_date+${days}`,
      start: 3,
      dueDate: (event, contact, report) => {
        const deliveryDate = Utils.getField(report, 'group_delivery_information.delivery_date');
        return toDate(deliveryDate, days);
      },
      end: days === 1 ? 2 : 4
    }))
  ),
  pncFollowUpTemplate(
    'pnc_referral_follow_up',
    (contact, report) => {
      const deliveryPlace = Utils.getField(report, 'group_delivery_information.delivery_place');
      return isVHT() && !isMuted(contact) && (deliveryPlace === 'home' || deliveryPlace === 'other') &&
        Utils.getField(report, 'group_delivery_information.referred_to_health_facility_home_delivery') === 'yes';
    },
    [{ start: 3, days: 3, end: 2 }]
  ),
  {
    name: 'pnc_danger_sign_follow_up',
    icon: 'risk',
    title: 'task.pnc_danger_sign_follow_up.title',
    appliesTo: 'reports',
    appliesToType: ['delivery', 'pnc_danger_sign'],
    appliesIf: (contact, report) => isVHT() && !isMuted(contact) && Utils.getField(report, 'woman_has_danger_signs') === 'yes',
    resolvedIf: (contact, report, event, dueDate) =>
      formInSubmittedWindowMatchesFields(contact, event, dueDate, 'pnc_danger_sign',
        { 'inputs.is_follow_up': 'yes' }),
    actions: [{
      form: 'pnc_danger_sign',
      label: 'task.pnc_danger_sign_follow_up.label',
      modifyContent: (content) => {
        content.is_follow_up = 'yes';
      },
    }],
    events: [{
      start: 3,
      days: 3,
      end: 2,
    }],
  },
   
  maternalNutritionFollowUpTemplate(
    'maternal_nutrition_referral_follow_up',
    (contact, report) => isVHT() && !isMuted(contact) && Utils.fieldsMatch(report, {'referred_for_nutrition_follow_up': 'yes'}),
    'yes',
    [{ start: 3, days: 7, end: 4 }]
  ),
  maternalNutritionFollowUpTemplate(
    'maternal_nutrition_follow_up',
    function (contact, report) {
      this.appointmentDate = Utils.getField(report, 'nutrition_follow_up_date');
      return isVHT() && !isMuted(contact) && !!this.appointmentDate;
    },
    'no',
    [{
      start: 3,
      dueDate: function () {
        return toDate(this.appointmentDate);
      },
      end: 4
    }]
  ),
  /**{
    name: 'vht_visit',
    icon: 'calendar',
    title: 'task.vht_visit',
    appliesTo: 'contacts',
    appliesToType: ['clinic'],
    resolvedIf: resolveIfClosure_isReportInEventWindow('task.vht_visit'),
    actions: [
      {
        type: 'report',
        form: 'vht_visit',
        label: 'task.vht_visit',
      },
    ],
    events: ['01', '04', '07', '10'].map(month => {
      const year = Utils.now().getFullYear();
      const dueDate = DateTime.fromObject({ year, month, day: 1 });

      return {
        id: `vht_visit_report_${dueDate.month}-${dueDate.year}`,
        dueDate: () => dueDate.toJSDate(),
        start: 1,
        end: 14,
      };
    }),
  },*/
    
  
];





