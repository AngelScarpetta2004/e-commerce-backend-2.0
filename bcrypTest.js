// const bcrypt = require("bcryptjs");

// async function test() {
//   const password = "123456";
  
//   // Hashear contraseña
//   const salt = await bcrypt.genSalt(10);
//   const hashedPassword = await bcrypt.hash(password, salt);
  
//   console.log("Contraseña original:", password);
//   console.log("Contraseña hasheada:", hashedPassword);
  
//   // Comparar
//   const isMatch = await bcrypt.compare(password, hashedPassword);
//   console.log("¿La contraseña coincide?:", isMatch);
// }

// test();

// const bcrypt = require("bcryptjs");

// async function test() {
//   const password = "123456";
//   const hash = "$2b$10$wGuTwn4CUZAdOMjq/g1queNdT6Qqc2fQlRjiogC.bhgZOSMc8./.e";
//   const match = await bcrypt.compare(password, hash);
//   console.log("¿Coincide contraseña con hash?", match);
// }

// test();

// const bcrypt = require('bcryptjs');

// const password = '123456'; // contraseña "raw" que usas para login
// const hash = '$2b$10$t6WMN3HwWrDJqF8oYTXL6eXi8XI7tRAebwG.vV2xExMIB7x5ULUs6'; // hash de la DB

// bcrypt.compare(password, hash, (err, res) => {
//   if(err) {
//     console.error('Error bcrypt:', err);
//   } else {
//     console.log('¿Coincide contraseña con hash?', res);
//   }
// });

const bcrypt = require("bcryptjs");

async function testPassword() {
  const password = "123456"; // contraseña que usas en el registro
  console.log("Password plano para registro:", password);

  // Simular registro: generar hash
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  console.log("Hash generado (registro):", hashedPassword);

  // Simular login: comparar password plano con hash
  const isMatch = await bcrypt.compare(password, hashedPassword);
  console.log("¿Coincide contraseña con hash? (login simulado):", isMatch);

  // Ahora prueba con el hash que tienes guardado en DB para el usuario
  const storedHash = "$2b$10$t6WMN3HwWrDJqF8oYTXL6eXi8XI7tRAebwG.vV2xExMIB7x5ULUs6";
  const isMatchWithStored = await bcrypt.compare(password, storedHash);
  console.log("¿Coincide con hash guardado en DB?:", isMatchWithStored);
}

testPassword();





