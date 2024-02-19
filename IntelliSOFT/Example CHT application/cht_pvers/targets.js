//Define a function to get the household ID based on the hierarchy configuration
const getHouseholdId = (contact) => contact.contact && contact.contact.type === 'household' ? contact.contact._id : contact.contact.parent && contact.contact.parent._id;

//Define a function to determine if contact is patient
// const isPatient = (contact) => contact.contact && contact.contact.type === 'person' && contact.contact.parent && contact.contact.parent.parent && contact.contact.parent.parent.parent;


module.exports = [
   
  {
    id: 'adverse-drug-reactions-assessed',
    translation_key: 'adverse.drug.reactions.identified.title',
    subtitle_translation_key: 'targets.all_time.subtitle',
    type: 'count',
    icon: 'icon-reactions',
    context: 'user.contact_type === "chw"',
    goal: 80,
    appliesTo: 'reports',
    appliesToType: ['assessment'], 
    date: 'now',
    aggregate: true, 

  },

  {
    id: 'follow-up-assessments-completed-aggregate',
    translation_key: 'follow.up.assessments.completed.title',
    subtitle_translation_key: 'targets.all_time.subtitle',
    type: 'percent',
    icon: 'icon-up',
    goal: 60,
    appliesTo: 'reports',
    context: 'user.contact_type === "chw"',
    appliesToType: ['chw_follow'],
    date: 'now',
    aggregate: true,
    groupBy: contact => getHouseholdId(contact),
    passesIfGroupCount: { gte: 2 }
  },

  {
    id: 'total-number-of-recoveries-reported-aggregate',
    translation_key: 'total.number.of.recoveries.reported.title',
    subtitle_translation_key: 'targets.all_time.subtitle',
    type: 'percent',
    icon: 'icon-referral',
    goal: 80,
    appliesTo: 'reports',
    appliesToType: ['chw_follow'],
    context: 'user.contact_type === "chw"', 
    date: 'now',
    aggregate: true,
    groupBy: contact => getHouseholdId(contact),
    passesIfGroupCount: { gte: 2 }
  },
 // Target for number of households registered by a specific CHP
  {
    id: 'padr-this-month',
    type: 'percent',
    icon: 'icon-sadr',
    goal: 75,
    context: 'user.contact_type === "chw"',
    translation_key: 'targets.padr.title',
    subtitle_translation_key: 'targets.this_month.subtitle',
    appliesTo: 'contacts',
    appliesToType: ['household'],
    date: 'now',
    aggregate: true,
    groupBy: contact => getHouseholdId(contact),
    passesIfGroupCount: { gte: 2 }
  },
  // PADRs: Display households registered this month with a target of 15
  {
    id: 'households-with-padr-this-month',
    type: 'count',
    icon: 'icon-household',
    goal: 15,
    translation_key: 'targets.households.with.padr.title',
    subtitle_translation_key: 'targets.this_month.subtitle',
    appliesTo: 'reports',
    appliesToType: ['padr'],
    date: 'reported',
    emitCustom: (emit, original, contact) => {
      const householdId = getHouseholdId(contact);
      emit(Object.assign({}, original, {
        _id: householdId,
        pass: true
      }));
    }
  },

  // Follow Up Assessments Completed
  {
    id: 'follow-up-assessments-completed',
    translation_key: 'follow.up.assessments.completed.title',
    subtitle_translation_key: 'targets.all_time.subtitle',
    type: 'count',
    icon: 'icon-up',
    goal: -1,
    appliesTo: 'reports',
    appliesToType: ['chw_follow'],
    date: 'now',
  },

  // Referrals Completed

  {
    id: 'completed-referrals',
    translation_key: 'completed.referrals.title',
    subtitle_translation_key: 'targets.all_time.subtitle',
    type: 'count',
    icon: 'icon-assessment',
    goal: -1,
    appliesTo: 'reports',
    appliesToType: ['padr'],
    appliesIf: function (contact, report) {
      return Utils.getField(report, 'form.outcome_details.group_outcome_details.outcome') === 'Not Recovered/Not Resolved' ||
        Utils.getField(report, 'form.outcome_details.group_outcome_details.outcome') === 'Unknown';
    },
    date: 'now',
  },
  // Adverse Drug Reactions Identified
  {
    id: 'adverse-drug-reactions-identified',
    translation_key: 'adverse.drug.reactions.identified.title',
    subtitle_translation_key: 'targets.all_time.subtitle',
    type: 'count',
    icon: 'icon-reactions',
    goal: -1,
    appliesTo: 'reports',
    appliesToType: ['assessment'],
    appliesIf: function (contact, report) {
      return (Utils.getField(report, 'reporter.group_report.medication') === 'Yes' && Utils.getField(report, 'reporter.group_report.reaction') === 'Yes');
    },
    date: 'now',
  },
  // Adverse Reactions reported following Immunization/Vaccination
  {
    id: 'adverse-drug-reactions-following-immunization',
    translation_key: 'adverse.drug.reactions.following.immunization.title',
    subtitle_translation_key: 'targets.all_time.subtitle',
    type: 'count',
    icon: 'icon-reactions',
    goal: -1,
    appliesTo: 'reports',
    appliesToType: ['assessment'],
    appliesIf: function (contact, report) {
      return (Utils.getField(report, 'reporter.group_report.immunization') === 'Yes' && Utils.getField(report, 'reporter.group_report.reaction') === 'Yes');
    },
    date: 'now',
  },

  // Poor Quality Medicine Reported

  {
    id: 'poor-quality-medicine-reported',
    translation_key: 'poor.quality.medicine.reported.title',
    subtitle_translation_key: 'targets.all_time.subtitle',
    type: 'count',
    icon: 'icon-sadr',
    goal: -1,
    appliesTo: 'reports',
    appliesToType: ['assessment'],
    appliesIf: function (contact, report) {
      return (Utils.getField(report, 'reporter.group_report.medicine') === 'Yes' && Utils.getField(report, 'reporter.group_report.reaction') === 'Yes');
    },
    date: 'now',
  },

  // Total number of deaths reported
  {
    id: 'total-number-of-deaths-reported',
    translation_key: 'total.number.of.deaths.reported.title',
    subtitle_translation_key: 'targets.all_time.subtitle',
    type: 'count',
    icon: 'icon-death-coffin',
    goal: -1,
    appliesTo: 'reports',
    appliesToType: ['death_confirmation'],
    date: 'now',
  },

  // Total number of recoveries reported
  {
    id: 'total-number-of-recoveries-reported',
    translation_key: 'total.number.of.recoveries.reported.title',
    subtitle_translation_key: 'targets.all_time.subtitle',
    type: 'count',
    icon: 'icon-referral',
    goal: -1,
    appliesTo: 'reports',
    appliesToType: ['padr', 'chw_follow'],
    appliesIf: function (contact, report) {
      return Utils.getField(report, 'form.outcome_details.group_outcome_details.outcome') === 'Recovered/Resolved' || Utils.getField(report, 'reporter.group_report.fully_recovered') === 'Yes' || Utils.getField(report, 'reporter.group_report.status') === 'Patient recovered';
    },
    date: 'now',
  },

];