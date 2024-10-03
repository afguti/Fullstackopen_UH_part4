const info = (...params) => {
    if (process.env.NODE_ENV !== 'test') {
        console.log(...params)
        print("NODE_ENV:",process.env.NODE_ENV)
    }
  }
  
  const error = (...params) => {
    if (process.env.NODE_ENV !== 'test') {
        console.log(...params)
    }
  }
  
  module.exports = {
    info, error
  }