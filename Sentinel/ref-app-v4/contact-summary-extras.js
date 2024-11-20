/* eslint-disable indent */
// @ts-nocheck
const moment = require('moment');
const today = moment().startOf('day');

const DAYS_IN_YEAR = 365;
const getField = (report, fieldPath) =>
  ['fields', ...(fieldPath || '').split('.')].reduce((prev, fieldName) => {
    if (prev === undefined) {
      return undefined;
    }
    return prev[fieldName];
  }, report);

const isReportValid = function (report) {
  if (report.form && report.fields && report.reported_date) {
    return true;
  }
  return false;
};
const getDaysPast = (from, to) =>
  Math.abs((to.getTime() - from.getTime()) / MS_IN_DAY);
const getYearsPast = (from, to) =>
  Math.abs(getDaysPast(to, from) / DAYS_IN_YEAR);

const MS_IN_DAY = 24 * 60 * 60 * 1000; // 1 day in ms
const now = new Date();

// eslint-disable-next-line default-param-last
const getNewestReport = (reports = [], forms) => {
  let result = null;
  reports.forEach(function (report) {
    if (!isReportValid(report) || !forms.includes(report.form)) {
      return;
    }
    if (!result || report.reported_date > result.reported_date) {
      result = report;
    }
  });
  return result;
};

const isAlive = c => c && !c.date_of_death;

const antenatalForms = ['pregnancy_follow_up'];

const deliveryForms = ['delivery'];

const pregnancyForms = ['pregnancy'];

const traceForms = ['trace'];

const terminatePregnancyForms = [...antenatalForms, 'delivery_check'];

const getSubsequentDeliveries = (reports, report) => {
  return reports.filter(function (r) {
    return (
      deliveryForms.includes(r.form) && r.reported_date > report.reported_date
    );
  });
};

const getSubsequentPregnancies = (reports, report) => {
  return reports.filter(function (r) {
    return (
      pregnancyForms.indexOf(r.form) >= 0 &&
      r.reported_date > report.reported_date
    );
  });
};

const hasTerminatePregnancyVisits = (reports, report) => {
  return reports.some(
    r =>
      terminatePregnancyForms.includes(r.form) &&
      getField(r, 'pregnancy_status.still_pregnant') === 'no' &&
      r.reported_date > report.reported_date
  );
};

const isPregnant = records => {
  const report =
    records.length > 0 ? getNewestReport(records, ['pregnancy']) : null;
  if (report) {
    return (
      !getSubsequentDeliveries(records, report).length &&
      !getSubsequentPregnancies(records, report).length &&
      !hasTerminatePregnancyVisits(records, report)
    );
  }
  return false;
};

const contains = (str, substrings) => {
  return str.split(' ').some(v => substrings.includes(v));
};

const getMostRecentEnrollment = (contact, reports, programs) => {
  // returns the most recent enrollment report and a corresponding exit report that was submitted after enrollment
  const program_reports = {
    enrollment: null,
    exit: null,
  };
  const exits = [];
  reports.forEach(function (r) {
    if (
      ((programs.includes('art') &&
        r.form === 'referral_follow_up' &&
        getField(r, 'hiv.initiated_treatment') === 'yes') ||
        (programs.includes('ncd') &&
          r.form === 'referral_follow_up' &&
          getField(r, 'ncds.ncd_confirmed') === 'yes') ||
        getField(r, 'ncds.other_ncd_confirmed') === 'yes' ||
        (programs.includes('eid') &&
          r.form === 'referral_follow_up' &&
          getField(r, 'eid.enrolled_in_eid') === 'yes') ||
        (programs.includes('malnutrition') &&
          r.form === 'referral_follow_up' &&
          getField(r, 'malnutrition.malnutrition_confirmed') === 'yes') ||
        (programs.includes('tb') &&
          r.form === 'referral_follow_up' &&
          getField(r, 'tb.put_on_treatment') === 'yes') ||
        (r.form === 'treatment_enrolment' &&
          contains(
            getField(r, 'treatment_program_details.treatment_enrolment'),
            programs
          )) ||
        (r.form === 'discharge' &&
          contains(
            getField(r, 'discharge_details.discharge_diagnoses'),
            programs
          )) ||
        (programs.includes('malnutrition') &&
          r.form === 'under_5_screening' &&
          getField(r, 'malnutrition_screening.enrolled') === 'yes') ||
        (programs.includes('tb') &&
          r.form === 'tb_screening' &&
          getField(r, 'enrolled_tb') === 'yes') ||
        (programs.includes('art') &&
          r.form === 'hiv_screening' &&
          getField(r, 'enrolled_art') === 'yes') ||
        (programs.includes('ncd') &&
          r.form === 'over_5_screening' &&
          getField(r, 'ncd_screening.is_enrolled_ncd') === 'yes')) &&
      (!program_reports.enrollment ||
        r.reported_date > program_reports.enrollment.reported_date)
    ) {
      program_reports.enrollment = r;
    }

    // note any exit reports we may find for active enrollment verification
    let program = '';
    if (programs.includes('malnutrition')) {
      program = 'malnutrition';
    } else if (programs.includes('tb')) {
      program = 'tb';
    }

    const field = 'exited_' + program;
    if (r.form === 'exit' && getField(r, field)) {
      exits.push(r);
    }
  });

  // verify they haven't been exited after enrollment
  if (program_reports.enrollment) {
    program_reports.exit = exits.find(function (r) {
      return r.reported_date > program_reports.enrollment.reported_date;
    });
  } else if (contact.conditions && contains(contact.conditions, programs)) {
    program_reports.enrollment = contact;
  } else if (contact.ncds && programs.includes('ncd')) {
    program_reports.enrollment = contact;
  }
  return program_reports;
};

const getTreatmentDuration = (contact, reports, condition) => {
  const enrollment_report = getMostRecentEnrollment(
    contact,
    reports,
    condition
  ).enrollment;
  if (enrollment_report) {
    if (['contact', 'person'].includes(enrollment_report.type)) {
      return condition.includes('tb')
        ? getDaysPast(new Date(), new Date(contact.tb_treatment_start_date))
        : getDaysPast(new Date(), new Date(contact.art_start_date));
    } else if (enrollment_report.type === 'data_record') {
      return getDaysPast(new Date(), new Date(enrollment_report.reported_date));
    }
  }
  return -1;
};
const getNextImmDate = report => getField(report, 'vaccines_given.next_visit');
// TODO: Check mute for certain dates

const getTraceReasonsFromLastTraceReport = reports => {
  const traceReport = getNewestReport(getSubsequentTraceReports(reports), [
    'trace',
  ]);
  const traceReasons = traceReport
    ? getField(traceReport, 'trace_details.c_trace_reasons')
    : null;
  return traceReasons
    ? traceReasons.replace(/^[,\s]+|[,\s]+$/g, '').replace(/,[,\s]*,/g, ',')
    : '';
};

const getSubsequentTraceReports = reports => {
  return reports.filter(function (r) {
    return traceForms.indexOf(r.form) >= 0;
  });
};

const pregnancDangerSignForms = [
  'pregnancy',
  'pregnancy_home_visit',
  'pregnancy_danger_sign',
  'pregannacy_danger_sign_follow_up',
];

const MAX_DAYS_IN_PREGNANCY = 42 * 7;
const AVG_DAYS_IN_PREGNANCY = 280;

function getFormArraySubmittedInWindow(allReports, formArray, start, end) {
  return allReports.filter(function (report) {
    return (
      formArray.includes(report.form) &&
      report.reported_date >= start &&
      report.reported_date <= end
    );
  });
}

function getLMPDateFromPregnancy(report) {
  return (
    isPregnancyForm(report) &&
    getField(report, 'lmp_date_8601') &&
    moment(getField(report, 'lmp_date_8601'))
  );
}

function getLMPDateFromPregnancyFollowUp(report) {
  return (
    isPregnancyFollowUpForm(report) &&
    getField(report, 'lmp_date_8601') &&
    moment(getField(report, 'lmp_date_8601'))
  );
}

function getMostRecentLMPDateForPregnancy(allReports, pregnancyReport) {
  let mostRecentLMP = getLMPDateFromPregnancy(pregnancyReport);
  let mostRecentReportDate = pregnancyReport.reported_date;
  getSubsequentPregnancyFollowUps(allReports, pregnancyReport).forEach(
    function (visit) {
      const lmpFromPregnancyFollowUp = getLMPDateFromPregnancyFollowUp(visit);
      if (
        visit.reported_date > mostRecentReportDate &&
        getField(visit, 'lmp_updated') === 'yes'
      ) {
        mostRecentReportDate = visit.reported_date;
        mostRecentLMP = lmpFromPregnancyFollowUp;
      }
    }
  );
  return mostRecentLMP;
}

function getMostRecentEDDForPregnancy(allReports, report) {
  const lmpDate = getMostRecentLMPDateForPregnancy(allReports, report);
  if (lmpDate) {
    return lmpDate.clone().add(AVG_DAYS_IN_PREGNANCY, 'days');
  }
}

function getDeliveryDate(report) {
  return (
    isDeliveryForm(report) &&
    getField(report, 'delivery_outcome.delivery_date') &&
    moment(getField(report, 'delivery_outcome.delivery_date'))
  );
}

function getNextANCVisitDate(allReports, report) {
  let nextVisit = getField(report, 't_pregnancy_follow_up_date');
  let eddReportDate = report.reported_date;
  const followUps = getSubsequentPregnancyFollowUps(allReports, report);
  followUps.forEach(function (followUpReport) {
    if (
      followUpReport.reported_date > eddReportDate &&
      !!getField(followUpReport, 't_pregnancy_follow_up_date')
    ) {
      eddReportDate = followUpReport.reported_date;
      nextVisit = getField(followUpReport, 't_pregnancy_follow_up_date');
    }
  });
  return moment(nextVisit);
}

function getDangerSignCodes(report) {
  const dangerSignCodes = [];
  if (getField(report, 't_danger_signs_referral_follow_up') === 'yes') {
    const dangerSignsObj = getField(report, 'danger_signs');
    if (dangerSignsObj) {
      for (const dangerSign in dangerSignsObj) {
        if (
          dangerSignsObj[dangerSign] === 'yes' &&
          dangerSign !== 'r_danger_sign_present'
        ) {
          dangerSignCodes.push(dangerSign);
        }
      }
    }
  }
  return dangerSignCodes;
}

function getLatestDangerSignsForPregnancy(allReports, pregnancy) {
  if (!pregnancy) {
    return [];
  }
  let lmpDate = getMostRecentLMPDateForPregnancy(allReports, pregnancy);
  if (!lmpDate) {
    lmpDate = moment(pregnancy.reported_date);
  } //If unknown, take preganacy.reported_date
  const allReportsWithDangerSigns = getFormArraySubmittedInWindow(
    allReports,
    pregnancDangerSignForms,
    lmpDate.toDate(),
    lmpDate.clone().add(MAX_DAYS_IN_PREGNANCY, 'days').toDate()
  );
  const allRelevantReports = [];
  allReportsWithDangerSigns.forEach(report => {
    if (isPregnancyFollowUpForm(report)) {
      //only push pregnancy home visit report that have actually been visited
      if (getField(report, 'pregnancy_summary.visit_option') === 'yes') {
        allRelevantReports.push(report);
      }
    }
    //for other allReports with danger signs, push without checking for visit
    else {
      allRelevantReports.push(report);
    }
  });
  const recentReport = getNewestReport(
    allRelevantReports,
    pregnancDangerSignForms
  );
  if (!recentReport) {
    return [];
  }
  return getDangerSignCodes(recentReport);
}

function getRiskFactorsFromPregnancy(report) {
  const riskFactors = [];
  if (!isPregnancyForm(report)) {
    return [];
  }
  if (getField(report, 'risk_factors.r_risk_factor_present') === 'yes') {
    if (
      getField(report, 'risk_factors.risk_factors_history.first_pregnancy') ===
      'yes'
    ) {
      riskFactors.push('first_pregnancy');
    }
    if (
      getField(
        report,
        'risk_factors.risk_factors_history.previous_miscarriage'
      ) === 'yes'
    ) {
      riskFactors.push('previous_miscarriage');
    }
    const riskFactorsPrimary = getField(
      report,
      'risk_factors.risk_factors_present.primary_condition'
    );
    const riskFactorsSecondary = getField(
      report,
      'risk_factors.risk_factors_present.secondary_condition'
    );
    if (riskFactorsPrimary) {
      riskFactors.push(...riskFactorsPrimary.split(' '));
    }
    if (riskFactorsSecondary) {
      riskFactors.push(...riskFactorsSecondary.split(' '));
    }
  }
  return riskFactors;
}

function getNewRiskFactorsFromFollowUps(report) {
  const riskFactors = [];
  if (!isPregnancyFollowUpForm(report)) {
    return [];
  }
  if (
    getField(report, 'anc_visits_hf.risk_factors.r_risk_factor_present') ===
    'yes'
  ) {
    const newRiskFactors = getField(
      report,
      'anc_visits_hf.risk_factors.new_risks'
    );
    if (newRiskFactors) {
      riskFactors.push(...newRiskFactors.split(' '));
    }
  }
  return riskFactors;
}

function getAllRiskFactors(allReports, pregnancy) {
  const riskFactorCodes = getRiskFactorsFromPregnancy(pregnancy);
  const pregnancyFollowUps = getSubsequentPregnancyFollowUps(
    allReports,
    pregnancy
  );
  pregnancyFollowUps.forEach(function (visit) {
    riskFactorCodes.push(...getNewRiskFactorsFromFollowUps(visit));
  });
  return riskFactorCodes;
}

function getRiskFactorExtra(report) {
  let extraRisk;
  if (report && isPregnancyForm(report)) {
    extraRisk = getField(
      report,
      'risk_factors.risk_factors_present.additional_risk'
    );
  } else if (report && isPregnancyFollowUpForm(report)) {
    extraRisk = getField(report, 'anc_visits_hf.risk_factors.additional_risk');
  }
  return extraRisk;
}

function getAllRiskFactorExtra(allReports, pregnancy) {
  const riskFactorsExtra = [];
  const riskFactorExtraFromPregnancy = getRiskFactorExtra(pregnancy);
  if (riskFactorExtraFromPregnancy) {
    riskFactorsExtra.push(riskFactorExtraFromPregnancy);
  }
  const pregnancyFollowUps = getSubsequentPregnancyFollowUps(
    allReports,
    pregnancy
  );
  pregnancyFollowUps.forEach(function (visit) {
    const riskFactorExtraFromVisit = getRiskFactorExtra(visit);
    if (riskFactorExtraFromVisit) {
      riskFactorsExtra.push(riskFactorExtraFromVisit);
    }
  });
  return riskFactorsExtra;
}

const isHighRiskPregnancy = function (allReports, pregnancy) {
  return (
    getAllRiskFactors(allReports, pregnancy).length ||
    getAllRiskFactorExtra(allReports, pregnancy).length ||
    getDangerSignCodes(pregnancy).length
  );
};

function isPregnancyForm(report) {
  return report && pregnancyForms.includes(report.form);
}

function isPregnancyFollowUpForm(report) {
  return report && antenatalForms.includes(report.form);
}

function isDeliveryForm(report) {
  return report && deliveryForms.includes(report.form);
}

function isActivePregnancy(thisContact, allReports, report) {
  if (
    thisContact.type !== 'person' ||
    !isAlive(thisContact) ||
    !isPregnancyForm(report)
  ) {
    return false;
  }
  const lmpDate =
    getMostRecentLMPDateForPregnancy(allReports, report) ||
    report.reported_date;
  const isPregnancyRegisteredWithin9Months =
    lmpDate > today.clone().subtract(MAX_DAYS_IN_PREGNANCY, 'day');
  const isPregnancyTerminatedByDeliveryInLast6Weeks =
    getSubsequentDeliveries(allReports, report, 6 * 7).length > 0;
  const isPregnancyTerminatedByAnotherPregnancyReport =
    getSubsequentPregnancies(allReports, report).length > 0;
  return (
    isPregnancyRegisteredWithin9Months &&
    !isPregnancyTerminatedByDeliveryInLast6Weeks &&
    !isPregnancyTerminatedByAnotherPregnancyReport &&
    !getRecentANCVisitWithEvent(allReports, report, 'abortion') &&
    !getRecentANCVisitWithEvent(allReports, report, 'miscarriage')
  );
}

function isReadyForNewPregnancy(thisContact, allReports) {
  if (thisContact.type !== 'person') {
    return false;
  }
  const mostRecentPregnancyReport = getNewestReport(allReports, pregnancyForms);
  const mostRecentDeliveryReport = getNewestReport(allReports, deliveryForms);
  if (!mostRecentPregnancyReport && !mostRecentDeliveryReport) {
    return true; //No previous pregnancy or delivery recorded, fresh profile
  } else if (!mostRecentPregnancyReport) {
    //Delivery report without pregnancy report
    //Decide on the basis of Delivery report

    if (
      mostRecentDeliveryReport &&
      getDeliveryDate(mostRecentDeliveryReport) <
        today.clone().subtract(6 * 7, 'day')
    ) {
      return true; //Delivery date on most recentlty submitted delivery form is more than 6 weeks ago
    }
  } else if (
    !mostRecentDeliveryReport ||
    mostRecentDeliveryReport.reported_date <
      mostRecentPregnancyReport.reported_date
  ) {
    //Pregnancy report without delivery report, or Pregnancy report newer than Delivery report
    //Decide on the basis of Pregnancy report

    let mostRecentlySubmittedLMPDate = getMostRecentLMPDateForPregnancy(
      allReports,
      mostRecentPregnancyReport
    );
    if (!mostRecentlySubmittedLMPDate) {
      mostRecentlySubmittedLMPDate = moment(
        mostRecentPregnancyReport.reported_date
      );
    }
    if (
      mostRecentlySubmittedLMPDate <
      today.clone().subtract(MAX_DAYS_IN_PREGNANCY, 'day')
    ) {
      return true;
      //Most recently submitted LMP is more than 294 days (42 weeks) ago
    }
    if (
      getRecentANCVisitWithEvent(
        allReports,
        mostRecentPregnancyReport,
        'abortion'
      ) ||
      getRecentANCVisitWithEvent(
        allReports,
        mostRecentPregnancyReport,
        'miscarriage'
      )
    ) {
      return true;
    }
  } else {
    //Both pregnancy and delivery report, Delivery report is newer than pregnancy report
    //Decide on the basis of Delivery report
    if (
      (mostRecentPregnancyReport &&
        getRecentANCVisitWithEvent(
          allReports,
          mostRecentPregnancyReport,
          'abortion'
        )) ||
      getRecentANCVisitWithEvent(
        allReports,
        mostRecentPregnancyReport,
        'miscarriage'
      )
    ) {
      return true;
    }
  }
  return false;
}

function isReadyForDelivery(thisContact, allReports) {
  //If pregnancy registration, date of LMP should be at least 6 months ago and no more than EDD + 6 weeks.
  //If pregnancy registration and no LMP, make it available at registration and until 280 days + 6 weeks from the date of registration.
  //If no pregnancy registration, previous delivery date should be at least 7 months ago.
  if (thisContact.type !== 'person') {
    return false;
  }
  const latestPregnancy = getNewestReport(allReports, pregnancyForms);
  const latestDelivery = getNewestReport(allReports, deliveryForms);
  if (!latestPregnancy && !latestDelivery) {
    //no previous pregnancy, no previous delivery
    return true;
  }
  if (
    latestDelivery &&
    (!latestPregnancy ||
      latestDelivery.reported_date > latestPregnancy.reported_date)
  ) {
    //no pregnancy registration, previous delivery date should be at least 7 months ago.
    return (
      getDeliveryDate(latestDelivery) < today.clone().subtract(7, 'months')
    );
  }

  if (latestPregnancy) {
    if (isPregnancyForm(latestPregnancy)) {
      const lmpDate = getMostRecentLMPDateForPregnancy(
        allReports,
        latestPregnancy
      );
      if (!lmpDate) {
        //no LMP, show until 280 days + 6 weeks from the date of registration
        return moment(latestPregnancy.reported_date)
          .clone()
          .startOf('day')
          .add(280 + 6 * 7, 'days')
          .isSameOrBefore(today);
      }
      //Pregnancy registration with LMP
      const edd = getMostRecentEDDForPregnancy(allReports, latestPregnancy);
      //at least 6 months ago, no more than EDD + 6 weeks
      return today.isBetween(
        lmpDate.clone().add(6, 'months'),
        edd.clone().add(6, 'weeks')
      );
    }
  }
  return false;
}

function getRecentANCVisitWithEvent(allReports, pregnancyReport, event) {
  //event can be one of miscarriage, abortion, refused, migrated
  const followUps = getSubsequentPregnancyFollowUps(
    allReports,
    pregnancyReport
  );
  const latestFollowup = getNewestReport(followUps, antenatalForms);
  if (
    latestFollowup &&
    getField(latestFollowup, 'pregnancy_summary.visit_option') === event
  ) {
    return latestFollowup;
  }
}

function getSubsequentPregnancyFollowUps(allReports, pregnancyReport) {
  let lmpDate = getLMPDateFromPregnancy(pregnancyReport);
  if (!lmpDate) {
    //LMP Date is not available, use reported date
    lmpDate = moment(pregnancyReport.reported_date);
  }
  const subsequentVisits = allReports.filter(function (visitReport) {
    return (
      isPregnancyFollowUpForm(visitReport) &&
      visitReport.reported_date > pregnancyReport.reported_date &&
      moment(visitReport.reported_date) <
        lmpDate.clone().add(MAX_DAYS_IN_PREGNANCY, 'days')
    );
  });
  return subsequentVisits;
}

function countANCFacilityVisits(allReports, pregnancyReport) {
  let ancHFVisits = 0;
  const pregnancyFollowUps = getSubsequentPregnancyFollowUps(
    allReports,
    pregnancyReport
  );
  if (
    getField(pregnancyReport, 'anc_visits_hf.anc_visits_hf_past') &&
    !isNaN(
      getField(
        pregnancyReport,
        'anc_visits_hf.anc_visits_hf_past.visited_hf_count'
      )
    )
  ) {
    ancHFVisits += parseInt(
      getField(
        pregnancyReport,
        'anc_visits_hf.anc_visits_hf_past.visited_hf_count'
      )
    );
  }
  ancHFVisits += pregnancyFollowUps.reduce(function (sum, report) {
    const pastANCHFVisits = getField(
      report,
      'anc_visits_hf.anc_visits_hf_past'
    );
    if (!pastANCHFVisits) {
      return 0;
    }
    sum += pastANCHFVisits.last_visit_attended === 'yes' && 1;
    if (isNaN(pastANCHFVisits.visited_hf_count)) {
      return sum;
    }
    return (sum +=
      pastANCHFVisits.report_other_visits === 'yes' &&
      parseInt(pastANCHFVisits.visited_hf_count));
  }, 0);
  return ancHFVisits;
}

function knowsHIVStatusInPast3Months(allReports) {
  let knows = false;
  const pregnancyFormsIn3Months = getFormArraySubmittedInWindow(
    allReports,
    pregnancyForms,
    today.clone().subtract(3, 'months'),
    today
  );
  pregnancyFormsIn3Months.forEach(function (report) {
    if (
      getField(
        report,
        'pregnancy_new_or_current.hiv_status.hiv_status_know'
      ) === 'yes'
    ) {
      knows = true;
    }
  });
  return knows;
}

const VACCINES = {
  bcg: 'BCG',
  birth_polio: 'Birth Polio (OPV 0)',
  opv_1: 'OPV 1',
  opv_2: 'OPV 2',
  opv_3: 'OPV 3',
  pcv_1: 'PCV 1',
  pcv_2: 'PCV 2',
  pcv_3: 'PCV 3',
  dpt_hepb_hib_1: 'DPT-HepB-Hib 1',
  dpt_hepb_hib_2: 'DPT-HepB-Hib 2',
  dpt_hepb_hib_3: 'DPT-HepB-Hib 3',
  ipv: 'IPV',
  rota_1: 'Rota 1',
  rota_2: 'Rota 2',
  vitamin_a: 'Vitamin A',
  measles_1: 'Measles 1',
  measles_2: 'Measles 2',
};

const NCDS = {
  hypertension: 'Hypertension',
  asthma: 'Asthma/chronic lung disease',
  diabetes: 'Diabetes',
  epilepsy: 'Epilepsy',
  mental_health: 'Mental health',
  heart_failure: 'Heart failure',
  other: 'Other',
};

// Function to get the appointment date from last visit
// @args: reports array
// @return: next appointment date from last under_5_screening
const getAppointmentDateFromLastVisit = allReports => {
  let appointment_date = '';
  const screenings = allReports.filter(function (r) {
    return r.form === 'under_5_screening';
  });
  if (screenings.length > 0) {
    const mostRecentScreening = getNewestReport(screenings, [
      'under_5_screening',
    ]);
    appointment_date =
      mostRecentScreening.fields && mostRecentScreening.fields.vaccines_given
        ? mostRecentScreening.fields.vaccines_given.next_visit
        : '';
  }
  return appointment_date;
};

const extractNcds = record => record.split(' ').map(item => NCDS[item]);

const extractVaccinations = record =>
  record.split(' ').map(item => VACCINES[item]);

// Function to check that a vaccine and dose was given
// @return: true/false
const getVaccinesReceived = allReports => {
  let vaccinations = [];
  allReports.forEach(report => {
    if (report.form === 'immunization' || report.form === 'under_5_screening') {
      const immunizations = getField(report, 'c_received_vaccines');
      if (immunizations) {
        vaccinations = vaccinations.concat(extractVaccinations(immunizations));
      }
    }
  });
  vaccinations = Array.from(new Set(vaccinations));
  return vaccinations.map(vaccine => vaccine).join(', ');
};

const getVaccinesNotReceived = vaccinesReceived => {
  return Object.keys(VACCINES).filter(
    key => !vaccinesReceived.includes(VACCINES[key])
  );
};

const isFullyImmunized = allReports => {
  const completableVaccines = Object.assign({}, VACCINES);
  // birth_polio is not a must to be considered fully immunized
  // https://github.com/medic/config-pih/issues/29#issuecomment-620575824
  delete completableVaccines.birth_polio;

  return (
    getVaccinesReceived(allReports)
      .split(', ')
      .filter(vaccine => vaccine !== 'Birth Polio (OPV 0)').length ===
    Object.keys(completableVaccines).length
  );
};

// Function to get the formatted date - 'dd/mm/yyyy'
// @args: date string
// @return: formatted date
const getFormattedDate = dateString => {
  if (dateString && dateString !== 'unknown') {
    const intlDate = new Date(dateString);
    dateString =
      ('0' + intlDate.getDate()).slice(-2) +
      '/' +
      ('0' + (intlDate.getMonth() + 1)).slice(-2) +
      '/' +
      intlDate.getFullYear();
  }
  return dateString;
};

const getNcds = (contact, reports, program) => {
  const enrollment_report = getMostRecentEnrollment(
    contact,
    reports,
    program
  ).enrollment;
  let ncds = [];
  let other_ncds = [];
  if (enrollment_report) {
    let ncd = '';
    let others = '';
    switch (enrollment_report.form) {
      case 'over_5_screening':
        ncd = getField(enrollment_report, 'ncd_screening.ncds');
        others = getField(enrollment_report, 'ncd_screening.ncds_other');
        break;
      case 'treatment_enrolment':
        ncd = getField(enrollment_report, 'treatment_program_details.ncds');
        others = getField(
          enrollment_report,
          'treatment_program_details.ncds_other'
        );
        break;
      case 'referral_follow_up':
        ncd = getField(enrollment_report, 'ncds.other_ncds');
        others = getField(enrollment_report, 'ncds.other_ncds_other');
        break;
      default:
        ncd = enrollment_report.ncds;
        others = enrollment_report.ncds_other;
        break;
    }

    ncds = extractNcds(ncd);
    if (others) {
      ncds = ncds.filter(item => item !== 'Other');
      other_ncds = 'Other - ' + others;
    }
  }
  ncds = Array.from(new Set(ncds.concat(other_ncds)));
  return ncds;
};

const getTBTestResult = reports => {
  const tbResult = getNewestReport(reports, ['tb_results']);
  return (tbResult && getField(tbResult, 'results')) || '';
};

const getTreatmentProgramId = (contact, reports, condition) => {
  let id = '';
  const enrollment = getMostRecentEnrollment(
    contact,
    reports,
    condition
  ).enrollment;
  if (enrollment) {
    if (
      enrollment.type === 'data_record' &&
      enrollment.form === 'referral_follow_up'
    ) {
      if (condition.includes('eid')) {
        id = getField(enrollment, 'eid.eid_id');
      } else if (condition.includes('art')) {
        id = getField(enrollment, 'hiv.art_id');
      } else if (condition.includes('ncd')) {
        id = getField(enrollment, 'ncds.ncd_id');
      }
    } else if (
      enrollment.type === 'data_record' &&
      enrollment.form === 'treatment_enrolment'
    ) {
      if (condition.includes('eid')) {
        id = getField(enrollment, 'treatment_program_details.eid_id');
      } else if (condition.includes('art')) {
        id = getField(enrollment, 'treatment_program_details.art_id');
      } else if (condition.includes('ncd')) {
        id = getField(enrollment, 'treatment_program_details.ncd_id');
      }
    } else if (
      enrollment.type === 'data_record' &&
      enrollment.form === 'hiv_screening'
    ) {
      id = getField(enrollment, 'art_id');
    } else if (
      enrollment.type === 'data_record' &&
      enrollment.form === 'over_5_screening'
    ) {
      id = getField(enrollment, 'ncd_screening.ncd_id');
    } else if (enrollment.type === 'contact') {
      if (condition.includes('eid')) {
        id = enrollment.eid_id;
      } else if (condition.includes('art')) {
        id = enrollment.art_id;
      } else if (condition.includes('ncd')) {
        id = enrollment.ncd_id;
      }
    }
    // avoid returning default ID suffix as treatment ID
    if (condition.includes('ncd') && id.trim() === 'CCC') {
      id = '';
    }
  }
  return id;
};

const isContactTraceReferred = reports => {
  const visits = reports.filter(function (r) {
    return (
      r.form === 'tb_home_visit' && getField(r, 'contact_tracing.referred')
    );
  });
  const visit = getNewestReport(visits, ['tb_home_visit']);
  return visit && getField(visit, 'contact_tracing.referred') === 'yes';
};

module.exports = {
  MAX_DAYS_IN_PREGNANCY,
  VACCINES,
  countANCFacilityVisits,
  getAllRiskFactorExtra,
  getAllRiskFactors,
  getAppointmentDateFromLastVisit,
  getDeliveryDate,
  getField,
  getFormArraySubmittedInWindow,
  getFormattedDate,
  getLatestDangerSignsForPregnancy,
  getMostRecentEDDForPregnancy,
  getMostRecentLMPDateForPregnancy,
  getNewestReport,
  getNextANCVisitDate,
  getRecentANCVisitWithEvent,
  getSubsequentDeliveries,
  getSubsequentPregnancyFollowUps,
  getVaccinesReceived,
  isActivePregnancy,
  isAlive,
  isFullyImmunized,
  isHighRiskPregnancy,
  isPregnant,
  isReadyForDelivery,
  isReadyForNewPregnancy,
  knowsHIVStatusInPast3Months,
  now,
  today,
  getNextImmDate,
  getYearsPast,
  getMostRecentEnrollment,
  getNcds,
  getSubsequentTraceReports,
  getTBTestResult,
  getTraceReasonsFromLastTraceReport,
  getTreatmentDuration,
  getTreatmentProgramId,
  isContactTraceReferred,
  getVaccinesNotReceived,
};
