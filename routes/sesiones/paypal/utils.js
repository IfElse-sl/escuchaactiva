const CryptoJS = require('crypto-js');
const dotenv = require("dotenv");
dotenv.config();
function encryp(data) {
    return CryptoJS.AES.encrypt(data, process.env.KEY).toString();
}

function descrypt(data) {
    // Decrypt
    const bytes = CryptoJS.AES.decrypt(data, process.env.KEY);
    return bytes.toString(CryptoJS.enc.Utf8);;
}

function sumarDias(fecha, dias) {
    fecha.setDate(fecha.getDate() + dias)
    return fecha;
}

module.exports = { encryp, descrypt, sumarDias }