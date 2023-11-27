const {
  hasBeenRecentlyAssessed,
  isHIVPositive,
  isPregnant,
  hasRecentlyDelivered,
  ageCanGiveBirth,
  fpCardFunc,
  hasBeenRecentlyScreened,
  getPregnancyFields,
  getPNCFields,
  immunizationCardFunc
} = require('./contact-summary-extras');
const { isUnder5, getCurrentEDD, getNewestANCAppointmentDate } = require('./helper');

const eddDate = getCurrentEDD(reports);
const familyPlanningCard = fpCardFunc(reports);
const pncFields = getPNCFields(reports);
const isOfChildBearingAge =  ageCanGiveBirth(contact);

module.exports = {
  context: {
    recentlyAssessed: hasBeenRecentlyAssessed(reports),
    isHIVPositive: isHIVPositive(contact),
    isPregnant: isPregnant(reports),
    hasRecentlyDelivered: hasRecentlyDelivered(reports),
    firstParentType: lineage[0] && lineage[0].type,
    newestANCAppointmentDate: getNewestANCAppointmentDate(reports),
    hasBeenRecentlyScreened: hasBeenRecentlyScreened(reports),
    isOfChildBearingAge,
    currentEDD: eddDate
  },
  
  fields: [
    { appliesToType: 'person', label: 'patient_id', value: contact.patient_id, width: 3 },
    { appliesToType: 'person', label: 'contact.sex', value: contact.sex, width: 3 },
    { appliesToType: 'person', label: 'Notes', value: contact.notes, width: 12 },
    { appliesToType: 'person', label: 'contact.age', value: contact.date_of_birth, width: 4, filter: 'age' },
    { appliesToType: 'person', label: 'Phone Number', value: contact.phone, width: 8, filter: 'phone' },
    { appliesToType: 'person', label: 'contact.parent', value: lineage, filter: 'lineage' },
    { appliesToType: 'person', label: 'reports', value: reports, width: 12, filter: 'json' },
    { appliesToType: ['health_center', 'district_hospital', 'clinic'], label: 'contact.parent', value: lineage, width: 12, filter: 'lineage' },
  ],
  
  cards: [
    {
      label: 'contact.profile.family_planning',
      appliesToType: 'person',
      appliesIf: () => isOfChildBearingAge,
      fields: () => familyPlanningCard.fields,
      modifyContext: (context) => {
        context.fpMethodLabel = familyPlanningCard.context.method_label;
      }
    },
    {
      label: 'contact.profile.pregnancy',
      appliesToType: 'person',
      appliesIf: () => isPregnant(reports),
      fields: getPregnancyFields(reports, eddDate)
    },
    {
      label: 'contact.profile.pnc',
      appliesToType: 'person',
      appliesIf: () => pncFields.length > 0,
      fields: pncFields
    },
    {
      label: 'contact.profile.immunization',
      appliesToType: 'person',
      appliesIf: () => isUnder5(contact),
      fields: () => immunizationCardFunc(contact, reports)
    }
  ]
};
