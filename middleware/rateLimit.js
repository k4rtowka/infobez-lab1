const rateLimit = (maxRequests = 100, windowMs = 60000) => {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (!requests.has(ip)) {
      requests.set(ip, []);
    }

    const ipRequests = requests.get(ip);
    const recentRequests = ipRequests.filter((time) => time > windowStart);

    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({ error: 'Too many requests, please try again later' });
    }

    recentRequests.push(now);
    requests.set(ip, recentRequests);

    next();
  };
};

module.exports = { rateLimit };

