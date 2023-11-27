const {
  isChildUnder5,
  isPersonAbove50,
  receivedTreatment,
  receivedCoughTreatment,
  receivedDiarrhoeaTreatment,
  receivedFeverTreatment,
  reportHasReferralFollowUp,
  isDead,
} = require('./target-extras');



const under5DeathsTarget = (id, translation_key, goal) => ({
  id,
  type: 'count',
  icon: 'death',
  goal,
  context: 'user.role === "vht_supervisor"',
  //aggregate:true,
  translation_key,
  subtitle_translation_key: 'targets.duration.monthly',
  appliesTo: 'reports',
  appliesToType: ['death_report'],
  date: 'reported',
  appliesIf: (c, report) => isChildUnder5(c, report) && isDead(report)
});

const under5MalariaCasesTarget = (id, translation_key, goal) => ({
  id,
  type: 'count',
  icon: 'mrdt-positive',
  goal,
  context: 'user.role === "vht_supervisor"',
  //aggregate:true,
  translation_key,
  subtitle_translation_key: 'targets.duration.monthly',
  appliesTo: 'reports',
  appliesToType: ['assessment'],
  date: 'reported',
  appliesIf: (c, report) => isChildUnder5(c, report) && receivedFeverTreatment(report)
});

const washTargets = (id, translation_key, washField, icon = 'hat') => (
  {
    id,
    type: 'percent',
    icon,
    goal: -1,
    context: 'users.role === "vht"',
    translation_key,
    subtitle_translation_key: 'targets.duration.alltime',
    appliesTo: 'contacts',
    appliesToType: ['clinic'],
    appliesIf: c => !c.contact.muted,
    passesIf: (contact) => {
      const isRegisteredWithField = contact.contact.group_wash && contact.contact.group_wash[washField] === 'yes';
      const latestWashReport = Utils.getMostRecentReport(contact.reports, 'wash_report');
      if (latestWashReport) {
        return !contact.contact.muted && Utils.getField(latestWashReport, `group_wash.${washField}`) === 'yes';
      }

      return !contact.contact.muted && isRegisteredWithField;
    },
    date: 'now'
  }
);

module.exports = [
  {
    id: 'a50-registration-alltime',
    type: 'count',
    icon: 'a50-adult',
    goal: -1,
    //aggregate:true,
    translation_key: 'targets.a50-registration-alltime.title',
    subtitle_translation_key: 'targets.duration.alltime',
    appliesTo: 'contacts',
    context: 'user.role === "vht_supervisor"',
    appliesToType: ['person'],
    appliesIf: c => !c.contact.muted && !c.contact.date_of_death && isPersonAbove50(c),
    date: 'now'
  },

  {
    id: 'hh-registration-alltime',
    type: 'count',
    icon: 'household',
    goal: -1,
    translation_key: 'targets.hh-registration-alltime.title',
    subtitle_translation_key: 'targets.duration.alltime',
    appliesTo: 'contacts',
    appliesToType: ['clinic'],
    appliesIf: c => !c.contact.muted,
    date: 'now'
  },

  {
    id: 'u5-registration-alltime',
    type: 'count',
    icon: 'u5-infant',
    goal: -1,
    translation_key: 'targets.u5-registration-alltime.title',
    subtitle_translation_key: 'targets.duration.alltime',
    appliesTo: 'contacts',
    appliesToType: ['person'],
    appliesIf: c => !c.contact.muted && !c.contact.date_of_death && isChildUnder5(c),
    date: 'now'
  },

  // Under 5 deaths target for a specific time period (e.g., month)
  under5DeathsTarget(
    'under5-deaths-month',
    'targets.under5-deaths-month.title',
    -1
  ),

  // Under 5 confirmed Malaria Cases target for a specific time period (e.g., month)
  under5MalariaCasesTarget(
    'under5-malaria-cases-month',
    'targets.u5-assessment-malaria-mo.title',
    -1
  ),
 
  {
    id: 'u5-assessment-mo',
    type: 'count',
    icon: 'diagnosis',
    goal: -1,
    context: 'user.role === "vht"',
    translation_key: 'targets.u5-assessment-mo.title',
    subtitle_translation_key: 'targets.duration.monthly',
    appliesTo: 'reports',
    appliesToType: ['assessment'],
    date: 'reported',
    appliesIf: (c, report) => isChildUnder5(c, report)
  },
  {
    id: 'u5-assessment-malaria-mo',
    type: 'count',
    icon: 'mrdt-positive',
    goal: -1,
    context: 'user.role === "vht"',
    translation_key: 'targets.u5-assessment-malaria-mo.title',
    subtitle_translation_key: 'targets.duration.monthly',
    appliesTo: 'reports',
    appliesToType: ['assessment'],
    date: 'reported',
    appliesIf: (c, report) => isChildUnder5(c, report) && Utils.getField(report, 'symptom_malaria_test') === 'Malaria: Positive'
  },
  {
    id: 'u5-assessment-diarrhoea-mo',
    type: 'count',
    icon: 'diarrhea',
    goal: -1,
    context: 'user.role === "vht"',
    translation_key: 'targets.u5-assessment-diarrhoea-mo.title',
    subtitle_translation_key: 'targets.duration.monthly',
    appliesTo: 'reports',
    appliesToType: ['assessment'],
    date: 'reported',
    appliesIf: (c, report) => isChildUnder5(c, report) && Utils.getField(report, 'diagnosis_diarrhoea') === 'yes'
  },
  {
    id: 'u5-assessment-pneumonia-mo',
    type: 'count',
    icon: 'pneumonia',
    goal: -1,
    context: 'user.role === "vht"',
    translation_key: 'targets.u5-assessment-pneumonia-mo.title',
    subtitle_translation_key: 'targets.duration.monthly',
    appliesTo: 'reports',
    appliesToType: ['assessment'],
    date: 'reported',
    appliesIf: (c, report) => isChildUnder5(c, report) && Utils.getField(report, 'symptom_fast_breathing') === 'Fast breathing'
  },
  {
    id: 'u5-assessment-malnutrition-mo',
    type: 'count',
    icon: 'malnutrition',
    goal: -1,
    context: 'user.role === "vht"',
    translation_key: 'targets.u5-assessment-malnutrition-mo.title',
    subtitle_translation_key: 'targets.duration.monthly',
    appliesTo: 'reports',
    appliesToType: ['assessment'],
    date: 'reported',
    appliesIf: (c, report) => {
      const muacColor = Utils.getField(report, 'group_malnutrition.muac_colour');
      return isChildUnder5(c, report) && (muacColor === 'red' || muacColor === 'yellow');
    }
  },
  {
    id: 'u5-treatment-mo',
    type: 'count',
    icon: 'icon-healthcare-medicine',
    goal: -1,
    context: 'user.role === "vht"',
    translation_key: 'targets.u5-treatment-mo.title',
    subtitle_translation_key: 'targets.duration.monthly',
    appliesTo: 'reports',
    appliesToType: ['assessment'],
    date: 'reported',
    appliesIf: (c, report) => isChildUnder5(c, report) && receivedTreatment(report)
  },
  {
    id: 'u5-treatment-malaria-mo',
    type: 'count',
    goal: -1,
    translation_key: 'targets.u5-treatment-malaria-mo.title',
    subtitle_translation_key: 'targets.duration.monthly',
    context: 'user.roles === "vht"',
    appliesTo: 'reports',
    appliesToType: ['assessment'],
    date: 'reported',
    appliesIf: (c, report) => isChildUnder5(c, report) && receivedFeverTreatment(report)
  },
  {
    id: 'u5-treatment-diarrhoea-mo',
    type: 'count',
    icon: 'icon-healthcare-medicine',
    goal: -1,
    context: 'user.role === "vht"',
    translation_key: 'targets.u5-treatment-diarrhoea-mo.title',
    subtitle_translation_key: 'targets.duration.monthly',
    appliesTo: 'reports',
    appliesToType: ['assessment'],
    date: 'reported',
    appliesIf: (c, report) => isChildUnder5(c, report) && receivedDiarrhoeaTreatment(report)
  },
  {
    id: 'u5-treatment-pneumonia-mo',
    type: 'count',
    icon: 'icon-healthcare-medicine',
    goal: -1,
    context: 'user.role === "vht"',
    translation_key: 'targets.u5-treatment-pneumonia-mo.title',
    subtitle_translation_key: 'targets.duration.monthly',
    appliesTo: 'reports',
    appliesToType: ['assessment'],
    date: 'reported',
    appliesIf: (c, report) => isChildUnder5(c, report) && receivedCoughTreatment(report)
  },
  {
    id: 'u5-fever-testedmrdt-mo',
    type: 'count',
    icon: 'mrdt',
    goal: -1,
    context: 'user.role === "vht"',
    translation_key: 'targets.u5-fever-testedmrdt-mo.title',
    subtitle_translation_key: 'targets.duration.monthly',
    appliesTo: 'reports',
    appliesToType: ['assessment'],
    date: 'reported',
    appliesIf: (c, report) => {
      const mrdtResult = Utils.getField(report, 'group_fever.mrdt_result');
      return isChildUnder5(c, report) && mrdtResult;
    }
  },
  {
    id: 'pregnancy-registrations',
    type: 'count',
    icon: 'pregnancy-1',
    goal: -1,
    context: 'user.role === "vht"',
    translation_key: 'targets.pregnancy-registrations.title',
    subtitle_translation_key: 'targets.duration.monthly',
    appliesTo: 'reports',
    appliesToType: ['pregnancy'],
    date: 'reported'
  },
  {
    id: 'anc-visits',
    type: 'count',
    icon: 'pregnancy-3',
    goal: -1,
    context: 'user.role === "vht"',
    translation_key: 'targets.anc-visits.title',
    subtitle_translation_key: 'targets.duration.monthly',
    appliesTo: 'reports',
    appliesToType: ['anc_visit_follow_up'],
    date: 'reported'
  },
  {
    id: 'health-facility-deliveries',
    type: 'count',
    icon: 'mother-child',
    goal: -1,
    context: 'user.role === "vht"',
    translation_key: 'targets.health-facility-deliveries.title',
    subtitle_translation_key: 'targets.duration.monthly',
    appliesTo: 'reports',
    appliesToType: ['delivery'],
    date: 'reported',
    appliesIf: (c, report) =>
      Utils.getField(report, 'group_delivery_information.delivery_place') === 'health_facility'
  },
  {
    id: 'home-deliveries',
    type: 'count',
    icon: 'mother-child',
    goal: -1,
    context: 'user.role === "vht"',
    translation_key: 'targets.home-deliveries.title',
    subtitle_translation_key: 'targets.duration.monthly',
    appliesTo: 'reports',
    appliesToType: ['delivery'],
    date: 'reported',
    appliesIf: (c, report) =>
      Utils.getField(report, 'group_delivery_information.delivery_place') === 'home'
  },
  {
    id: 'family-planning-registrations',
    type: 'count',
    icon: 'household',
    goal: -1,
    context: 'user.role === "vht"',
    translation_key: 'targets.family-planning-registrations.title',
    subtitle_translation_key: 'targets.duration.monthly',
    appliesTo: 'reports',
    appliesToType: ['fp_registration'],
    date: 'reported'
  },
  {
    id: 'u5-referral-mo',
    type: 'count',
    icon: 'icon-places-clinic',
    goal: -1,
    context: 'user.role === "vht"',
    translation_key: 'targets.u5-referral-mo.title',
    subtitle_translation_key: 'targets.duration.monthly',
    appliesTo: 'reports',
    appliesToType: ['assessment', 'treatment_follow_up'],
    date: 'reported',
    appliesIf: (c, report) => isChildUnder5(c, report) && reportHasReferralFollowUp(report)
  },
  {
    id: 'u5-referral-followup-mo',
    type: 'count',
    icon: 'icon-followup-general',
    goal: -1,
    context: 'user.role === "vht"',
    translation_key: 'targets.u5-referral-followup-mo.title',
    subtitle_translation_key: 'targets.duration.monthly',
    appliesTo: 'reports',
    appliesToType: ['referral_follow_up'],
    date: 'reported',
    appliesIf: (c, report) => isChildUnder5(c, report)
  },
  {
    id: 'anc-referrals',
    type: 'count',
    icon: 'icon-followup-general',
    goal: -1,
    context: 'user.role === "vht"',
    translation_key: 'targets.anc-referrals.title',
    subtitle_translation_key: 'targets.duration.monthly',
    appliesTo: 'reports',
    appliesToType: ['anc_referral_follow_up'],
    date: 'reported',
    appliesIf: (c, report) =>
      Utils.getField(report, 'inputs.task_name') === 'anc_referral_follow_up'
  },
  washTargets('hh-improve-latrine-registrations', 'targets.improve-latrine-registrations.title', 'hh_have_improved_latrine'),
  washTargets('hh-handwashing-facility-registrations', 'targets.handwashing-facility-registrations.title', 'hh_functional_handwashing_facility', 'hand-wash'),
  washTargets('hh-safe-water-registrations', 'targets.safe-water-registrations.title', 'hh_have_safe_drinking_water', 'tap'),
  {
    id: 'disabled-clients',
    type: 'count',
    icon: 'icon-disabled',
    goal: -1,
    context: 'user.role === "vht"',
    translation_key: 'targets.disabled-clients.title',
    subtitle_translation_key: 'targets.duration.alltime',
    appliesTo: 'contacts',
    appliesToType: ['person'],
    date: 'now',
    appliesIf: (c) => !c.contact.muted && c.contact.has_disability === 'yes'
  },
];
