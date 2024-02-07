const { getField, getMostRecentReport } = require('../nools-extras');

let chpTargets = [
  {
    id: 'register_households_target',
    translation_key: 'target.register_households',
    subtitle_translation_key: 'target.register_households.subtitle',
    icon: 'icon-household',
    type: 'count',
    goal: 50,
    appliesTo: 'contacts',
    appliesToType: ['household'],
    appliesIf: function (contact) {
      let isHouseHoldType = contact.contact.contact_type === 'household';
      return isHouseHoldType;
    },
    date: 'now',
    aggregate: true,
    context: "user.contact_type === 'community_health_volunteer'",
  },
  {
    id: 'follow_up_household_member_target',
    translation_key: 'target.follow_up_household_member',
    subtitle_translation_key: 'target.follow_up_household_member.subtitle',
    icon: 'icon-healthcare-assessment',
    type: 'percent',
    goal: 100,
    appliesTo: 'contacts',
    appliesToType: ['household_member', 'household_contact'],
    appliesIf: function (contact) {
      return (
        contact.contact.contact_type === 'household_member' ||
        contact.contact.contact_type === 'household_contact'
      );
    },
    passesIf: function (contact) {
      let allContactReports = contact.reports;
      let assessmentForm = 'household_member_assessment';
      for (const obj of allContactReports) {
        if (obj.form === assessmentForm) {
          return true;
        }
      }
      return false;
    },
    date: 'now',
    aggregate: true,
    context: "user.contact_type === 'community_health_volunteer'",
  },
  {
    id: 'referrals_given_target',
    translation_key: 'target.referrals_given',
    subtitle_translation_key: 'target.referrals_given.subtitle',
    icon: 'icon-referral',
    type: 'percent',
    goal: -1,
    appliesTo: 'reports',
    appliesToType: ['household_member_assessment'],
    passesIf: function (contact, report) {
      let referralGiven = getField(
        report,
        'household_member_assessment.initial_symptoms'
      );
      return referralGiven === 'yes';
    },
    appliesIf: function (contact, report) {
      let referralGiven = getField(
        report,
        'household_member_assessment.initial_symptoms'
      );
      return referralGiven === 'yes' || referralGiven === 'no';
    },
    date: 'now',
    aggregate: true,
    context: "user.contact_type === 'community_health_volunteer'",
  },
  {
    id: 'referrals_honored_target',
    translation_key: 'target.referrals_honored',
    subtitle_translation_key: 'target.referrals_honored.subtitle',
    icon: 'icon-referral',
    type: 'percent',
    goal: 80,
    appliesTo: 'reports',
    appliesToType: [
      'household_member_assessment',
      'cholera_suspicion_follow_up',
    ],
    appliesIf: function (contact, report) {
      let referralGiven = getField(
        report,
        'household_member_assessment.initial_symptoms'
      );
      return referralGiven === 'yes';
    },
    passesIf: function (contact) {
      let allContactReports = contact.reports;
      let followUpForm = 'cholera_suspicion_follow_up';
      for (const obj of allContactReports) {
        if (obj.form === followUpForm) {
          let formFields = obj.fields;
          return formFields.danger_signs.visit_confirm === 'yes';
        }
      }
      return false;
    },
    date: 'now',
    aggregate: true,
    context: "user.contact_type === 'community_health_volunteer'",
  },
  {
    id: 'deaths_reported_target',
    translation_key: 'target.deaths_reported',
    subtitle_translation_key: 'target.deaths_reported.subtitle',
    icon: 'icon-death-general',
    type: 'count',
    goal: -1,
    appliesTo: 'reports',
    appliesToType: ['death_report'],
    appliesIf: function (contact) {
      let allContactReports = contact.reports;
      let undoDeathForm = 'undo_death_report';
      for (const obj of allContactReports) {
        if (obj.form === undoDeathForm) {
          let latestUndoDeathReport = getMostRecentReport(
            allContactReports,
            undoDeathForm
          );
          let latestDeathReport = getMostRecentReport(
            allContactReports,
            'death_report'
          );
          if (
            latestUndoDeathReport.reported_date >
            latestDeathReport.reported_date
          ) {
            return false;
          }
          return true;
        }
      }
      return true;
    },
    date: 'reported',
    aggregate: true,
    context: "user.contact_type === 'community_health_volunteer'",
  },
];

module.exports = { chpTargets };
