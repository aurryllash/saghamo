var cron = require('node-cron');

cron.schedule('*/1 * * * *', () => {
  const now = new Date();
  const expirationTime = new Date(now.getTime() - 5*60*1000)
  console.log(now)
  console.log(expirationTime)
});