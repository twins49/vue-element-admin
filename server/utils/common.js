module.exports = {
  errorHandle: (ctx, err) => {
    const resultObj = {
      code: 500,
      message: err
    }
    ctx.log.error(err)
    return resultObj
  }
}
