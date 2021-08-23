"use strict";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
try {
    const client = require('twilio')(accountSid, authToken);

    client.messages
        .create({
            body: 'Hello there!',
            from: '+15555555555',
            mediaUrl: ['https://demo.twilio.com/owl.png'],
            to: '+12316851234'
        })
        .then(message => {
            console.log(message.sid);
        })
        .catch(error => {
            console.log(error);
        })
} catch (e) {
    console.log(e.message);
}