// javascript

const sgMail = require('@sendgrid/mail')

//const sendGridAPIKey = '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'


sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    const msg = {
        to : email, 
        from : 'srishi0310@gmail.com', 
        subject : 'Welcome to the app', 
        text : `Welcome to the app, ${name}. Let me know how you get along with the app`
    }
    sgMail.send(msg).then(() => {
        console.log('Message sent')
    }).catch((error) => {
        console.log(error.response.body)
        // console.log(error.response.body.errors[0].message)
    })
    
    
}


const sendDeleteEmail = (email, name) => {
    const msg = {
        to : email, 
        from : 'srishi0310@gmail.com', 
        subject : 'Welcome to the app', 
        text : `${name} Can you give your valuable feedback that from where we went wrong?`
    }
    sgMail.send(msg).then(() => {
        console.log('Message sent')
    }).catch((error) => {
        console.log(error.response.body)
        // console.log(error.response.body.errors[0].message)
    })
    
}


module.exports = {
    sendWelcomeEmail, 
    sendDeleteEmail
}





