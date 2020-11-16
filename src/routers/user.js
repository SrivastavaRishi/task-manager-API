const express = require('express')
const multer = require('multer')
const sharp  = require('sharp')

const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const {sendWelcomeEmail, sendDeleteEmail} = require('../emails/accounts')

router.get('/users/me', auth, async(req, res) => {
    res.send(req.user)
})

//dont need below as we have the above code for profile 
// router.get('/users/:id', async(req, res) => {
//     const _id = req.params.id

//     try{
//         const user = await User.findById(_id)
//         if(!user)return res.status(404).send()
//         res.send(user)
//     }catch(e){
//         res.status(500).send()
//     }
 
// })

//sign up
router.post('/users', async(req, res) => {
    const user = new User(req.body) 

    try{
        await user.save()
        //sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user, token})
    }catch(e){
        res.status(400).send(e)  
    }

})

router.patch('/users/me', auth, async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'age', 'email', 'password']
    const isValidOperation = updates.every((item) => {
        return allowedUpdates.includes(item)
    })

    if(!isValidOperation){
        return res.status(404).send('Desired Field not found!')
    }


    // const _id = req.params.id;
    try{
        //console.log(req.user._id);
        //const user = await User.findByIdAndUpdate(req.user._id)
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        //if(!user)return res.status(404).send()
        res.send(req.user)
    }catch(e){
        res.status(400).send(e) 
    }
})

router.delete('/users/me', auth, async(req, res) => {
    try{
        // const user = await User.findByIdAndDelete(req.user._id)
        // if(!user)return res.status(404).send('User not found')
        // res.send(user)
        await req.user.remove()
        sendDeleteEmail(req.user.email, req.user.name)
        res.send(req.user)
    }catch(e){  
        res.status(500).send()
    }
})

//login page
router.post('/users/login', async(req, res) => {
    try{   
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    }catch(error){
        res.status(400).send(error)
    }
})

//logout
router.post('/users/logout', auth, async(req, res) => {
    try{
        console.log(req.user.tokens);
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send('done!!')
    }catch(error){
        res.status(500).send(error)
        console.log(error);
    }
})

//logout of all sessions

router.post('/users/logoutAll', auth, async(req, res) => {
    try{
        req.user.tokens = []
        await req.user.save()
        res.send('done!!')
    }catch(error){
        res.status(501).send(error)
    }
})


const upload = multer({ 
    limits : {
        fileSize : 1000000
    }, 
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(png|jpeg|jpg)$/)){
            return cb(new Error('Please Upload a png/jpg/jpeg file'))
        }
        cb(undefined, true)
    }
})

// const errorMiddleware = (req, res, next) => {
//     throw new Error('From the middleware')
// }

router.post('/users/me/avatar',auth, upload.single('avatar') , async(req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    //res.status(400).send('This one')
    res.status(400).send({
        error : error.message 
    })
})

router.delete('/users/me/avatar', auth, async(req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async(req, res) => {
    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar)throw new Error()

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)

    }
    catch(e){
        res.status(404).send()
    }
})

module.exports = router
