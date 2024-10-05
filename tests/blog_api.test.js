const { test, after, beforeEach } = require('node:test')
const Blog = require('../models/blog')
const mongoose = require('mongoose')
const supertest = require('supertest')
const assert = require('node:assert')
const app = require('../app')

const api = supertest(app)

const initialBlogs = [
    {
        title: 'Blog number one',
        author: "angel",
        url: "http://sample1.com",
        likes: 4
    },
    {
        title: 'Blog number two',
        author: "gutierrez",
        url: "http://sample2.com",
        likes: 8
    }
]

beforeEach(async () => {
    await Blog.deleteMany({})
    const blogObjects = initialBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
})

test('notes are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there are two blogs', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, initialBlogs.length)
})

test('identifier property of the blog posts is named id', async () => {
    const response = await api.get('/api/blogs')
    const identify = response.body.map(x => x.id)
    assert.strictEqual(identify.length, initialBlogs.length)
})

test('a valid note can be added', async () => {
    const newBlog = {
        title: 'Blog number three',
        author: 'lliulli',
        url: "http://sample3.com",
        likes: 16
    }
    await api.post('/api/blogs')
        .send(newBlog).expect(201).expect('Content-type', /application\/json/)
    
    const blogsAtEnd = await api.get('/api/blogs')
    assert.strictEqual(blogsAtEnd.body.length,initialBlogs.length+1)

    const titles = blogsAtEnd.body.map(x => x.title)
    assert(titles.includes('Blog number three'))
})

test.only('Blog without likes is by default 0', async () => {
    const newBlog = {
        title: 'Without likes',
        author: 'error checker',
        url: "http://nolikes.com",
    }

    await api.post('/api/blogs')
        .send(newBlog).expect(201)
    
    const blogsAtEnd = await api.get('/api/blogs')
    assert.strictEqual(blogsAtEnd.body[initialBlogs.length].likes,0)
})

after(async () => {
  await mongoose.connection.close()
})