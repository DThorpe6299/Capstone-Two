const dns = require('dns');

dns.lookup('localhost', (err, address, family) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Address:', address);
    console.log('Family:', family);
  }
});
