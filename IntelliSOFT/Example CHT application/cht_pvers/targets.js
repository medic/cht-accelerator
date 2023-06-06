//Define a function to get the household ID based on the hierarchy configuration
const getHouseholdId = (contact) => contact.contact && contact.contact.type === 'clinic' ? contact.contact._id : contact.contact.parent && contact.contact.parent._id;

//Define a function to determine if contact is patient
const isPatient = (contact) => contact.contact && contact.contact.type === 'person' && contact.contact.parent && contact.contact.parent.parent && contact.contact.parent.parent.parent;


module.exports = [

  // General: Total households currently registered by CHWs
  {
    id: 'households-registered-all-time',
    translation_key: 'targets.household.registrations.title',
    subtitle_translation_key: 'targets.all_time.subtitle',
    type: 'count',
    icon: 'medic-clinic',
    goal: -1,
    appliesTo: 'contacts',
    context: 'user.contact_type === "chw"',
    appliesToType: ['household'],
    appliesIf: c => isPatient(c.contact),
    date: 'now',
    aggregate: true
  },
  // General: Population
  {
    id: 'people-registered-all-time',
    translation_key: 'targets.person.registrations.title',
    subtitle_translation_key: 'targets.all_time.subtitle',
    type: 'count',
    icon: 'icon-person',
    context: 'user.contact_type === "chw"',
    goal: -1,
    appliesTo: 'contacts',
    appliesToType: ['persons'],
    appliesIf: (c) => isPatient(c.contact),
    date: 'now',
    aggregate: true
  },

  // PADRs: Total reports submitted
  {
    id: 'padr-all-time',
    type: 'count',
    icon: 'icon-sadr',
    goal: 15,
    translation_key: 'targets.padr.title',
    subtitle_translation_key: 'targets.all_time.subtitle',
    appliesTo: 'reports',
    appliesToType: ['padr'],
    date: 'now'
  },

  // PADRs: Monthly reports- shows reports submitted this month
  {
    id: 'padr-this-month',
    type: 'count',
    icon: 'icon-sadr',
    goal: 15,
    translation_key: 'targets.padr.title',
    subtitle_translation_key: 'targets.this_month.subtitle',
    appliesTo: 'reports',
    appliesToType: ['padr'],
    date: 'reported'
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
  // Adverse Reaction: Percentage of reports with adverse reaction for the current month
  {
    id: 'percentage-contacts-with-adverse-reaction-this-month',
    type: 'percent',
    icon: 'icon-danger-sign',
    goal: -1,
    translation_key: 'targets.padr.percentage.reaction.title',
    subtitle_translation_key: 'targets.this_month.subtitle',
    percentage_count_translation_key: 'targets.assessments.percentage.with.cough',
    appliesTo: 'reports',
    appliesToType: ['padr'],
    appliesIf: function (contact) {
      return isPatient(contact);
    },
    passesIf: function (contact, report) {
      return Utils.getField(report, 'reporter.group_report.type') === 'reaction';
    },
    idType: 'contact',
    date: 'reported'
  },
  // Reports with reaction status marked as yes:: Still ongoing
  {
    id: 'percentage-contacts-with-adverse-reaction-on-this-month',
    type: 'percent',
    icon: 'icon-reaction-on',
    goal: -1,
    translation_key: 'targets.padr.percentage.reaction.on.title',
    subtitle_translation_key: 'targets.this_month.subtitle',
    percentage_count_translation_key: 'targets.padr.percentage.with.reaction',
    appliesTo: 'reports',
    appliesToType: ['padr'],
    appliesIf: function (contact) {
      return isPatient(contact);
    },
    passesIf: function (contact, report) {
      return Utils.getField(report, 'reaction.group_reaction.on') === 'yes';
    },
    idType: 'contact',
    date: 'reported',
  },
  // Reports with Poor Quality Medicine reported
  {
    id: 'percentage-contacts-with-poor-quality-this-month',
    type: 'percent',
    icon: 'icon-risk',
    goal: -1,
    translation_key: 'targets.padr.percentage.quality.title',
    subtitle_translation_key: 'targets.this_month.subtitle',
    percentage_count_translation_key: 'targets.padr.percentage.with.poor.quality',
    appliesTo: 'reports',
    appliesToType: ['padr'],
    appliesIf: function (contact) {
      return isPatient(contact);
    },
    passesIf: function (contact, report) {
      return Utils.getField(report, 'reporter.group_report.type') === 'medicine';
    },
    idType: 'contact',
    date: 'reported'
  },

];