module.exports = {
  errorHandle: (ctx, next) => {
    return next().catch((err) => {
      if (err.status === 401) {
        ctx.body = {
          code: 401,
          error: err.originalError ? err.originalError.message : err.message
        }
      } else {
        throw err
      }
    })
  }
}

