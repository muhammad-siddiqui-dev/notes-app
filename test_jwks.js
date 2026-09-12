const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const jwks = require('jwks-rsa');

const {publicKey, privateKey} = crypto.generateKeyPairSync('rsa', {modulusLength: 2048, publicKeyEncoding: {type: 'spki', format: 'pem'}, privateKeyEncoding: {type: 'pkcs8', format: 'pem'}});

// Create token with kid
const token = jwt.sign({ sub: 'test', iss: 'test', aud: 'test' }, privateKey, {algorithm: 'RS256', keyid: 'test-key-1'});

console.log('Token:', token);

// Direct verify (bypassing jwks-rsa)
try {
  const verified = jwt.verify(token, publicKey, {algorithms: ['RS256']});
  console.log('Direct verify OK:', verified.sub);
} catch(e) {
  console.log('Direct verify failed:', e.message);
}

// Now try with jwks-rsa - but we need a real JWKS endpoint
// jwks-rsa.getSigningKey expects an HTTP endpoint, not a data URI
// Let's see what happens if we try to use it with a dummy URL
try {
  // This will likely fail as there's no real JWKS endpoint
  const key = jwks.getSigningKey('test-key-1', 'https://example.com/.well-known/jwks.json', function(err, key) {
    console.log('jwks-rsa result:', err ? err.message : 'key obtained');
  });
  console.log('jwks-rsa call initiated');
} catch(e) {
  console.log('jwks-rsa error:', e.message);
}