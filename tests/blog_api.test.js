const { test, after, beforeEach, describe } = require('node:test')
const bcrypt = require('bcrypt')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')
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

test('Blog without likes is by default 0', async () => {
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

test('if title or url is missing we get a bad request', async () => {
    const newBlog = {
        author: 'error checker',
        likes: 1
    }

    await api.post('/api/blogs')
        .send(newBlog).expect(400)

    const blogsAtEnd = await api.get('/api/blogs')
    assert.strictEqual(blogsAtEnd.body.length,initialBlogs.length)
})

describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
        const blogsAtStart = await api.get('/api/blogs')
        const blogToDelete = blogsAtStart.body[0]

        await api
            .delete(`/api/blogs/${blogToDelete.id}`).expect(204)

        const blogsAtEnd = await api.get('/api/blogs')
        assert.strictEqual(blogsAtEnd.body.length,initialBlogs.length-1)

        const titles = blogsAtEnd.body.map(x => x.title)
        assert(!titles.includes(blogToDelete.titles))
    })
})

test('Succeeds updates number of likes of existing blog', async () => {
    const blogsAtStart = await api.get('/api/blogs')
    const blogToUpdate = blogsAtStart.body[0]

    const updatedBlog = { ...blogToUpdate, likes: blogToUpdate.likes + 1 }

    const response = await api
        .put(`/api/blogs/${blogToUpdate.id}`)
        .send(updatedBlog)
        .expect(200)

    assert.strictEqual(response.body.likes, blogToUpdate.likes + 1)

    const blogsAtEnd = await api.get('/api/blogs')
    const updatedBlogFromDB = blogsAtEnd.body.find(blog => blog.id === blogToUpdate.id)

    assert.strictEqual(updatedBlogFromDB.likes, blogToUpdate.likes + 1)
})

describe('when there is initially one user in db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret',10)
        const user = new User({ username: 'root', passwordHash })
        await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
        const userAtStart = await helper.usersInDb()

        const newUser = {
            username: 'Angel',
            name: 'Angel Gutierrez',
            password: 'secreto',
        }

        await api.post('/api/users').send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        
        const userAtEnd = await helper.usersInDb()
        assert.strictEqual(userAtEnd.length, userAtStart.length+1)

        const usernames = userAtEnd.map(x => x.username)
        assert(usernames.includes(newUser.username))
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {
        const userAtStart = await helper.usersInDb()

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: "salainen",
        }
        
        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const userAtEnd  = await helper.usersInDb()
        assert(result.body.error.includes('expected `username` to be unique'))
        assert.strictEqual(userAtEnd.length, userAtStart.length)
    })

    test('creation fails with proper statuscode and message if username is not provided', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            name: "Angel",
            password: "secreto"
        }

        const result = await api.post('/api/users')
            .send(newUser).expect(400)
            .expect('Content-Type', /application\/json/)
        
        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('Path `username` is required'))
        assert.strictEqual(usersAtStart.length, usersAtEnd.length)
    })

    test('creation fails with proper statuscode and message if password is not provided', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: "Angel Gutierrez",
            name: "Angel"
        }

        const result = await api.post('/api/users')
            .send(newUser).expect(400)
            .expect('Content-Type', /application\/json/)
        
        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('Pasword must be at least 3 characters long'))
        assert.strictEqual(usersAtStart.length, usersAtEnd.length)
    })

    test('creation fails with proper statuscode and message if provided username has less than 3 characters', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: "An",
            name: "Angel",
            password: "secreto"
        }

        const result = await api.post('/api/users')
            .send(newUser).expect(400)
            .expect('Content-Type', /application\/json/)
        
        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('Path `username` (`An`) is shorter than the minimum allowed length (3)'))
        assert.strictEqual(usersAtStart.length, usersAtEnd.length)
    })

    test('creation fails with proper statuscode and message if provided password has less than 3 characters', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: "Angel Gutierrez",
            name: "Angel",
            password: "se"
        }

        const result = await api.post('/api/users')
            .send(newUser).expect(400)
            .expect('Content-Type', /application\/json/)
        
        const usersAtEnd = await helper.usersInDb()
        assert(result.body.error.includes('Pasword must be at least 3 characters long'))
        assert.strictEqual(usersAtStart.length, usersAtEnd.length)
    })
})

after(async () => {
  await mongoose.connection.close()
})