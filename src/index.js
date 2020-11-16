const express = require('express')
require('./db/mongoose')
const User = require('./models/user')
const Task = require('./models/task')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const app = express()
const port = process.env.PORT

// app.use((req, res, next) => {
//     if(req.method ==='GET'){
//         res.send('Get are disabled')
//     }else{
//         next()
//     }
// })

// app.use((req, res, next) => {
//     res.status(503).send('Site is Under maintainance!\n Try again later!')
// })

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

//without middleware === new request -> run route handler
//with middleware === new request -> do something -> run route handler
//eg with middleware --> if the user is not authenciated then run route handler else dont run

// const myfunc = async() => {
//     const token = jwt.sign({ _id : 'abc123'}, 'this is new course', {expiresIn : '3 days'})
//     console.log(token);
//     const data = jwt.verify(token, 'this is new course')
//     console.log(data);
// }

// myfunc()

const multer = require('multer')
const upload = multer({
    dest : 'images', 
    limits : {
        fileSize : 1000000
    }, 
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(doc|docx)$/)){
            return cb(new Error ('Please upload a word doc '))
        }

        cb(undefined, true)

    }
})

// const errorMiddleware = (req, res, next) => {
//     throw new Error('From the middleware')
// }

app.post('/upload',upload.single('upload') , (req, res) => {
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({
        error : error.message 
    })
})


app.listen(port, () => {
    console.log('Server is running on port ' + port);
})

//const User = require('./models/user')
//const Task = require('./models/task')


// const main = async() => {

    // id of task to find user
    // const task = await Task.findById('5fad761848736203c8b19df6')
    // console.log(task);
    // await task.populate('owner').execPopulate()
    // console.log(task.owner); 

    // id of user to find the task
//     const user = await User.findById('5fad745f2f36a333188e4d08')
//     await user.populate('tasks').execPopulate()
//     console.log(user.tasks);
// }

// main()

