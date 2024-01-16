const appTaskExtras = require('./app_tasks');
const {chpTasks, chaTasks, dsoTasks} = appTaskExtras;
module.exports = [
    ...chpTasks,
    ...chaTasks,
    ...dsoTasks
];