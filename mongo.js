require('dotenv').config()
const mongoose = require('mongoose')

const url = process.env.TEST_MONGODB_URI

console.log('The URI:',url)

mongoose.set('strictQuery',false)

mongoose.connect(url)

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number,
})

const Blog = mongoose.model('Blog', blogSchema)

const blog = new Blog({
  title: 'Adding from mongo.js',
  author: "angel",
  url: "http://sample.com",
  likes: 4
})

//blog.save().then(() => {
//  console.log('note saved!')
//  mongoose.connection.close()
//})



Blog.find({}).then(result => {
    result.forEach(note => {
        console.log("note:",note)
    })
    mongoose.connection.close()
})