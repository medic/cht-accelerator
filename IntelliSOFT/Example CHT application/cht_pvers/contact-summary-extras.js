const isHouseholdMember = (contact) => contact.contact_type === 'household_member' && contact.parent && contact.parent.parent && contact.parent.parent.parent && contact.parent.parent.parent.parent;

const getField = (report, fieldPath) => ['fields', ...(fieldPath || '').split('.')]
    .reduce((prev, fieldName) => {
        if (prev === undefined) { return undefined; }
        return prev[fieldName];
    }, report);



function getNewestReport(allReports, forms) {
    let result;
    allReports.forEach(function (report) {
        if (!isReportValid(report) || !forms.includes(report.form)) { return; }
        if (!result || report.reported_date > result.reported_date) {
            result = report;
        }
    });
    return result;
}
const isReportValid = function (report) {
    if (report.form && report.fields && report.reported_date) { return true; }
    return false;
};

const buildAssessmentCard = (contact, reports) => {
    const fields = [];
    let mostRecentReport;
    let mostRecentPadrReport;
    const context = {};

    if (reports) {
        reports.forEach((report) => {

            if (report.form === 'assessment') {
                if (!mostRecentReport || mostRecentReport.reported_date < report.reported_date) {
                    mostRecentReport = report;
                }
            }
            else if (report.form === 'padr') {
                if (!mostRecentPadrReport || mostRecentPadrReport.reported_date < report.reported_date) {
                    mostRecentPadrReport = report;
                }
            }
        });
        if (mostRecentReport) {
            const reaction = getField(mostRecentReport, 'reporter.group_report.group_report_adr.reaction');
            const medicine = getField(mostRecentReport, 'reporter.group_report.group_report_quality.medicine');
            context.reaction = reaction;
            context.medicine = medicine;

            fields.push({
                label: 'Adverse Drug Reaction',
                value: reaction,
                width: 6
            });
            fields.push({
                label: 'Poor Quality Medicine',
                value: medicine,
                width: 6
            });

        }
        if (mostRecentPadrReport) {
            //padr
            console.log(mostRecentPadrReport);
            const type = getField(mostRecentPadrReport, 'form.reporter.group_report.type');
            const outcome = getField(mostRecentPadrReport, 'form.outcome_details.group_outcome_details.outcome');
            context.type = type;
            console.log(type);
            fields.push({ label: 'Report Type', value: type, width: 6 });
            fields.push({ label: 'Outcome', value: outcome, width: 6 });

        }
    }

    return { fields, context };
};
module.exports = {
    getNewestReport, isReportValid, getField, isHouseholdMember, buildAssessmentCard
};