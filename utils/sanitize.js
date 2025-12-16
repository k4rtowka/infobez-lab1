const escapeHtml = require('escape-html');

function sanitizeObject(obj) {
  if (typeof obj === 'string') {
    return escapeHtml(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  if (obj && typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
}

module.exports = {
  sanitizeObject,
};
