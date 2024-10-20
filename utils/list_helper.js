const _ = require('lodash')
const dummy = () => {
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
    const { title,author,likes } = blogs.filter(x => x.likes === max_like)[0]
    return { title,author,likes }
  }
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) {
    return 0
  } else {
    const countAuthor = _.countBy(blogs,'author')
    const maxAuthor = _.maxBy(_.keys(countAuthor), author => countAuthor[author])
    return { author:maxAuthor,blogs:countAuthor[maxAuthor] }
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) {
    return 0
  } else {
    const perAuthor = _.groupBy(blogs,'author')
    const mostLiked = _.map(perAuthor,(items,author) => ({
      author,
      likes:_.sumBy(items,'likes')
    }))
    return _.maxBy(mostLiked, 'likes')
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}