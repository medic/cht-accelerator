const personSummary = (context, contact, reports, lineage) => {
    const {
      recentlyAssessed,
      isHIVPositive,
      isPregnant,
      hasRecentlyDelivered,
      firstParentType,
      newestANCAppointmentDate,
      hasBeenRecentlyScreened,
      isOfChildBearingAge,
      currentEDD,
      fpMethodLabel,
    } = context;
  
    const eddDate = currentEDD;
  
    const familyPlanningCard = {
      context: {
        method_label: fpMethodLabel,
      },
      fields: [
      ],
    };
  
    const pncFields = [
    ];
  
    return {
      context: {
        recentlyAssessed,
        isHIVPositive,
        isPregnant,
        hasRecentlyDelivered,
        firstParentType,
        newestANCAppointmentDate,
        hasBeenRecentlyScreened,
        isOfChildBearingAge,
        currentEDD: eddDate,
      },
      fields: [
        { appliesToType: 'person', label: 'patient_id', value: contact.patient_id, width: 3 },
        { appliesToType: 'person', label: 'contact.sex', value: contact.sex, width: 3 },
        
      ],
      cards: [
        {
          label: 'contact.profile.family_planning',
          appliesToType: 'person',
          appliesIf: () => isOfChildBearingAge,
          fields: () => familyPlanningCard.fields,
          modifyContext: (context) => {
            context.fpMethodLabel = familyPlanningCard.context.method_label;
          },
        },
        {
          label: 'contact.profile.pregnancy',
          appliesToType: 'person',
          appliesIf: () => isPregnant(reports),
          fields: [
          ],
        },
        {
          label: 'contact.profile.pnc',
          appliesToType: 'person',
          appliesIf: () => pncFields.length > 0,
          fields: pncFields,
        },
      ],
    };
  };
  
  module.exports = personSummary;
  