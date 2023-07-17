const { FORMS, TARGETS } = require('./shared-extras');

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
    percentage_count_translation_key: 'targets.assessments.percentage.with.malaria',
    appliesTo: 'reports',
    appliesToType: [FORMS.MEMBER_ASSESSMENT, FORMS.MEMBER_FOLLOW_UP],
    appliesIf: function (c, report) {
      return !c.contact.date_of_death && !c.contact.muted && Utils.getField(report, 'has_malaria_symptoms');
    },
    passesIf: function(c) {
      return c.reports.find(report => report.form === FORMS.MEMBER_FOLLOW_UP && Utils.getField(report, 'group_household_member_follow_up.malaria_confirmed') === 'yes');
    },
    date: 'reported'
  },
];
