import nodemailer from 'nodemailer'

export const sendPersonalEmail = (email, subject, body) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL,
            pass: process.env.PASS
        }
    })

    var mailOptions = {
        from: process.env.MAIL,
        to: email,
        subject: subject,
        html: body
    }

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                reject(error)
            } else {
                resolve(info)
            }
        })
    })
}