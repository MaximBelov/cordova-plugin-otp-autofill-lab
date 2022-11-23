const client = require('twilio');
require('dotenv').config({path: '../.env'});

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const clientTo = process.env.TWILIO_CLIENT_TO;
const clientFrom = process.env.TWILIO_CLIENT_FROM;
const clientBody = `Code: 1234 \n\n ${process.env.TWILIO_CLIENT_ANDROID_HASH}`;

client(accountSid, authToken).messages
  .create({
    from: clientFrom,
    to: clientTo,
    body: clientBody
  })
  .then(message => console.log(message))
  .done();
