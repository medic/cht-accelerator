const {
  isChildUnder5,
  // isPersonAbove50,
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
  context: 'user.role === vht',
  // aggregate:true,
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
  aggregate:true,
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
    context: 'users.role === vht',
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
    id: 'hh-covered-spotchecks',
    type: 'count',
    icon: 'mother-child',
    goal: 15,
    context: 'user.role === "vht_supervisor"',
    translation_key: 'targets.hh-covered-spotchecks.title',
    subtitle_translation_key: 'targets.duration.monthly',
    appliesTo: 'reports',
    appliesToType: ['spot_check'],
    date: 'now',
    aggregate: true
  },
  {
    id: 'vhts-needing-mentorship-this-quarter',
    type: 'count',
    icon: 'icon-num-mentorship-2',
    goal: -1,
    translation_key: 'targets.vht.needing-mentorship.title',
    context: 'user.role === "vht_supervisor"',
    appliesTo: 'reports',
    appliesToType: ['spot_check'],
    appliesIf: (c, report) => !c.contact.muted && Utils.getField(report, 'g_vht_feedback.is_vht_knowledgeable') === 'no',
    date: 'now',
    // aggregate: true
  },
  {
    id: 'individuals-reached-mentorships',
    type: 'count',
    icon: 'mentorship',
    goal: -1,
    context: 'user.role === "vht_supervisor"',
    translation_key: 'targets.individuals-reached-mentorships.title',
    subtitle_translation_key: 'targets.duration.monthly',
    appliesTo: 'reports',
    appliesToType: ['community_mentorship'],
    date: 'reported',
    appliesIf: (contact, report) => Utils.getField(report, 'mentorship.num_people_attend'),
    // aggregate: true
  },
  {
    id: 'wash-assessments',
    type: 'count',
    icon: 'icon-wash',
    goal: -1,
    context: 'user.role === "vht_supervisor"',
    translation_key: 'targets.wash-assessments.title',
    subtitle_translation_key: 'targets.duration.monthly',
    appliesTo: 'reports',
    appliesToType: ['wash'],
    date: 'reported',
    aggregate: true
  },
  {
    id: 'outbreak-incidents',
    type: 'count',
    icon: 'icon-outbreaks',
    goal: -1,
    context: 'user.role === "vht_supervisor"',
    translation_key: 'targets.outbreak-incidents.title',
    subtitle_translation_key: 'targets.duration.monthly',
    appliesTo: 'reports',
    appliesToType: ['suspected_outbreaks'],
    date: 'reported',
    aggregate: true
  },
  {
    id: 'vhts-hh-visits-percentage',
    type: 'percent',
    icon: 'icon-vhts-with-hh',
    goal: 100,
    context: 'user.role === "vht_supervisor"',
    translation_key: 'targets.vhts-hh-visits-percentage.title',
    subtitle_translation_key: 'targets.duration.monthly',
    appliesTo: 'contacts',
    appliesToType: ['person'],
    date: 'reported',
    // aggregate: true,
    appliesIf: function(contact) {
      return contact.parent && contact.parent.type === 'health_center';
    },
    passesIf: function(contact, reports) {
      return reports.some(report => report.contact._id === contact._id);
    }
  },
  {
    id: 'u5-assessment-malaria-mo',
    type: 'count',
    goal: -1,
    context: 'user.role === vht',
    translation_key: 'targets.u5-assessment-malaria-mo.title',
    subtitle_translation_key: 'targets.duration.monthly',
    appliesTo: 'reports',
    appliesToType: ['assessment'],
    date: 'reported',
    appliesIf: (c, report) => isChildUnder5(c, report) && Utils.getField(report, 'symptom_malaria_test') === 'Malaria: Positive'
  },
  {
    id: 'deaths-reported',
    type: 'count',
    icon: 'death',
    goal: 0,
    aggregate: true,
    context: 'user.role === "vht_supervisor"',
    translation_key: 'targets.deaths-reported.title',
    subtitle_translation_key: 'targets.duration.monthly',
    appliesTo: 'reports',
    appliesToType: ['death_report'],
    date: 'reported',
    appliesIf: (report) => isDead(report)
  },
  {
    id: 'deaths-confirmed',
    type: 'count',
    icon: 'icon-confirmed-death',
    goal: 0,
    aggregate: true,
    context: 'user.role === "vht_supervisor"',
    translation_key: 'targets.deaths-confirmed.title',
    subtitle_translation_key: 'targets.duration.monthly',
    appliesTo: 'reports',
    appliesToType: ['death_confirmation'],
    date: 'reported',
    appliesIf: (report) => isDead(report)
  },
  {
    id: 'vhts-visited-percentage',
    type: 'count',
    icon: 'community',
    goal: -1,
    // aggregate: true,
    context: 'user.role === "vht_supervisor"',
    translation_key: 'targets.vhts-visited-percentage.title',
    subtitle_translation_key: 'targets.duration.monthly',
    appliesTo: 'reports',
    appliesToType: ['vht_visit'],
    date: 'reported'
  },
  {
    id: 'vhts-stock-out',
    type: 'count',
    icon: 'icon-vhts-with-stockout',
    goal: -1,
    aggregate: true,
    context: 'user.role === "vht_supervisor"',
    translation_key: 'targets.vhts-stock-out.title',
    subtitle_translation_key: 'targets.duration.monthly',
    appliesTo: 'reports',
    appliesToType: ['stock_count', 'vht_visit'],
    date: 'reported',
    appliesIf: (contact, report) => {
      const form = report.form;
      const numBrokenStolen = form === 'stock_count' || form === 'vht_visit' &&
        Utils.getField(report, 'stock.report_stockout.stockout_supplies_drugs') === 'yes';

      return numBrokenStolen;
    }
  },
  {
    id: 'vhts-devices-lost-stolen',
    type: 'count',
    icon: 'icon-vhts-with-broken',
    goal: -1,
    // aggregate: true,
    context: 'user.role === "vht_supervisor"',
    translation_key: 'targets.vhts-devices-lost-stolen.title',
    subtitle_translation_key: 'targets.duration.monthly',
    appliesTo: 'reports',
    appliesToType: ['device_functionality', 'vht_visit'],
    date: 'reported',
    appliesIf: (contact, report) => {
      const form = report.form;
      const numBrokenStolen = form === 'device_functionality' || form === 'vht_visit' &&
        (Utils.getField(report, 'g_device_functionality.device_condition') === 'broken' ||
          Utils.getField(report, 'g_device_functionality.device_condition') === 'stolen');

      return numBrokenStolen;
    }
  },
  {
    id: 'u5-referrals',
    type: 'count',
    icon: 'child',
    goal: -1,
    // aggregate: true,
    context: 'user.role === "vht_supervisor"',
    translation_key: 'targets.u5-referrals.title',
    subtitle_translation_key: 'targets.duration.monthly',
    appliesTo: 'reports',
    appliesToType: ['referral'],
    date: 'reported',
    appliesIf: (c, report) =>
      Utils.getField(report, 'referral_information.age_group') === 'U5'
  },
  {
    id: 'disabled-clients',
    type: 'count',
    icon: 'icon-disabled',
    goal: -1,
    aggregate: true,
    translation_key: 'targets.disabled-clients.title',
    subtitle_translation_key: 'targets.duration.alltime',
    appliesTo: 'contacts',
    appliesToType: ['person'],
    date: 'now',
    appliesIf: (c) => !c.contact.muted && c.contact.has_disability === 'yes'
  },
  {
    id: 'pregnancy-registrations',
    type: 'count',
    icon: 'pregnancy-1',
    goal: -1,
    aggregate: true,
    translation_key: 'targets.pregnancy-registrations.title',
    subtitle_translation_key: 'targets.duration.monthly',
    appliesTo: 'reports',
    appliesToType: ['pregnancy'],
    date: 'reported'
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
    date: 'now',
    aggregate: true
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
    context: 'user.role === vht',
    translation_key: 'targets.u5-assessment-mo.title',
    subtitle_translation_key: 'targets.duration.monthly',
    appliesTo: 'reports',
    appliesToType: ['assessment'],
    date: 'reported',
    appliesIf: (c, report) => isChildUnder5(c, report)
  },
  {
    id: 'u5-assessment-diarrhoea-mo',
    type: 'count',
    icon: 'diarrhea',
    goal: -1,
    context: 'user.role === vht',
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
    context: 'user.role === vht',
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
    context: 'user.role === vht',
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
    context: 'user.role === vht',
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
    context: 'user.roles === vht',
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
    context: 'user.role === vht',
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
    context: 'user.role === vht',
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
    context: 'user.role === vht',
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
    id: 'anc-visits',
    type: 'count',
    icon: 'pregnancy-3',
    goal: -1,
    context: 'user.role === vht',
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
    context: 'user.role === vht',
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
    context: 'user.role === vht',
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
    context: 'user.role === vht',
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
    context: 'user.role === vht',
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
    context: 'user.role === vht',
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
    context: 'user.role === vht',
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
];
