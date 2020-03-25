const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const exphbs = require('express-handlebars');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();

// View engine setup
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// Static folder
app.use('/public', express.static(path.join(__dirname, 'public')));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// parse application/json
app.use(bodyParser.json());

app.set('port', process.env.PORT || 8080);

// Main route
app.get('/', function (req, res) {
    res.render('homepage');
});
app.get('/aboutus', function (req, res) {
    res.render('aboutus');
});
app.get('/services', function (req, res) {
    res.render('services');
});
app.get('/contactus', function (req, res) {
    res.render('contactus');
});
app.get('/blog', function (req, res) {
    res.render('blog');
});
app.get('/casestudies', function (req, res) {
    res.render('casestudies');
});
app.get('/casestudy', function (req, res) {
    res.render('casestudydetails');
});

// Contact route
app.post('/send', (req, res) => {

    if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
        res.status(400).json({"responseCode" : 0,"responseDesc" : "danger","msg":"Please select captcha!"});
    }

    // Put your secret key here.
    var secretKey = "6LeL9toUAAAAAKE-6uPm86DDtTxwXC7wGwpOPOK7";

    // req.connection.remoteAddress will provide IP address of connected user.
    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
     
    // Hitting GET request to the URL, Google will respond with success or error scenario.
    request(verificationUrl,function(error,response,body) {

        body = JSON.parse(body);

        // Success will be true or false depending upon captcha validation.
        if(body.success !== undefined && !body.success) {
            res.status(400).json({"responseCode" : 0,"responseDesc" : "danger","msg":"Failed captcha verification!"});
        }

        // This will sent to your email
        const output = `
        <p>you have a new email from contact form</p>
        <h3>Contact details</h3>
        <ul>
            <li>Name : ${req.body.name}</li>
            <li>Email : ${req.body.email}</li>
        <h3>Message :</h3>
        <p> ${req.body.comment}</p>
        `;

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'monmonmoemyint.mhs@gmail.com',
                pass: 'mhsofficepwd123***'
            }
        });

        // setup email data with unicode symbols
        // I have remove my account information, obviously you should put your credentials
        let mailOptions = {
            from: 'monmonmoemyint.mhs@gmail.com', // sender address
            to: 'monmonmoemyint.mm@gmail.com', // list of receivers
            subject: 'Contact form', // Subject line
            // text: 'Hello', // plain text body
            html: output // html body
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            res.status(200).json({"responseCode" : 1,"responseDesc" : "success","msg":"Email has been sent."})
            // res.render('contactus', {
            //     msg: 'Email has been sent.'
            // })
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
        });
    });

});

app.listen(8080, () => console.log('I am listening on http://localhost:8080...'));
//app.listen(3000,'192.168.1.105', () => console.log('I am listening on http://192.168.1.105:3000...'));
