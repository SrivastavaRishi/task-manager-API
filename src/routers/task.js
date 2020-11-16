const express = require('express')
const router = new express.Router()
const auth = require('../middleware/auth')
const Task = require('../models/task')


//Get the tasks for user
// tasks?completed=true   -----> only completed task
//tasks?completed=false   ----->only incompleted task  

//pagination ---> how much data we want to show in one page
//  1) All data in one page
//  2) Provide page numbers on each page --->Eg google
//  3) Auto load more page when we reach at the end of the page ---> Ex instagram

//for pagination we have two options limit and skip
//LIMIT --> limit on how many
//SKIP --> skip page

// /tasks/sortBy=createdAt_asc

router.get('/tasks', auth, async(req, res) => {
   // console.log(owner);
   //console.log(taskOwnerId);
    
    const match = {}

    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    const sort = {}

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try{
        // const tasks =await Task.find({owner : taskOwnerId})
        // res.send(tasks)
        await req.user.populate({
            path : 'tasks',
            match, 
            options : {
                limit : parseInt(req.query.limit), 
                skip : parseInt(req.query.skip), 
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    }catch(e){
        res.status(500).send()
    }

})

router.get('/tasks/:id', auth, async(req, res) => {
    const _id = req.params.id
    try{
        //const task = await Task.findById(_id);
        const task = await Task.findOne({_id, owner : req.user._id})
        if(!task)return res.status(404).send();
        res.send(task);
    }catch(error){
        res.status(501).send()
    }
})

//create task 
router.post('/tasks', auth, async(req, res) => {
    //earlier task was not associated with owner
    //const task = new Task(req.body)

    //now since task is ass. with owner
    const task = new Task({
        ...req.body, 
        owner : req.user._id
    })

    try{
        task.save().then(() => res.send(task))
    }catch(error){
        res.status(404).send()
    }
    
})

router.patch('/tasks/:id', auth,async(req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((item) => {
        return allowedUpdates.includes(item)
    })

    if(!isValidOperation){
        return res.status(404).send('Desired Field not found!')
    }


    const _id = req.params.id;
    try{
        const task = await Task.findOne({_id : req.params.id, owner: req.user._id})
        //const task = await Task.findById(_id)
        
        if(!task)return res.status(404).send()
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    }catch(e){
        res.status(400).send(e) 
    }
})
 

router.delete('/tasks/:id', auth, async(req, res) => {
    try{
        const task = await Task.findOneAndDelete({_id : req.params.id, owner : req.user._id })
        if(!task)return res.status(404).send('User not found')
        res.send(task)
    }catch(e){
        res.status(500).send()
    }
})

module.exports = router