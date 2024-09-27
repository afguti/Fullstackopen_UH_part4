const _ = require('lodash')
const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
    return blogs.length === 0
        ? 0
        : blogs.map(x => x.likes).reduce((a,c) => a+c,0)
}

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) {
        return 0
    } else {
        const max_like = Math.max(...blogs.map(x => x.likes))
        const {title,author,likes} = blogs.filter(x => x.likes === max_like)[0]
        return {title,author,likes}
    }
}

const mostBlogs = (blogs) => {
    if (blogs.length === 0) {
        return 0
    } else {
        const countAuthor = _.countBy(blogs,'author')
        const maxAuthor = _.maxBy(_.keys(countAuthor), author => countAuthor[author])
        return {author:maxAuthor,blogs:countAuthor[maxAuthor]}
    }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
}