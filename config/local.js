module.exports = {
    port: "3000",

    session: {
        redis: {
            host: 'localhost',
            port: 6379,
            //ttl: 30 * 24 * 60 * 60 * 1000,
            db: 12,
            pass: '',
            prefix: 'starter:'
        }
    },
}