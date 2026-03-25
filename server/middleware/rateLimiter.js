const rateLimit = new Map();

function rateLimiter({ windowMs = 60000, max = 100 } = {}) {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();

    if (!rateLimit.has(key)) {
      rateLimit.set(key, { count: 1, start: now });
      return next();
    }

    const record = rateLimit.get(key);

    if (now - record.start > windowMs) {
      rateLimit.set(key, { count: 1, start: now });
      return next();
    }

    if (record.count >= max) {
      return res.status(429).json({ error: 'Too many requests, please try again later' });
    }

    record.count++;
    next();
  };
}

module.exports = rateLimiter;
