const jwt = require('jsonwebtoken');

let token = jwt.sign({id: 4}, 'secretsauce');


console.log(`Token is: ${token}`);

let decodedToken = jwt.verify(token, 'secretsauce');

console.log('Decoded token is: ', decodedToken);

// const {SHA512} = require('crypto-js');

// let message = 'This is a dummy message';

// let token = SHA512(message);

// console.log(`Message:${message}`);
// console.log(`Token: ${token}`);

// let data = {
//  id: 4
// };

// let newToken = {
//   data,
//   hash: SHA512(JSON.stringify(data) + 'secretsauce').toString()
// };

// data.id = 5;
// let resultHash = SHA512(JSON.stringify(newToken.data) + 'secretsauce').toString();

// if (resultHash === newToken.hash) {
//  console.log('The data has not changed');
// } else {
//  console.log('Data has been manipulated. Don\'t updated.');
// }
