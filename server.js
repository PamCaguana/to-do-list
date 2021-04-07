const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient
require('dotenv').config()
const PORT = process.env.PORT

let db, 
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'todo'

MongoClient.connect(dbConnectionStr, {useUnifiedTopology: true})
    .then(client => {
        console.log(`Hey, we're connected to ${dbName} db!`)
        db = client.db(dbName)
    })
    .catch(err => {
        console.log(err)
    })

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/', async (req,res)=>{
    const todoItems = await db.collection('todos').find().toArray()
    const itemsLeft = await db.collection('todos').countDocuments({completed: false})
    res.render('index.ejs', {zebra: todoItems, left: itemsLeft})
    // This beautiful async await code avoids callback hell below:
    // .then(data => {
    //     db.collection('todos').countDocuments({completed: false})
    //     .then(itemsLeft=>{
    //         res.render('index.ejs', {zebra: data, left: itemsLeft})
    //     })
})

app.post('/createTodo', (req,res)=>{
    db.collection('todos').insertOne({todo: req.body.todoItem, completed: false})
    .then(result=>{
        console.log('To Do has been added!')
        res.redirect('/')
    })
})

app.put('/markComplete', (req, res)=>{
    db.collection('todos').updateOne({todo: req.body.rainbowUnicorn}, {
        $set: {
            completed: true
        }
    })
    .then(result=>{
        console.log('Marked Complete')
        res.json('Marked Complete')
    })
})

app.put('/undo', (req, res)=>{
    db.collection('todos').updateOne({todo: req.body.rainbowUnicorn}, {
        $set: {
            completed: false
        }
    })
    .then(result=>{
        console.log('Undo Complete')
        res.json('Undo Complete')
    })
})

//route is named after the fetch request in the js
app.delete('/deleteTodo', (req, res)=>{
    db.collection('todos').deleteOne({todo: req.body.rainbowUnicorn})
    .then(result=>{
        console.log('Deleted Todo')
        res.json('Deleted It')
    })
    .catch( err=> {
        console.log(err)
    })
})

app.listen(process.env.PORT || PORT, ()=> {
    console.log('Server is running!')
})