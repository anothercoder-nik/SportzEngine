// import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/node";

// const arcjetKey = process.env.ARCJET_KEY;

// const arcjetMode = process.env.ARCJET_MODE === 'DRY_RUN' ? 'DRY_RUN' : 'LIVE';

// if (!arcjetKey) {
//     throw new Error("ARCJET_KEY is not defined");
// }

// export const httpArcjet = arcjetKey ?
//     arcjet({
//         key: arcjetKey,
//         rules: [
//             shield({ mode: arcjetMode }),
//             detectBot({ mode: arcjetMode, allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW'] }),
//             slidingWindow({
//                 mode: arcjetMode,
//                 name: 'rate-limit-100-per-minute',
//                 interval: '10s',
//                 max: 50,
//             })
//         ]
//     }) : null;

// export const wsArcjet = arcjetKey ?
//     arcjet({
//         key: arcjetKey,
//         rules: [
//             shield({ mode: arcjetMode }),
//             detectBot({ mode: arcjetMode, allow: ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW'] }),
//             slidingWindow({
//                 mode: arcjetMode,
//                 name: 'rate-limit-100-per-minute',
//                 interval: '2s',
//                 max: 5,
//             })
//         ]
//     }) : null;

// export function securityMiddleware() {
//     return async (req, res, next) => {
//         if (!httpArcjet) return next();

//         try {
//             const decision = await httpArcjet.protect(req);

//             if (decision.isDenied()) {
//                 console.log("Denied:", decision.reason);
//                 if (decision.reason.isRateLimit()) {
//                     return res.status(429).json({ error: "Rate Limit exceeded" });
//                 }
//                 return res.status(403).json({ error: "Forbidden" });
//             }

//             return next();
//         } catch (e) {
//             console.error("Arcjet Error:", e);
//             return res.status(503).json({ error: "Service Unavailable" });
//         }
//     };
// }

////////////////////////////////////////////////////////////////////////////////

import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/node";

const arcjetKey = process.env.ARCJET_KEY;
const arcjetMode =
    process.env.ARCJET_MODE === "DRY_RUN" ? "DRY_RUN" : "LIVE";

if (!arcjetKey) {
    throw new Error("ARCJET_KEY is not defined");
}

const isDevelopment = true;


/*
  Development:
    - Only sliding window (rate limiting)
    - No shield
    - No bot detection

  Production:
    - Full protection stack
*/

const httpRateLimitRule = slidingWindow({
    mode: arcjetMode,
    name: "rate-limit-50-per-10s",
    interval: "10s",
    max: 50,
});

const wsRateLimitRule = slidingWindow({
    mode: arcjetMode,
    name: "ws-rate-limit-5-per-2s",
    interval: "2s",
    max: 5,
});

const productionHttpRules = [
    shield({ mode: arcjetMode }),
    detectBot({
        mode: arcjetMode,
        allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
    }),
    httpRateLimitRule,
];

const developmentHttpRules = [
    httpRateLimitRule,
];

const productionWsRules = [
    shield({ mode: arcjetMode }),
    detectBot({
        mode: arcjetMode,
        allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
    }),
    wsRateLimitRule,
];

const developmentWsRules = [
    wsRateLimitRule,
];

export const httpArcjet = arcjet({
    key: arcjetKey,
    rules: isDevelopment ? developmentHttpRules : productionHttpRules,
});

export const wsArcjet = arcjet({
    key: arcjetKey,
    rules: isDevelopment ? developmentWsRules : productionWsRules,
});

export function securityMiddleware() {
    return async (req, res, next) => {
        try {
            const decision = await httpArcjet.protect(req);

            if (decision.isDenied()) {
                console.log("Denied:", decision.reason);

                if (decision.reason.isRateLimit()) {
                    return res.status(429).json({ error: "Rate Limit exceeded" });
                }

                return res.status(403).json({ error: "Forbidden" });
            }

            return next();
        } catch (e) {
            console.error("Arcjet Error:", e);
            return res.status(503).json({ error: "Service Unavailable" });
        }
    };
}