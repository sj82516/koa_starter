const Router = require('koa-router')
const ratelimit = require('koa-ratelimit')
const Redis = require('ioredis')

const api = require("./api")

const router = new Router()
const auth = new Router()

let highLimiter = ratelimit({
    db: new Redis(),
    duration: 60 * 1000,
    errorMessage: 'Request Too Frequent',
    id: (ctx) => ctx.ip + ":" + ctx.request.path,
    headers: {
        remaining: 'Rate-Limit-Remaining',
        reset: 'Rate-Limit-Reset',
        total: 'Rate-Limit-Total'
    },
    max: 5
})

let lowLimiter = ratelimit({
    db: new Redis(),
    duration: 60 * 1000,
    errorMessage: 'Request Too Frequent',
    id: (ctx) => ctx.ip + ":" + ctx.request.path,
    headers: {
        remaining: 'Rate-Limit-Remaining',
        reset: 'Rate-Limit-Reset',
        total: 'Rate-Limit-Total'
    },
    max: 10
})

auth.post('/login', api.auth.login)
    .get('/logout', api.auth.logout)

router.use('/api/auth', auth.routes())

module.exports = router