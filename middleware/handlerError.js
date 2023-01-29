module.exports = (error, request, response, next) => {
  console.log(error)
  if (error.name === 'CastError') {
    response.status(400).json({ error: 'Id use is malformed' })
  } else {
    response.status(500).end()
  }
}
