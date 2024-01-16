
let dsoTargets = [
    {
        id: 'cholera-cases-referred',
        translation_key: 'target.cholera_cases_referred',
        subtitle_translation_key: 'target.cholera_cases_referred.subtitle',
        icon: 'cholera-report',
        type: 'count',
        goal: -1,
        appliesTo: 'reports',
        appliesToType: ['cholera_verification'],
        appliesIf: function(contact, report){
            let confirmedCase = report.fields.danger_signs.confirm_case === 'yes';
            return confirmedCase;
        },
        date: 'reported',
        context: "user.contact_type === 'area_health_facility_nurse'"
    },
    {
        id: 'cholera-referrals-completed',
        translation_key: 'target.cholera_referrals_completed',
        subtitle_translation_key: 'target.cholera_referrals_completed.subtitle',
        icon: 'icon-referral',
        type: 'percent',
        goal: 100,
        appliesTo: 'reports',
        appliesToType: ['cholera_verification', 'specimen_form'],
        appliesIf: function(contact, report){
            let referredCase = report.form === 'cholera_verification' && report.fields.danger_signs.confirm_case === 'yes';
            return referredCase;
        },
        passesIf: function(contact){
            let allContactReports = contact.reports;
            let specimenForm = 'specimen_form';
            for (let i=0; i < allContactReports.length; i++) {
                let obj = allContactReports[i];
                if (obj.form === specimenForm) {
                    let formFields = obj.fields;
                    let result = formFields.specimen_details_group.result;
                    return  result=== 'positive' || result === 'negative';
                }
            }
            return false;
        },
        date: 'reported',
        context: "user.contact_type === 'area_health_facility_nurse'"
    },
    {
        id: 'total-positive-cholera-cases',
        translation_key: 'target.total_positive_cholera_cases',
        subtitle_translation_key: 'target.total_positive_cholera_cases.subtitle',
        icon: 'icon-diarrhoea',
        type: 'percent',
        goal: -1,
        appliesTo: 'reports',
        appliesToType: ['specimen_form'],
        appliesIf: function(contact, report){
            return report.form === 'specimen_form';
        },
        passesIf: function(contact){
            let allContactReports = contact.reports;
            let specimenForm = 'specimen_form';
            for (let i=0; i < allContactReports.length; i++) {
                let obj = allContactReports[i];
                if (obj.form === specimenForm) {
                    let formFields = obj.fields;
                    let result = formFields.specimen_details_group.result;
                    return  result=== 'positive';
                }
            }
            return false;
        },
        date: 'reported',
        context: "user.contact_type === 'area_health_facility_nurse'"
    }
];
module.exports = {dsoTargets};