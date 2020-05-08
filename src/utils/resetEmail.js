
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.GMAIL,
		pass: process.env.GMAIL_PASSWORD,
	},
});

const sendResetEmail = (to, resetToken) =>
	transporter.sendMail(
		{
			from: process.env.GMAIL,
			to,
			subject: "Password Reset Token!",
			html: `<h2>This is your password reset token</h2>
                <p><b>${resetToken}</b> <br /> Please note that the token expires in one hour.</p>
          `,
		},
		function (err, info) {
			if (err) console.log(err);
			else console.log(info);
		}
	);

module.exports = sendResetEmail;