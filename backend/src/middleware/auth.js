const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const client = jwksClient({
  jwksUri:
    process.env.ZITADEL_JWKS_URI ||
    `${process.env.ZITADEL_ISSUER}/oauth/v2/keys`,
  cache: true,
  rateLimit: true,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

/**
 * Express middleware that verifies a Bearer JWT issued by ZITADEL.
 * Sets `req.user` to the decoded token payload on success.
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(
    token,
    getKey,
    {
      issuer: process.env.ZITADEL_ISSUER,
      algorithms: ['RS256'],
    },
    (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ error: 'Invalid or expired token', details: err.message });
      }
      req.user = decoded;
      next();
    }
  );
}

module.exports = { verifyToken };
