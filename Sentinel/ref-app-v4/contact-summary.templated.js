/* eslint-disable no-nested-ternary */
/* eslint-disable indent */
// @ts-nocheck
const moment = require('moment');
const extras = require('./contact-summary-extras');
const {
  MAX_DAYS_IN_PREGNANCY,
  countANCFacilityVisits,
  getAllRiskFactorExtra,
  getAllRiskFactors,
  getDeliveryDate,
  getField,
  getFormArraySubmittedInWindow,
  getLatestDangerSignsForPregnancy,
  getMostRecentEDDForPregnancy,
  getMostRecentLMPDateForPregnancy,
  getNewestReport,
  getNextANCVisitDate,
  getRecentANCVisitWithEvent,
  getSubsequentDeliveries,
  getSubsequentPregnancyFollowUps,
  getYearsPast,
  isActivePregnancy,
  isAlive,
  isHighRiskPregnancy,
  isReadyForDelivery,
  isReadyForNewPregnancy,
  now,
  today,
  getFormattedDate,
  getVaccinesReceived,
  getVaccinesNotReceived,
} = extras;

//contact, allReports, lineage are globally available for contact-summary
const thisContact = contact;
const thisLineage = lineage;
const allReports = reports;

const context = {
  alive: isAlive(thisContact),
  muted: false,
  show_pregnancy_form: isReadyForNewPregnancy(thisContact, allReports),
  show_delivery_form: isReadyForDelivery(thisContact, allReports),
  is_fully_immunized:
    getVaccinesNotReceived(getVaccinesReceived(allReports)).filter(
      vaccine => vaccine !== 'birth_polio'
    ).length < 1,
  vaccines_not_received: getVaccinesNotReceived(
    getVaccinesReceived(allReports)
  ),
};

const fields = [
  {
    appliesToType: 'person',
    label: 'patient_id',
    value: thisContact.patient_id,
    width: 4,
  },
  {
    appliesToType: 'person',
    label: 'contact.age',
    value: thisContact.date_of_birth,
    width: 4,
    filter: 'age',
  },
  {
    appliesToType: 'person',
    label: 'contact.sex',
    value: 'contact.sex.' + thisContact.sex,
    translate: true,
    width: 4,
  },
  {
    appliesToType: 'person',
    appliesIf: function () {
      return thisContact.phone && thisContact.phone.length > 0;
    },
    label: 'person.field.phone',
    value: thisContact.phone,
    width: 4,
  },
  {
    appliesToType: 'person',
    appliesIf: function () {
      return (
        thisContact.phone_alternate && thisContact.phone_alternate.length > 0
      );
    },
    label: 'person.field.alternate_phone',
    value: thisContact.phone_alternate,
    width: 4,
  },
  {
    appliesToType: 'person',
    appliesIf: function () {
      return thisContact.external_id && thisContact.external_id.length > 0;
    },
    label: 'External ID',
    value: thisContact.external_id,
    width: 4,
  },
  {
    appliesToType: 'person',
    label: 'contact.parent',
    value: thisLineage,
    filter: 'lineage',
  },
  {
    appliesToType: '!person',
    label: 'contact',
    value: thisContact.contact && thisContact.contact.name,
    width: 4,
  },
  {
    appliesToType: '!person',
    label: 'contact.phone',
    value: thisContact.contact && thisContact.contact.phone,
    width: 4,
  },
  {
    appliesToType: '!person',
    label: 'External ID',
    value: thisContact.external_id,
    width: 4,
  },
  {
    appliesToType: '!person',
    appliesIf: function () {
      return thisContact.parent && thisLineage[0];
    },
    label: 'contact.parent',
    value: thisLineage,
    filter: 'lineage',
  },

  {
    appliesToType: '!person',
    label: 'contact.notes',
    value: thisContact.notes,
    width: 12,
  },
];

if (thisContact.short_name) {
  fields.unshift({
    appliesToType: 'person',
    label: 'contact.short_name',
    value: thisContact.short_name,
    width: 4,
  });
}

const cards = [
  {
    label: 'contact.profile.pregnancy.active',
    appliesToType: 'report',
    appliesIf: function (report) {
      return isActivePregnancy(thisContact, allReports, report);
    },
    fields: function (report) {
      const fields = [];
      const riskFactors = getAllRiskFactors(allReports, report);
      const riskFactorsCustom = getAllRiskFactorExtra(allReports, report);
      //if (riskFactorCustom) { riskFactors.push(riskFactorCustom); }
      const dangerSigns = getLatestDangerSignsForPregnancy(allReports, report);

      const highRisk = isHighRiskPregnancy(allReports, report);

      const mostRecentANC = getNewestReport(allReports, [
        'pregnancy',
        'pregnancy_home_visit',
      ]);
      const mostRecentANCDate = moment(mostRecentANC.reported_date);
      const lmp_date = getMostRecentLMPDateForPregnancy(allReports, report);
      const edd_ms = getMostRecentEDDForPregnancy(allReports, report);
      const nextAncVisitDate = getNextANCVisitDate(allReports, report);
      const weeksPregnant = lmp_date ? today.diff(lmp_date, 'weeks') : null;
      let lmp_approx = getField(report, 'lmp_approx');
      let reportDate = report.reported_date;
      getSubsequentPregnancyFollowUps(allReports, report).forEach(function (
        followUpReport
      ) {
        //check if LMP was updated
        if (
          followUpReport.reported_date > reportDate &&
          getField(followUpReport, 'lmp_updated') === 'yes'
        ) {
          reportDate = followUpReport.reported_date;
          if (getField(followUpReport, 'lmp_method_approx')) {
            lmp_approx = getField(followUpReport, 'lmp_method_approx');
          }
        }
      });

      const migratedReport = getRecentANCVisitWithEvent(
        allReports,
        report,
        'migrated'
      );
      const refusedReport = getRecentANCVisitWithEvent(
        allReports,
        report,
        'refused'
      );
      const stopReport = migratedReport || refusedReport;
      if (stopReport) {
        const clearAll =
          getField(stopReport, 'pregnancy_ended.clear_option') === 'clear_all';
        fields.push(
          {
            label: 'contact.profile.change_care',
            value: migratedReport ? 'Migrated out of area' : 'Refusing care',
            width: 6,
          },
          {
            label: 'contact.profile.tasks_on_off',
            value: clearAll ? 'Off' : 'On',
            width: 6,
          }
        );
      }
      fields.push(
        {
          label: 'Weeks Pregnant',
          value:
            weeksPregnant || weeksPregnant === 0
              ? { number: weeksPregnant, approximate: lmp_approx === 'yes' }
              : 'contact.profile.value.unknown',
          translate: !weeksPregnant && weeksPregnant !== 0,
          filter: weeksPregnant || weeksPregnant === 0 ? 'weeksPregnant' : '',
          width: 6,
        },
        {
          label: 'contact.profile.edd',
          value: edd_ms ? edd_ms.valueOf() : 'contact.profile.value.unknown',
          translate: !edd_ms,
          filter: edd_ms ? 'simpleDate' : '',
          width: 6,
        }
      );

      if (highRisk) {
        let riskValue = '';
        if (!riskFactors && riskFactorsCustom) {
          riskValue = riskFactorsCustom.join(', ');
        } else if (
          riskFactors.length > 1 ||
          (riskFactors && riskFactorsCustom)
        ) {
          riskValue = 'contact.profile.risk.multiple';
        } else {
          riskValue = 'contact.profile.danger_sign.' + riskFactors[0];
        }
        fields.push({
          label: 'contact.profile.risk.high',
          value: riskValue,
          translate: true,
          icon: 'icon-risk',
          width: 6,
        });
      }

      if (dangerSigns.length > 0) {
        fields.push({
          label: 'contact.profile.danger_signs.current',
          value:
            dangerSigns.length > 1
              ? 'contact.profile.danger_sign.multiple'
              : 'contact.profile.danger_sign.' + dangerSigns[0],
          translate: true,
          width: 6,
        });
      }

      fields.push(
        {
          label: 'contact.profile.visit',
          value: 'contact.profile.visits.of',
          context: {
            count: countANCFacilityVisits(allReports, report),
            total: 8,
          },
          translate: true,
          width: 6,
        },
        {
          label: 'contact.profile.last_visited',
          value: mostRecentANCDate.valueOf(),
          filter: 'relativeDay',
          width: 6,
        }
      );

      if (nextAncVisitDate && nextAncVisitDate.isSameOrAfter(today)) {
        fields.push({
          label: 'contact.profile.anc.next',
          value: nextAncVisitDate.valueOf(),
          filter: 'simpleDate',
          width: 6,
        });
      }

      return fields;
    },
    modifyContext: function (ctx, report) {
      let lmpDate = getField(report, 'lmp_date_8601');
      let lmpMethodApprox = getField(report, 'lmp_method_approx');
      let hivTested = getField(report, 'hiv_status_known');
      let dewormingMedicationReceived = getField(
        report,
        'deworming_med_received'
      );
      let ttReceived = getField(report, 'tt_received');
      const riskFactorCodes = getAllRiskFactors(allReports, report);
      const riskFactorsCustom = getAllRiskFactorExtra(allReports, report);
      let pregnancyFollowupDateRecent = getField(
        report,
        't_pregnancy_follow_up_date'
      );

      const followUps = getSubsequentPregnancyFollowUps(allReports, report);
      followUps.forEach(function (followUpReport) {
        if (getField(followUpReport, 'lmp_updated') === 'yes') {
          lmpDate = getField(followUpReport, 'lmp_date_8601');
          lmpMethodApprox = getField(followUpReport, 'lmp_method_approx');
        }
        hivTested = getField(followUpReport, 'hiv_status_known');
        dewormingMedicationReceived = getField(
          followUpReport,
          'deworming_med_received'
        );
        ttReceived = getField(followUpReport, 'tt_received');
        if (getField(followUpReport, 't_pregnancy_follow_up') === 'yes') {
          pregnancyFollowupDateRecent = getField(
            followUpReport,
            't_pregnancy_follow_up_date'
          );
        }
      });
      ctx.lmp_date_8601 = lmpDate;
      ctx.lmp_method_approx = lmpMethodApprox;
      ctx.is_active_pregnancy = true;
      ctx.deworming_med_received = dewormingMedicationReceived;
      ctx.hiv_tested_past = hivTested;
      ctx.tt_received_past = ttReceived;
      ctx.risk_factor_codes = riskFactorCodes.join(' ');
      ctx.risk_factor_extra = riskFactorsCustom.join('; ');
      ctx.pregnancy_follow_up_date_recent = pregnancyFollowupDateRecent;
      ctx.pregnancy_uuid = report._id;
    },
  },
  {
    label: 'contact.profile.immunizations',
    appliesToType: 'person',
    appliesIf: () => {
      if (
        thisContact.type === 'person' &&
        getNewestReport(allReports, ['immunization', 'under_5_screening']) &&
        getYearsPast(new Date(contact.date_of_birth), new Date(now)) < 2
      ) {
        return true;
      }
      return false;
    },
    fields: () => {
      const fields = [];
      const newestImmVisit = getNewestReport(allReports, [
        'immunization',
        'under_5_screening',
      ]);

      fields.push({
        label: 'contact.profile.immunization.date',
        value: getFormattedDate(
          getField(newestImmVisit, 'vaccines_given').vaccine_date
        ),
        width: 6,
      });
      fields.push({
        label: 'contact.profile.immunization.next_visit',
        value: getFormattedDate(
          getField(newestImmVisit, 'vaccines_given').next_visit
        ),
        width: 6,
      });
      fields.push({
        label: 'contact.profile.immunization.vaccines_given',
        value: getVaccinesReceived(allReports),
        width: 12,
        icon: 'icon-immunization',
      });

      fields.push({
        label: 'contact.profile.immunization.fully_immunized',
        value: context.is_fully_immunized ? 'Yes' : 'No',
        translate: true,
        width: 6,
      });
      return fields;
    },
    modifyContext: function (ctx) {
      const vaccinesReceived = getVaccinesReceived(allReports);
      ctx.vaccines_not_received = getVaccinesNotReceived(vaccinesReceived);
    },
  },
  {
    label: 'contact.profile.death.title',
    appliesToType: 'person',
    appliesIf: function () {
      return !isAlive(thisContact);
    },
    fields: function () {
      const fields = [];
      let dateOfDeath;
      let placeOfDeath;
      const deathReport = getNewestReport(allReports, ['death_report']);
      if (deathReport) {
        const deathDetails = getField(deathReport, 'death_details');
        if (deathDetails) {
          dateOfDeath = deathDetails.date_of_death;
          placeOfDeath = deathDetails.place_of_death;
        }
      } else if (thisContact.date_of_death) {
        dateOfDeath = thisContact.date_of_death;
      }
      fields.push(
        {
          label: 'contact.profile.death.date',
          value: dateOfDeath ? dateOfDeath : 'contact.profile.value.unknown',
          filter: dateOfDeath ? 'simpleDate' : '',
          translate: dateOfDeath ? false : true,
          width: 6,
        },
        {
          label: 'contact.profile.death.place',
          value: placeOfDeath ? placeOfDeath : 'contact.profile.value.unknown',
          translate: true,
          width: 6,
        }
      );
      return fields;
    },
  },
  {
    label: 'contact.profile.pregnancy.past',
    appliesToType: 'report',
    appliesIf: function (report) {
      if (thisContact.type !== 'person') {
        return false;
      }
      if (report.form === 'delivery') {
        return true;
      }
      if (report.form === 'pregnancy') {
        //check if early end to pregnancy (miscarriage/abortion)
        if (
          getRecentANCVisitWithEvent(allReports, report, 'abortion') ||
          getRecentANCVisitWithEvent(allReports, report, 'miscarriage')
        ) {
          return true;
        }
        //check if 42 weeks past pregnancy and no delivery form submitted
        const lmpDate = getMostRecentLMPDateForPregnancy(allReports, report);
        return (
          lmpDate &&
          today.isSameOrAfter(lmpDate.clone().add(42, 'weeks')) &&
          getSubsequentDeliveries(allReports, report, MAX_DAYS_IN_PREGNANCY)
            .length === 0
        );
      }
      return false;
    },
    fields: function (report) {
      const fields = [];
      let relevantPregnancy;
      let dateOfDelivery;
      let placeOfDelivery = '';
      let babiesDelivered = 0;
      let babiesDeceased = 0;
      let ancFacilityVisits = 0;

      //if there was either a delivery, an early end to pregnancy or 42 weeks have passed
      if (report.form === 'delivery') {
        const deliveryReportDate = moment(report.reported_date);
        relevantPregnancy = getFormArraySubmittedInWindow(
          allReports,
          ['pregnancy'],
          deliveryReportDate
            .clone()
            .subtract(MAX_DAYS_IN_PREGNANCY, 'days')
            .toDate(),
          deliveryReportDate.toDate()
        )[0];

        //If there was a delivery
        if (getField(report, 'delivery_outcome')) {
          dateOfDelivery = getDeliveryDate(report);
          placeOfDelivery = getField(report, 'delivery_outcome.delivery_place');
          babiesDelivered = getField(
            report,
            'delivery_outcome.babies_delivered_num'
          );
          babiesDeceased = getField(
            report,
            'delivery_outcome.babies_deceased_num'
          );
          fields.push(
            {
              label: 'contact.profile.delivery_date',
              value: dateOfDelivery ? dateOfDelivery.valueOf() : '',
              filter: 'simpleDate',
              width: 6,
            },
            {
              label: 'contact.profile.delivery_place',
              value: placeOfDelivery,
              translate: true,
              width: 6,
            },
            {
              label: 'contact.profile.delivered_babies',
              value: babiesDelivered,
              width: 6,
            }
          );
        }
      }
      //if early end to pregnancy
      else if (report.form === 'pregnancy') {
        relevantPregnancy = report;
        const lmpDate = getMostRecentLMPDateForPregnancy(
          allReports,
          relevantPregnancy
        );
        const abortionReport = getRecentANCVisitWithEvent(
          allReports,
          relevantPregnancy,
          'abortion'
        );
        const miscarriageReport = getRecentANCVisitWithEvent(
          allReports,
          relevantPregnancy,
          'miscarriage'
        );
        const endReport = abortionReport || miscarriageReport;
        if (endReport) {
          let endReason = '';
          let endDate = moment(0);
          let weeksPregnantAtEnd = 0;
          if (abortionReport) {
            endReason = 'abortion';
            endDate = moment(
              getField(abortionReport, 'pregnancy_ended.abortion_date')
            );
          } else {
            endReason = 'miscarriage';
            endDate = moment(
              getField(miscarriageReport, 'pregnancy_ended.miscarriage_date')
            );
          }

          weeksPregnantAtEnd = endDate.diff(lmpDate, 'weeks');
          fields.push(
            {
              label: 'contact.profile.pregnancy.end_early',
              value: endReason,
              translate: true,
              width: 6,
            },
            {
              label: 'contact.profile.pregnancy.end_date',
              value: endDate.valueOf(),
              filter: 'simpleDate',
              width: 6,
            },
            {
              label: 'contact.profile.pregnancy.end_weeks',
              value:
                weeksPregnantAtEnd > 0
                  ? weeksPregnantAtEnd
                  : 'contact.profile.value.unknown',
              translate: weeksPregnantAtEnd <= 0,
              width: 6,
            }
          );
        }
        //if no delivery form and past 42 weeks, display EDD as delivery date
        else if (
          lmpDate &&
          today.isSameOrAfter(lmpDate.clone().add(42, 'weeks')) &&
          getSubsequentDeliveries(allReports, report, MAX_DAYS_IN_PREGNANCY)
            .length === 0
        ) {
          dateOfDelivery = getMostRecentEDDForPregnancy(allReports, report);
          fields.push({
            label: 'contact.profile.delivery_date',
            value: dateOfDelivery
              ? dateOfDelivery.valueOf()
              : 'contact.profile.value.unknown',
            filter: 'simpleDate',
            translate: dateOfDelivery ? false : true,
            width: 6,
          });
        }
      }

      if (babiesDeceased > 0) {
        if (getField(report, 'baby_death')) {
          fields.push({
            label: 'contact.profile.deceased_babies',
            value: babiesDeceased,
            width: 6,
          });
          let babyDeaths = getField(report, 'baby_death.baby_death_repeat');
          if (!babyDeaths) {
            babyDeaths = [];
          }
          let count = 0;
          babyDeaths.forEach(function (babyDeath) {
            if (count > 0) {
              fields.push({ label: '', value: '', width: 6 });
            }
            fields.push(
              {
                label: 'contact.profile.newborn.death_date',
                value: babyDeath.baby_death_date,
                filter: 'simpleDate',
                width: 6,
              },
              {
                label: 'contact.profile.newborn.death_place',
                value: babyDeath.baby_death_place,
                translate: true,
                width: 6,
              },
              {
                label: 'contact.profile.delivery.stillbirthQ',
                value: babyDeath.stillbirth,
                translate: true,
                width: 6,
              }
            );
            count++;
            if (count === babyDeaths.length) {
              fields.push({ label: '', value: '', width: 6 });
            }
          });
        }
      }

      if (relevantPregnancy) {
        ancFacilityVisits = countANCFacilityVisits(
          allReports,
          relevantPregnancy
        );
        fields.push({
          label: 'contact.profile.anc_visit',
          value: ancFacilityVisits,
          width: 3,
        });

        const highRisk = isHighRiskPregnancy(allReports, relevantPregnancy);
        if (highRisk) {
          let riskValue = '';
          const riskFactors = getAllRiskFactors(allReports, relevantPregnancy);
          const riskFactorsCustom = getAllRiskFactorExtra(
            allReports,
            relevantPregnancy
          );
          if (!riskFactors && riskFactorsCustom) {
            riskValue = riskFactorsCustom.join(', ');
          } else if (
            riskFactors.length > 1 ||
            (riskFactors && riskFactorsCustom)
          ) {
            riskValue = 'contact.profile.risk.multiple';
          } else {
            riskValue = 'contact.profile.danger_sign.' + riskFactors[0];
          }
          fields.push({
            label: 'contact.profile.risk.high',
            value: riskValue,
            translate: true,
            icon: 'icon-risk',
            width: 6,
          });
        }
      }

      return fields;
    },
  },
  // {
  //   label: 'contact.profile.treatment_program',
  //   appliesToType: 'person',
  //   appliesIf: function () {
  //     const treatment_reports = getMostRecentEnrollment(contact, allReports, [
  //       'art',
  //       'tb',
  //       'ncd',
  //       'malnutrition',
  //       'eid',
  //     ]);
  //     return treatment_reports.enrollment && !treatment_reports.exit;
  //   },
  //   fields: function () {
  //     const fields = [];
  //     const artProgramId = getTreatmentProgramId(contact, allReports, ['art']);
  //     fields.push({
  //       label: 'contact.profile.art',
  //       // eslint-disable-next-line no-nested-ternary
  //       value: getMostRecentEnrollment(contact, allReports, ['art']).enrollment
  //         ? artProgramId
  //           ? artProgramId.toUpperCase()
  //           : 'contact.profile.no-id'
  //         : 'contact.profile.not-enrolled',
  //       width: 6,
  //       translate: true,
  //     });
  //     if (getYearsPast(new Date(contact.date_of_birth), new Date(now)) < 5) {
  //       fields.push({
  //         label: 'contact.profile.eid',
  //         value: getMostRecentEnrollment(contact, allReports, ['eid'])
  //           .enrollment
  //           ? getTreatmentProgramId(contact, allReports, ['eid']).toUpperCase()
  //           : 'contact.profile.not-enrolled',
  //         width: 6,
  //         translate: true,
  //       });
  //     }
  //     fields.push({
  //       label: 'contact.profile.tb_program',
  //       value: getMostRecentEnrollment(contact, allReports, ['tb']).enrollment
  //         ? 'contact.profile.enrolled'
  //         : 'contact.profile.not-enrolled',
  //       width: 12,
  //       translate: true,
  //     });
  //     if (getYearsPast(new Date(contact.date_of_birth), new Date(now)) < 5) {
  //       fields.push({
  //         label: 'contact.profile.malnutrition_program',
  //         value: getMostRecentEnrollment(contact, allReports, ['malnutrition'])
  //           .enrollment
  //           ? 'contact.profile.enrolled'
  //           : 'contact.profile.not-enrolled',
  //         width: 12,
  //         translate: true,
  //       });
  //     }
  //     fields.push({
  //       label: 'contact.profile.ncd_label',
  //       value: getMostRecentEnrollment(contact, allReports, ['ncd']).enrollment
  //         ? Array.from(new Set(getNcds(contact, allReports, ['ncd']))).join()
  //         : 'contact.profile.not-enrolled',
  //       width: 12,
  //       translate: true,
  //     });
  //     if (getMostRecentEnrollment(contact, allReports, ['ncd']).enrollment) {
  //       fields.push({
  //         label: 'contact.profile.ncd_id',
  //         value: getTreatmentProgramId(contact, allReports, ['ncd'])
  //           ? getTreatmentProgramId(contact, allReports, ['ncd']).toUpperCase()
  //           : 'contact.profile.no-id',
  //         width: 6,
  //         translate: true,
  //       });
  //     }
  //     fields.push({
  //       label: 'contact.profile.mental_health_id',
  //       value: getMostRecentEnrollment(contact, allReports, ['mental_health'])
  //         .enrollment
  //         ? getTreatmentProgramId(contact, allReports, [
  //             'mental_health',
  //           ]).toUpperCase()
  //         : 'contact.profile.not-enrolled',
  //       width: 6,
  //       translate: true,
  //     });
  //     return fields;
  //   },
  //   modifyContext: function (ctx) {
  //     ctx.is_in_art = getMostRecentEnrollment(contact, allReports, ['art'])
  //       .enrollment
  //       ? 'yes'
  //       : 'no';
  //     ctx.is_in_tb = getMostRecentEnrollment(contact, allReports, ['tb'])
  //       .enrollment
  //       ? 'yes'
  //       : 'no';
  //     ctx.is_in_ncd = getMostRecentEnrollment(contact, allReports, ['ncd'])
  //       .enrollment
  //       ? 'yes'
  //       : 'no';
  //     ctx.is_in_eid = getMostRecentEnrollment(contact, allReports, ['eid'])
  //       .enrollment
  //       ? 'yes'
  //       : 'no';
  //     ctx.is_in_malnutrition = getMostRecentEnrollment(contact, allReports, [
  //       'malnutrition',
  //     ]).enrollment
  //       ? 'yes'
  //       : 'no';
  //     ctx.ncds = getNcds(contact, allReports, ['ncd']);
  //     ctx.other_ncds = Array.from(
  //       new Set(getNcds(contact, allReports, ['ncd']))
  //     )
  //       .join()
  //       .split(' - ')[1];
  //     ctx.art_duration = getTreatmentDuration(contact, allReports, ['art']);
  //     ctx.tb_treatment_duration = getTreatmentDuration(contact, allReports, [
  //       'tb',
  //     ]);
  //     ctx.appt_date = getAppointmentDateFromLastTraceReport(allReports);
  //     ctx.trace_reasons = getTraceReasonsFromLastTraceReport(allReports);
  //     ctx.has_trace_report = getSubsequentTraceReports(allReports).length
  //       ? 'yes'
  //       : 'no';
  //     ctx.art_duration_years = parseInt(
  //       getTreatmentDuration(contact, allReports, ['art']) / DAYS_IN_YEAR
  //     );
  //     ctx.is_contact_tracing_referred = isContactTraceReferred(allReports)
  //       ? 'yes'
  //       : 'no';
  //     ctx.ncd_id = getTreatmentProgramId(contact, allReports, ['ncd']);
  //     ctx.tb_test_result = getTBTestResult(allReports);
  //   },
  // },
];

module.exports = {
  context: context,
  cards: cards,
  fields: fields,
};
