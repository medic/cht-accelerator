const { DateTime } = require('luxon');
const { getDaysElapsedSinceLastReport, FAMILY_PLANNING_FORMS, IMMUNIZATIONS, FUTURE_DELIVERY_DATE_WARNING } = require('./helper');
const Nootils = require('cht-nootils/src/nootils');
global.Utils = Nootils();

function hasBeenRecentlyAssessed(allReports) {
  const todaysAssessmentReports = allReports.filter(report => {
    return report.form === 'assessment' && 
    DateTime.now().toISODate() === DateTime.fromMillis(report.reported_date).toISODate();
  });

  return todaysAssessmentReports.length >= 3;
}

const isHIVPositive = (contact) => contact.hiv_test_result === 'positive';

const LMPFromEDD = (edd) => DateTime.fromFormat(edd, 'yyyy-MM-dd').minus({days: 280});

const getPregnancyAgeInDaysX = (report) => {
  const edd = Utils.getField(report, 'edd_std');
  if (!edd) { return; }
  return Math.round(DateTime.now().diff(LMPFromEDD(edd), 'days').days);
};


const getPregnancyAgeInDays = (report) => {
  const edd = Utils.getField(report, 'edd_std');
  if (!edd) { return; }
  const daysToEdd = DateTime.fromFormat(edd, 'yyyy-MM-dd').diffNow('days').days;
  return 280 - Math.round(daysToEdd);
};

function getNewestReportAfterPregnancy(allReports, pregnancyReport, form) {
  const latestReport = Utils.getMostRecentReport(allReports, form);
  if (!latestReport) { return; }
  if (Utils.isFirstReportNewer(latestReport, pregnancyReport)) {
    return latestReport;
  }
  return;
}

function hasDeliveredAfterPregnancy(allReports, pregnancyReport) {
  const laterDelivery = getNewestReportAfterPregnancy(allReports, pregnancyReport, 'delivery');
  if (laterDelivery) {
    return true;
  }

  const laterDeliveryCheck = getNewestReportAfterPregnancy(allReports, pregnancyReport, 'delivery_check');
  if (laterDeliveryCheck) {
    if (Utils.getField(laterDeliveryCheck, 'group_pregnancy_status.has_delivered') === 'yes') {
      return true;
    }
  }

  return false;
}

function isPregnant(allReports) {
  const latestPregnancy = Utils.getMostRecentReport(allReports, 'pregnancy');
  if (!latestPregnancy) { return false; }

  if (hasDeliveredAfterPregnancy(allReports, latestPregnancy)) { return false; }

  let referenceReport = latestPregnancy;

  const laterANCVisit = getNewestReportAfterPregnancy(allReports, latestPregnancy, 'anc_visit_follow_up');
  if (laterANCVisit) {
    const pregnancyEnded = Utils.getField(laterANCVisit, 'pregnancy_ended');
    if (pregnancyEnded === 'yes') { return false; }
    referenceReport = laterANCVisit;
  }

  const pregnancyAge = getPregnancyAgeInDays(referenceReport);
  return pregnancyAge >= 0 && pregnancyAge <= 294;
}

function getMonthsSinceLastDelivery(allReports) {
  const latestDeliveryReport = Utils.getMostRecentReport(allReports, 'delivery');
  if (!latestDeliveryReport) { return; }

  const deliveryDate = Utils.getField(latestDeliveryReport, 'group_delivery_information.delivery_date');
  if (!deliveryDate) { return; }

  const monthsElapsed = DateTime.fromFormat(deliveryDate, 'yyyy-MM-dd').diffNow('months').months;
  if (monthsElapsed > 0) { 
    console.warn(FUTURE_DELIVERY_DATE_WARNING);
    return; 
  }
  return Math.abs(monthsElapsed);
}

function hasRecentlyDelivered(allReports) {
  const monthsElapsed = getMonthsSinceLastDelivery(allReports);
  return monthsElapsed >= 0 && monthsElapsed < 7;
}

const ageCanGiveBirth = (contact) => {
  if (!contact.date_of_birth) {
    return false;
  }
  const dob = DateTime.fromFormat(contact.date_of_birth, 'yyyy-MM-dd');
  const ageInYears = DateTime.now().diff(dob, ['years']).toObject().years;
  return contact.sex === 'female' && ageInYears >= 13 && ageInYears <= 55;
};

const fpCardFunc = (reports) => {
  const fields = [];
  const context = {};
  let mostRecentEnrolment;
  const familyPlanningReports = reports.filter((report) => {
    if (FAMILY_PLANNING_FORMS.includes(report.form)) {
      if (Utils.getField(report, 'fp_registration.continue_current_fp_method') === 'no' || Utils.getField(report, 'fp_follow_up.continue_current_fp_method') === 'no') {
        return false;
      }
      return true;
    }
  });

  if (familyPlanningReports.length > 0) {
    const sortReports = (a, b) => a.reported_date - b.reported_date;
    familyPlanningReports.sort(sortReports);
    mostRecentEnrolment = familyPlanningReports.pop();
  }


  if (!mostRecentEnrolment || Utils.getField(mostRecentEnrolment, 'needs_method_change') === 'true' || Utils.getField(mostRecentEnrolment, 'wants_or_is_pregnant') === 'true') {
    fields.push({
      label: 'contact.profile.family_planning.method',
      value: 'contact.profile.family_planning.method.none',
      translate: true,
      width: 6
    });
  } else {
    const nextVisitDate = Utils.getField(mostRecentEnrolment, 'fp_next_appt_date');
    const method = Utils.getField(mostRecentEnrolment, 'current_fp_method_label');
    context.method_label = method;
    context.nextFPVisitDate = nextVisitDate;
    fields.push({
      label: 'contact.profile.family_planning.method',
      value: method,
      width: 6
    });
    if (nextVisitDate) {
      fields.push({
        label: 'contact.profile.family_planning.next_appointment',
        value: nextVisitDate,
        filter: 'simpleDate',
        width: 6,
      });
    }
  }
  return { fields, context };
};

function hasBeenRecentlyScreened(allReports) {
  const daysElapsed = getDaysElapsedSinceLastReport(allReports, 'screening');
  return daysElapsed >= 0 && daysElapsed <= 30;
}

function isHighRiskPregnancy(allReports) {
  const latestPregnancy = Utils.getMostRecentReport(allReports, 'pregnancy');
  if (!latestPregnancy) { return; }
  if (Utils.getField(latestPregnancy, 'group_danger_sign_check.has_danger_signs') === 'yes') { return true; }

  const laterANCDangerSignReport =  allReports.find(
    report => report.form === 'anc_danger_sign' && Utils.isFirstReportNewer(report, latestPregnancy) &&
    Utils.getField(report, 'group_danger_sign_check.has_danger_signs') === 'yes'
  );

  return !!laterANCDangerSignReport;
}

function getANCVisits(report) {
  const ancVisits = Utils.getField(report, 'group_past_anc_visits.anc_visits');
  if(!ancVisits) { return; }
  return ancVisits.split(' ');
}

function getANCVisitsCount(allReports) {
  const ancVisits = [];
  const latestPregnancy = Utils.getMostRecentReport(allReports, 'pregnancy');
  if (!latestPregnancy) { return; }

  const ancVisitsAtPregnancyRegistration = getANCVisits(latestPregnancy);
  if (ancVisitsAtPregnancyRegistration) { 
    ancVisits.push(...ancVisitsAtPregnancyRegistration); 
  }

  allReports.forEach(function (report) {
    if (report.form === 'anc_visit_follow_up' && Utils.isFirstReportNewer(report, latestPregnancy)) {
      const ancVisitsAtFollowUp = getANCVisits(report);
      if (ancVisitsAtFollowUp) { 
        ancVisits.push(...ancVisitsAtFollowUp); 
      }
    }
  });

  return new Set(ancVisits).size;
}

function getPregnancyFields(allReports, eddDate) {
  return [
    { 
      label: 'contact.profile.edd',
      value: eddDate, 
      filter: 'simpleDate'
    },
    {
      label: 'contact.profile.anc.visits',
      value: 'contact.profile.visits.of',
      translate: true,
      context: { count: getANCVisitsCount(allReports), total: 8 }
    },
    { 
      label: 'contact.profile.pregnancy.high_risk', 
      appliesIf: () => isHighRiskPregnancy(allReports), 
      value: 'contact.profile.risk_factors',
      translate: true,
      icon: 'risk'
    }
  ];
}

function getLatestActiveDelivery(allReports) {
  const latestDelivery = Utils.getMostRecentReport(allReports, 'delivery');
  if (!latestDelivery) { 
    return; 
  }

  if (Utils.getField(latestDelivery, 'group_woman_condition.woman_outcome') === 'dead') {
    return;
  }

  const deliveryDate = Utils.getField(latestDelivery, 'group_delivery_information.delivery_date');
  if (!deliveryDate) { 
    return; 
  }

  const deliveryDateTime = DateTime.fromFormat(deliveryDate, 'yyyy-MM-dd');
  const daysSinceDeliveryRaw = Math.round(deliveryDateTime.diffNow('days').days);
  if (daysSinceDeliveryRaw > 0) { 
    console.warn(FUTURE_DELIVERY_DATE_WARNING);
    return; 
  }
  const daysSinceDelivery = Math.abs(daysSinceDeliveryRaw);
  if (daysSinceDelivery > 42) { 
    return; 
  }

  return {
    latestDelivery, 
    daysSinceDelivery
  };
}

function getPNCVisitsCount(allReports, latestDelivery) {
  const pncVisits = [];
  const pncVisitsAtDelivery = Utils.getField(latestDelivery, 'group_pnc_visits.pnc_visits');
  if(pncVisitsAtDelivery && pncVisitsAtDelivery !== 'none') { 
    const pncVisitsAtDeliveryList = pncVisitsAtDelivery.split(' '); 
    pncVisits.push(...pncVisitsAtDeliveryList);
  }

  const laterPNCVisitReports = allReports.filter(
    report => report.form === 'pnc_follow_up' && 
    report.reported_date > latestDelivery.reported_date
  );

  for (const pncVisitReport of laterPNCVisitReports) {
    const pncVisit = Utils.getField(pncVisitReport, 'group_pnc_visit.pnc_visit');
    pncVisits.push(pncVisit);
  }

  return new Set(pncVisits).size;
}

function getPNCFields(allReports) {
  const {
    latestDelivery, 
    daysSinceDelivery
  } = getLatestActiveDelivery(allReports) || {};
  
  if (!latestDelivery) {
    return [];
  }

  const liveBirths = Utils.getField(latestDelivery, 'group_delivery_outcomes.number_of_babies_alive');
  const totalBirths = Utils.getField(latestDelivery, 'group_delivery_outcomes.number_of_babies_delivered');
  return [
    {
      label: 'contact.profile.delivery_place',
      value: Utils.getField(latestDelivery, 'delivery_place_label'),
      translate: true
    },
    {
      label: 'contact.profile.delivery_date',
      value: `${Math.round(daysSinceDelivery)} days ago`
    },
    {
      label: 'contact.profile.live_births',
      value: `${ liveBirths } out of ${ totalBirths }`,
      translate: true
    },
    {
      label: 'contact.profile.pnc_visits',
      value: `${ getPNCVisitsCount(allReports, latestDelivery) } out of 3`
    },
    {
      label: 'contact.profile.danger_signs',
      value: 'contact.profile.present',
      translate: true,
      appliesIf: () => Utils.getField(latestDelivery, 'group_woman_danger_sign_check.has_danger_signs_woman') === 'yes',
      icon: 'risk'
    }
  ];
}

function immunizationCardFunc(contact, reports) {
  const imms = [];
  const dob = DateTime.fromFormat(contact.date_of_birth, 'yyyy-MM-dd');
  let immunizationOnTrack = false;
  const assessment = Utils.getMostRecentReport(reports, 'assessment');
  if (!assessment && contact.vaccines_received) {
    contact.vaccines_received.split('_').filter((vac) => vac !== 'only').forEach((vac) => {
      imms.push(IMMUNIZATIONS[vac.replace('_only', '')]);
    });
    immunizationOnTrack = Math.abs(dob.diffNow('weeks').weeks) <= 6 && imms.includes(IMMUNIZATIONS['bcg']) && imms.includes(IMMUNIZATIONS['polio']);
  }

  const assessments = reports.filter((report) => report.form === 'assessment' && Utils.getField(report, 'group_other_information.immunization_received'));
  const recordedImmunizations = new Set();
  assessments.forEach((report) => {
    Utils.getField(report, 'group_other_information.immunization_received').split(' ').forEach((immunizationReceived) => {
      if (!recordedImmunizations.has(immunizationReceived)) {
        recordedImmunizations.add(immunizationReceived);
        switch (immunizationReceived) {
        case 'first_immunization':
          imms.push(IMMUNIZATIONS['bcg'], IMMUNIZATIONS['polio']);
          immunizationOnTrack = DateTime.fromMillis(report.reported_date, 'yyyy-MM-dd').diff(dob, 'weeks').toObject().weeks <= 6;
          break;
        case 'second_immunization':
          imms.push(IMMUNIZATIONS['dpt1'], IMMUNIZATIONS['pcv1'], IMMUNIZATIONS['rv1']);
          immunizationOnTrack = DateTime.fromMillis(report.reported_date, 'yyyy-MM-dd').diff(dob, 'weeks').toObject().weeks <= 10;
          break;
        default:
          break;
        }
      }
    });
  });

  const fields = [
    {
      label: 'contact.profile.imm_received_immunizations',
      value: imms.length <= 0 ? 'None' : imms
    },
    {
      label: 'contact.profile.imm_on_track',
      value: immunizationOnTrack === true ? 'Yes' : 'No',
    }
  ];

  return fields;
}

module.exports = {
  hasBeenRecentlyAssessed,
  isHIVPositive,
  isPregnant,
  hasRecentlyDelivered,
  ageCanGiveBirth,
  fpCardFunc,
  hasBeenRecentlyScreened,
  getPregnancyFields,
  getPNCFields,
  immunizationCardFunc,
  getPregnancyAgeInDaysX,
  getPregnancyAgeInDays
};
