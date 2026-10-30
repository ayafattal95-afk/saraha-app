import {cacheProvider} from "../cache/init.js";

export function idempotency(ttl = 3600) {
    return async function (req, res, next) {
        const idempotency = req.headers['idempotency-key'];
        let key = `${req.method}:${req.originalUrl}:${idempotency}`; // POST:/pay:24615367846529763
        const cached = await cacheProvider.get(key);
        if (cached) {
            res.setHeader('X-Cache', 'HIT');
            return res.json(JSON.parse(cached));
        }
        const originalJson = res.json.bind(res);

        res.json = (body) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                res.setHeader('X-Cache', 'MISS');

                cacheProvider.set(key, JSON.stringify(body), ttl)
                    .catch(console.error);
            }
            return originalJson(body);
        };
        next();
    }
}