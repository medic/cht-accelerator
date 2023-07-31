const { isContactValid } = require('./nools-extras');
const { FORMS, TARGETS, CONTACT_TYPES } = require('./shared-extras');

module.exports = [
  {
    id: TARGETS.HOUSEHOLDS_GTE_2_LLIN,
    type: 'percent',
    icon: 'icon-llin',
    goal: -1,
    translation_key: 'targets.assessments.percentage.lln.title',
    percentage_count_translation_key: 'targets.assessments.percentage.with.lln',
    appliesTo: 'reports',
    appliesToType: [FORMS.HOUSEHOLD_ASSESSMENT],
    appliesIf: function (c) {
      return !c.contact.date_of_death && !c.contact.muted;
    },
    passesIf: function(contact, report) {
      return Utils.getField(report, 'household_assessment.number_of_nets') >= 2;
    },
    date: 'reported'
  },
  {
    id: TARGETS.MEMBERS_WITH_MALARIA,
    type: 'percent',
    icon: 'malaria',
    goal: -1,
    translation_key: 'targets.assessments.percentage.hhm.title',
    subtitle_translation_key: 'targets.month.subtitle',
    percentage_count_translation_key: 'targets.assessments.percentage.with.malaria',
    appliesTo: 'contacts',
    appliesToType: [CONTACT_TYPES.HOUSEHOLD_MEMBER],
    appliesIf: function(contact) {
      return isContactValid(contact);
    },
    passesIf: function(contact) {
      return contact.reports.find(report => report.form === FORMS.MEMBER_FOLLOW_UP && Utils.getField(report, 'group_household_member_follow_up.malaria_confirmed') === 'yes');
    },
    date: 'reported'
  },
];
