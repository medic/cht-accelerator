const { CONTACT_TYPES, FORMS } = require('./shared-extras');
const {DateTime} = require('luxon');
const { getField, getMostRecentReport,isFirstReportNewer } = require('cht-nootils')();
const { getMostRecentReportForm, ageInMonths, isPregnancyBeforeDelivery, isContactStillPregnant } = require('./nools-extras');

const thisContact = contact;
const thisLineage = lineage;
const allReports = reports;
const householdAssessmentReport = getMostRecentReportForm(reports, [FORMS.HOUSEHOLD_ASSESSMENT]);
const householdAssessmentFollowUpReport = getMostRecentReportForm(reports, [FORMS.HOUSEHOLD_ASSESSMENT_FOLLOWUP]);
const under5AssessmentReport = getMostRecentReportForm(reports, [FORMS.CHILD_ASSESSMENT]);
const memberAssessmentReport = getMostRecentReportForm(reports, [FORMS.HOUSEHOLD_MEMBER_ASSESSMENT]);

const fields = [
  { appliesToType: CONTACT_TYPES.HOUSEHOLD, translate: true, label: 'contact.name', value: thisContact.contact && thisContact.contact.name, width: 4 },
  { appliesToType: CONTACT_TYPES.HOUSEHOLD, translate: true, label: 'contact.phone', value: thisContact.contact && thisContact.contact.primary_phone_number, width: 4 },
  { appliesToType: CONTACT_TYPES.HOUSEHOLD, translate: true, label: 'Household Head', value: thisContact.contact && thisContact.contact.name, width: 4 },
  { appliesToType: CONTACT_TYPES.HOUSEHOLD, label: 'contact.sex', value: thisContact.contact && thisContact.contact.sex, width: 4 },
  { appliesToType: CONTACT_TYPES.HOUSEHOLD, label:'contact.age', value: thisContact.contact && thisContact.contact.date_of_birth, width: 4, filter: 'age'},
  { appliesToType: CONTACT_TYPES.HOUSEHOLD, translate: true, label: 'contact.phone', value: thisContact.contact && thisContact.contact.phone, width: 4 },
  { appliesToType: CONTACT_TYPES.HOUSEHOLD, label: 'contact.parent', value: thisLineage, filter: 'lineage' },
  { appliesToType: CONTACT_TYPES.HOUSEHOLD_MEMBER, label:'patient_id', value: thisContact.patient_id, width: 4 },
  { appliesToType: CONTACT_TYPES.HOUSEHOLD_MEMBER, label:'contact.age', value: thisContact.date_of_birth, width: 4, filter: 'age'},
  { appliesToType: CONTACT_TYPES.HOUSEHOLD_MEMBER, label: 'contact.sex', value: thisContact.sex, width: 4 },
  { appliesToType: CONTACT_TYPES.HOUSEHOLD_MEMBER, label: 'contact.phone', value: thisContact.phone, width: 4 },
  { appliesToType: CONTACT_TYPES.HOUSEHOLD_MEMBER, label: 'Relationship to Household Head', value: thisContact.relationship_to_primary_caregiver, width: 8 },
  { appliesToType: CONTACT_TYPES.HOUSEHOLD_MEMBER, label: 'contact.parent', value: thisLineage, filter: 'lineage' },
  { appliesToType: CONTACT_TYPES.AREA_HEALTH_FACILITY, translate: true, label: 'contact.name', value: thisContact.contact && thisContact.contact.name, width: 4 },
  { appliesToType: CONTACT_TYPES.AREA_HEALTH_FACILITY, translate: true, label: 'contact.phone', value: thisContact.contact && thisContact.contact.phone, width: 4 },
  { appliesToType: CONTACT_TYPES.AREA_HEALTH_FACILITY, translate: true, label: 'Alternative Phone', value: thisContact.contact && thisContact.contact.phone_alternate, width: 4 },
  { appliesToType: CONTACT_TYPES.AREA_HEALTH_FACILITY, label: 'Notes', value:  thisContact.contact && thisContact.notes, width: 12 },
  { appliesToType: CONTACT_TYPES.AREA_SUPERVISOR_REGION, label: 'contact.name', value: thisContact.contact && thisContact.contact.name, width: 4 },
  { appliesToType: CONTACT_TYPES.AREA_SUPERVISOR_REGION, label: 'contact.phone', value: thisContact.contact && thisContact.contact.phone, width: 4 },
  { appliesToType: CONTACT_TYPES.AREA_SUPERVISOR_REGION, label: 'Alternative Phone', value: thisContact.contact && thisContact.contact.phone_alternate, width: 4 },
  { appliesToType: CONTACT_TYPES.AREA_SUPERVISOR_REGION, label: 'contact.parent', value: thisLineage, filter: 'lineage' },
  { appliesToType: CONTACT_TYPES.AREA_SUPERVISOR_REGION, label: 'Notes', value: thisContact.contact && thisContact.contact.notes, width: 12 },
  { appliesToType: CONTACT_TYPES.AREA_COMMUNITY_HEALTH_SUPERVISOR, label: 'contact.phone', value: thisContact.phone, width: 4 },
  { appliesToType: CONTACT_TYPES.AREA_COMMUNITY_HEALTH_SUPERVISOR, label: 'Alternative Phone', value: thisContact.phone_alternate, width: 4 },
  { appliesToType: CONTACT_TYPES.AREA_COMMUNITY_HEALTH_SUPERVISOR, label: 'contact.parent', value: thisLineage, filter: 'lineage' },
  { appliesToType: CONTACT_TYPES.AREA_COMMUNITY_HEALTH_SUPERVISOR, label: 'Notes', value: thisContact.notes, width: 12 },
  { appliesToType: CONTACT_TYPES.AREA_HEALTH_FACILITY_NURSE, label: 'contact.phone', value: thisContact.phone, width: 4 },
  { appliesToType: CONTACT_TYPES.AREA_HEALTH_FACILITY_NURSE, label: 'Alternative Phone', value: thisContact.phone_alternate, width: 4 },
  { appliesToType: CONTACT_TYPES.AREA_HEALTH_FACILITY_NURSE, label: 'contact.parent', value: thisLineage, filter: 'lineage' },
  { appliesToType: CONTACT_TYPES.COMMUNITY_HEALTH_AREA, translate: true, label: 'Primary Contact', value: thisContact.contact && thisContact.contact.name, width: 4 },
  { appliesToType: CONTACT_TYPES.COMMUNITY_HEALTH_AREA, label: 'contact.phone', value: thisContact.contact && thisContact.contact.phone, width: 4 },
  { appliesToType: CONTACT_TYPES.COMMUNITY_HEALTH_AREA, label: 'contact.parent', value: thisLineage, filter: 'lineage' },
  { appliesToType: CONTACT_TYPES.COMMUNITY_HEALTH_VOLUNTEER, label: 'contact.phone', value: thisContact.phone, width: 4 },
  { appliesToType: CONTACT_TYPES.COMMUNITY_HEALTH_VOLUNTEER, label: 'contact.parent', value: thisLineage, filter: 'lineage' }

];

const cards = [
  {
    label: 'contact.profile.household',
    translate: true,
    icon: 'household-summary',
    appliesToType: 'report',
    appliesIf: function(report) {
      return report.form === FORMS.HOUSEHOLD_ASSESSMENT && report.reported_date === householdAssessmentReport.reported_date;
    },
    fields: [
      {
        label: 'contact.profile.malaria_prone',
        icon: 'household-summary',
        value: function() { 
          if(householdAssessmentFollowUpReport){
            return getField(householdAssessmentFollowUpReport, 'malaria_prone') ? 'Yes' : 'No';
          }
          return getField(householdAssessmentReport, 'malaria_prone') ? 'Yes' : 'No';
        }
      },
      {
        label: 'contact.profile.next_visit',
        translate: true,
        icon: 'next-visit',
        value: function() { 
          const ammendmentDate = getField(householdAssessmentReport, 'household_assessment.amendment_date');
          return DateTime.fromISO(ammendmentDate).isValid ? ammendmentDate : null;
        },
        filter: 'simpleDate',
      },
    ],
  },
  {
    label: 'contact.profile.child_health',
    appliesToType: [CONTACT_TYPES.HOUSEHOLD_MEMBER],
    appliesIf: function() {
      return ageInMonths(thisContact.date_of_birth) < 60 && !!under5AssessmentReport;
    },
    fields: [
      {
        label: 'contact.profile.sleeps_under_llin',
        icon: 'sleeps_under_llin',
        value: function() {
          return getField(under5AssessmentReport, 'children_under_assessment.nets_treated');
        },
      },
      {
        label: 'contact.profile.suspected_malaria',
        icon: function() {
          return getField(under5AssessmentReport, 'children_under_assessment.suspected_of_malaria') === 'Yes' ? 'danger' : 'suspected_malaria';
        },
        value: function() {
          return getField(under5AssessmentReport, 'children_under_assessment.suspected_of_malaria');
        },
      }
    ],
  },
  {
    label: 'contact.profile.assessment_history',
    appliesToType: [CONTACT_TYPES.HOUSEHOLD_MEMBER],
    appliesIf: function() {
      return ageInMonths(thisContact.date_of_birth) > 60 && !!memberAssessmentReport;
    },
    fields: [
      {
        label: 'contact.profile.last_assessment_date',
        icon: 'date',
        value: function() {
          const assessDate = getField(memberAssessmentReport, 'referral_follow_up_date');
          return assessDate !== null ? assessDate : 'N/A';
        },
        filter: 'simpleDate',
      },
      {
        label: 'contact.profile.suspected_malaria',
        icon: 'suspected_malaria',
        value: function() {
          return getField(memberAssessmentReport, 'group_household_member_assessment.suspected_of_malaria');
        }
      },
      {
        label: 'contact.profile.symptoms_experienced',
        icon: 'symptoms',
        value: function() {
          return getField(memberAssessmentReport, 'group_household_member_assessment.symptoms');
        }
      }
    ],
  },
  {
    label: 'contact.profile.given_treatment',
    appliesToType: [CONTACT_TYPES.HOUSEHOLD_MEMBER],
    appliesIf: function() {
      return ageInMonths(thisContact.date_of_birth) > 60 && getMostRecentReportForm(reports, [FORMS.MEMBER_FOLLOW_UP]);
    },
    fields: [
      {
        label: 'contact.profile.patient_given_treatment',
        icon: 'treatment',
        value: function() {
          const memberFollowUpReport = getMostRecentReportForm(reports, [FORMS.MEMBER_FOLLOW_UP]);
          return memberFollowUpReport ? getField(memberFollowUpReport, 'group_household_member_follow_up.given_treatment') : 'N/A';
        }
      }
    ],
  },
  {
    label: 'contact.profile.pregnancy.active',
    appliesToType: CONTACT_TYPES.HOUSEHOLD_MEMBER,
    appliesIf: function() { 
      const report = getMostRecentReport(allReports, FORMS.PREGNANCY_REGISTRATION); 
      const malariaReport = getMostRecentReport(allReports, FORMS.MALARIA_ASSESSMENT_FOR_PREGNANT_MOTHERS);
      /* eslint-disable no-console */
      console.log(report);
      console.log(malariaReport);
      console.log(report && malariaReport && thisContact.age_years > 12 && thisContact.age_years < 50 && thisContact.sex === 'female');

      if(report !== null && 
        report.fields.group_pregnancy_registration_form.is_pregnancy_confirmed==='yes' && thisContact.age_years > 12 && thisContact.age_years < 50 && thisContact.sex === 'female'){
        /* eslint-disable no-console */
        console.log(thisContact);
        console.log(thisContact.age_years > 12 && thisContact.age_years < 50 && thisContact.sex === 'female');
        if(malariaReport && report && isFirstReportNewer(malariaReport, report)) {
          return isContactStillPregnant(allReports);
        }
        return isPregnancyBeforeDelivery(report);
      }
    },
    fields: function () {
      const report = getMostRecentReport(allReports, FORMS.PREGNANCY_REGISTRATION); 
      //const malariaReport = getMostRecentReport(allReports, FORMS.MALARIA_ASSESSMENT_FOR_PREGNANT_MOTHERS);

      const fields = [];
      const dateTime = DateTime.fromMillis(report.reported_date);

      const targetDate = new Date(report.fields.group_pregnancy_registration_form.estimated_delivery_date);
      const today = new Date();

      const timeDifference = targetDate - today;
      const weeksDifference = timeDifference / (1000 * 60 * 60 * 24 * 7);
      const roundedWeeksDifference = Math.round(weeksDifference);

      fields.push(
        { label: 'Approximate Weeks before delivery', value: roundedWeeksDifference },
        {label: 'Pregnancy Registration Date', value : dateTime.toFormat('yyyy-MM-dd HH:mm:ss')},
        {label: 'Number of ANC Visits', value : report.fields.group_pregnancy_registration_form.no_of_antenatal_visits}
      );

      return fields;
    },
    modifyContext: function (ctx){
      ctx.is_active_pregnancy = true;
    }
  },
];

module.exports = {
  fields,
  cards
};
