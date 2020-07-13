const axios = require('axios');
const moment = require('moment');
const pipedrive_api_token = 'acfe6ae9fba531497907015cef4a824d7a4ff320';

api_call = async (start_date, end_date) => {
  const request = await axios.get(
    `https://api.pipedrive.com/v1/deals?status=won&start=0&api_token=${pipedrive_api_token}`
  );
  // if there are some won deals
  if (request.data.data) {
    // Keeping from objects only 4 keys
    const allowed = ['won_time', 'value', 'currency', 'org_name'];
    const table = request.data.data.map(data =>
      Object.keys(data)
        .filter(key => allowed.includes(key))
        .reduce((obj, key) => {
          obj[key] = data[key];
          return obj;
        }, {})
    );
    // Transforming format of dates
    const tableFormatted = table.filter(
      data => (data.won_time = moment(data.won_time).format('YYYY-MM-DD'))
    );
    // Keeping only deals between start_date and end_date
    const tableFiltered = tableFormatted.filter(
      data => data.won_time >= start_date && data.won_time <= end_date
    );
    // Compute total deals value, converting USD into EUR at rate 1.15
    let totalDealsValue = 0;
    for (let i = 0; i < tableFiltered.length; i++) {
      if ((tableFiltered[i].currency = 'USD')) {
        totalDealsValue += tableFiltered[i].value * 1.15;
      } else {
        totalDealsValue += tableFiltered[i].value;
      }
    }
    console.log('Total won deals over time period : ', tableFiltered.length);
    console.log('Total deal value :', Math.round(totalDealsValue, 0), 'EUR');
  } else {
    console.log('No deals won at all');
  }
};

// 1st argument : start_date, 2nd argument: end_date (format YYYY-MM-DD)
api_call('2020-01-01', '2020-07-13');
