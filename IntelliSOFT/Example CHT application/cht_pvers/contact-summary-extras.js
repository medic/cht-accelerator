function getNewestReport(allReports) {
    let result;
    allReports.forEach(function (report) { 
        if (report.forms === 'padr') {
            if (!result || report.reported_date > result.reported_date) {
                result = report;
            }
        }
    });
    return result;
}


const getField = (report, fieldPath) => ['fields', ...(fieldPath || '').split('.')]
    .reduce((prev, fieldName) => {
        if (prev === undefined) { return undefined; }
        return prev[fieldName];
    }, report);

module.exports = {
    getNewestReport, getField
};