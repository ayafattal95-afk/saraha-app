import {cacheProvider} from "./init.js";

// get data products >> 200
// cache register

export function cacheRatelimit(ttl = 180) {
    return async (req, res, next) => {
        // request
        // method + url
        // "GET:/products" :"[{},{},{},...]"
        let key = `${req.originalUrl}:${req.user.id}`;
        const cached = await cacheProvider.get(key);
        if (cached) {
            res.setHeader('X-Cache', "HTT");
            return res.json(JSON.parse(cached));
        }
        // interceptor
        // res.json(body) >> send client response
        // res.json(body) >> cache + send client response
        // get deep copy from implementation res.json before modify
        const originalJson = res.json.bind(res);
        // res.json() >> res() >> originalJson(body);

        res.json = (async (body) => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                // 1. cache body >> "{message:"",success:true,data:[{},{}]}"
                await cacheProvider.set(key, JSON.stringify(body), ttl);
                // 2. send response
                res.setHeader('X-Cache', "MISS");
            }
            return originalJson(body); // cache + res.json >> cache +res.json >>
        });

        next();
    }
}