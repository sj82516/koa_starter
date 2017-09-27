const path = require('path')
const Koa = require('koa')
const redisStore = require('koa-redis')
const session = require('koa-session')
const views = require("koa-views")
const bodyParser = require('koa-bodyparser')
const morgan = require('koa-morgan')
const helmet = require('koa-helmet')
const cors = require('koa-cors')
const axios = require('axios')
const moment = require('moment')
const multer = require('koa-multer')
const format = 'AAAaaacchhhcc'
const crypto = require("crypto")
const zen_id = require('zen-id').create(format)

const local = require("./config/local")

var storageHostLogo = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './static/uploads/host_logo')
    },
    filename: function (req, file, cb) {
        cb(null, zen_id.generate() + "-"+file.originalname)
    }
})

const uploadHostLogo = multer({ storage: storageHostLogo })


const router = require("./router")

const app = new Koa()
const host = '127.0.0.1'
const port = local.port
const store = redisStore(local.session)

app.keys = ['secret', 'key']

const CONFIG = {
    key: 'koa:sess',
    /** (string) cookie key (default is koa:sess) */
    /** (number || 'session') maxAge in ms (default is 1 days) */
    /** 'session' will result in a cookie that expires when session/browser is closed */
    /** Warning: If a session cookie is stolen, this cookie will never expire */
    maxAge: 86400000,
    overwrite: true,
    /** (boolean) can overwrite or not (default true) */
    httpOnly: true,
    /** (boolean) httpOnly or not (default true) */
    signed: true,
    /** (boolean) signed or not (default true) */
    rolling: false,
    /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. default is false **/
    store: store
};

// Start nuxt.js
async function start() {
    // 本地會用自簽憑證，需要關閉警告
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

    try {

        // Build in development
        if (process.env.NODE_ENV !== 'production') {
            try {
                app.use(morgan('short'))
            } catch (e) {
                console.error(e) // eslint-disable-line no-console
                process.exit(1)
            }
        }

        // bodyparser
        app.use(bodyParser())
        app.use(async(ctx, next) => {
            ctx.body = ctx.request.body
            await next()
        })

        // 戴上安全帽
        app.use(helmet({
            frameguard: false,
            noSniff: false,
        }))

        // cors
        app.use(cors())

        // session
        app.use(session(CONFIG, app))
        app.use(async(ctx, next) => {
            ctx.req.session = ctx.session
            await next()
        })

        // 處理上傳路徑
        // router.post('/api/uploads/host-logo', uploadHostLogo.single('host_logo'), (ctx) => {
        //     "use strict";
        //     console.log(ctx.req.file)
        //     return ctx.body ={
        //         data: ctx.req.file.filename
        //     }
        // })

        app.use(router.routes())

        app.listen(port, host)
    } catch (err) {
        console.error(err)
    }
}

start()