const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
    return blogs.length === 0
        ? 0
        : blogs.map(x => x.likes).reduce((a,c) => a+c,0)
}

module.exports = {
  dummy,
  totalLikes
}