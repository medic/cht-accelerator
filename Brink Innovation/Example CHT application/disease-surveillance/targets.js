// Define a function to get the household ID based on the hierarchy configuration
const getHouseholdId = (contact) => contact.contact && contact.contact.type === 'clinic' ? contact.contact._id : contact.contact.parent && contact.contact.parent._id;

// Define a function to determine if contact is a patient
const isPatient = (contact) => contact.contact && contact.contact.type === 'person' && contact.contact.parent && contact.contact.parent.parent && contact.contact.parent.parent.parent;

module.exports = [
  {
    id: 'assessments-all-time',
    type: 'count',
    icon: 'icon-healthcare-assessment',
    goal: -1,
    translation_key: 'targets.assessments.title',
    subtitle_translation_key: 'targets.all_time.subtitle',
    appliesTo: 'reports',
    appliesToType: ['assessment'],
    date: 'now'
  },
  {
    id: 'assessments-this-month',
    type: 'count',
    icon: 'icon-healthcare-assessment',
    goal: 2,
    translation_key: 'targets.assessments.title',
    subtitle_translation_key: 'targets.this_month.subtitle',
    appliesTo: 'reports',
    appliesToType: ['assessment'],
    date: 'reported'
  },
  {
    id: 'total-contacts-with-cough-this-month',
    type: 'count',
    icon: 'icon-cough',
    goal: -1,
    translation_key: 'targets.assessments.total.cough.title',
    subtitle_translation_key: 'targets.this_month.subtitle',
    appliesTo: 'reports',
    appliesToType: ['assessment'],
    appliesIf: function (contact, report) {
      return Utils.getField(report, 'group_assessment.cough') === 'yes';
    },
    idType: 'contact',
    date: 'reported'
  },
  {
    id: 'percentage-contacts-with-cough-this-month',
    type: 'percent',
    icon: 'icon-cough',
    goal: -1,
    translation_key: 'targets.assessments.percentage.cough.title',
    subtitle_translation_key: 'targets.this_month.subtitle',
    percentage_count_translation_key: 'targets.assessments.percentage.with.cough',
    appliesTo: 'reports',
    appliesToType: ['assessment'],
    appliesIf: function (contact) {
      return isPatient(contact);
    },
    passesIf: function(contact, report) {
      return Utils.getField(report, 'group_assessment.cough') === 'yes';
    },
    idType: 'contact',
    date: 'reported'
  },
  {
    id: 'households-with-assessments-this-month',
    type: 'count',
    icon: 'icon-household',
    goal: 2,
    translation_key: 'targets.households.with.assessments.title',
    subtitle_translation_key: 'targets.this_month.subtitle',
    appliesTo: 'reports',
    appliesToType: ['assessment'],
    date: 'reported',
    emitCustom: (emit, original, contact) => {
      const householdId = getHouseholdId(contact);
      emit(Object.assign({}, original, {
        _id: householdId,
        pass: true
      }));
    }
  },
  {
    id: 'households-with-gt2-assessments-this-month',
    type: 'percent',
    icon: 'icon-household',
    goal: 60,
    translation_key: 'targets.households.with.gt2.assessments.title',
    subtitle_translation_key: 'targets.all_time.subtitle',
    appliesTo: 'contacts',
    appliesToType: ['person', 'clinic'], // Need the total number of households as the denominator
    date: 'now',
    emitCustom: (emit, original, contact) => {
      const householdId = getHouseholdId(contact);
      if (isPatient(contact)) {
        if (contact.reports.some(report => report.form === 'assessment')) {
          emit(Object.assign({}, original, {
            _id: householdId, // Emits a passing target instance with the household ID as the target instance ID
            pass: true
          }));
        }
      }
      if (contact.contact && contact.contact.type === 'clinic') { // This represents the denominator, which is the total number of households
        emit(Object.assign({}, original, {
          _id: householdId,
          pass: false, // Set to false so that it is counted in the denominator
        }));
      }
    },
    groupBy: contact => getHouseholdId(contact),
    passesIfGroupCount: { gte: 2 },
  },
  {
    id: 'moh-515-all-time',
    type: 'count',
    icon: 'icon-healthcare-assessment',
    goal: -1,
    translation_key: 'targets.moh515.title',
    subtitle_translation_key: 'targets.all_time.subtitle',
    appliesTo: 'reports',
    appliesToType: ['MOH 515 (Post Outbreak)'],
    date: 'now'
  },
  {
    id: 'moh-515-this-month',
    type: 'count',
    icon: 'icon-healthcare-assessment',
    goal: 1,
    translation_key: 'targets.moh515.title',
    subtitle_translation_key: 'targets.this_month.subtitle',
    appliesTo: 'reports',
    appliesToType: ['MOH 515 (Post Outbreak)'],
    date: 'reported'
  }
];
