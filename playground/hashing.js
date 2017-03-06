const bcrypt = require('bcryptjs');
/* 
let password = '123abc';

// Generate the salt - Refer https://www.npmjs.com/package/bcryptjs#usage---async
let salt = bcrypt.genSalt(10, (err, salt) => {
  // Generate the hash using the generated salt
  bcrypt.hash(password, salt, (err, hash) => {
    console.log(hash);
  });
}); // 100 - Number of rounds to use. Default is 10.
*/

let hashedPassword = '$2a$10$q5qMrJG.7VcBVALhaIuneuc0qhPEkJCXc7GyiNCI3S9mNLmBLGZ26';

// Verify the hashed Password
bcrypt.compare('123abc', hashedPassword, (err, res) => {
  console.log(res);
});
/*
  ---- Using the jsonwebtoken library ----
  const jwt = require('jsonwebtoken');

  let token = jwt.sign({id: 4}, 'secretsauce');

  console.log(`Token is: ${token}`);

  let decodedToken = jwt.verify(token, 'secretsauce');

  console.log('Decoded token is: ', decodedToken);
*/

/*
    ---- Using the crypto-js library ----

  const {SHA512} = require('crypto-js');

  let message = 'This is a dummy message';

  let token = SHA512(message);

  console.log(`Message:${message}`);
  console.log(`Token: ${token}`);

  let data = {
   id: 4
  };

  let newToken = {
    data,
    hash: SHA512(JSON.stringify(data) + 'secretsauce').toString()
  };

  data.id = 5;
  let resultHash = SHA512(JSON.stringify(newToken.data) + 'secretsauce').toString();

  if (resultHash === newToken.hash) {
   console.log('The data has not changed');
  } else {
   console.log('Data has been manipulated. Don\'t updated.');
  }
*/
