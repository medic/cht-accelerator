const { chpTasks, chaTasks, dsoTasks } = require('./app_tasks');
module.exports = [...chpTasks, ...chaTasks, ...dsoTasks];
