const   CryptoJS = require('crypto-js'),
        config = require("../../../../config")
function encryp(data) {
    return CryptoJS.AES.encrypt(data,config.KEY).toString();
}

function descrypt(data) {
    // Decrypt
    const bytes = CryptoJS.AES.decrypt(data,config.KEY);
    return bytes.toString(CryptoJS.enc.Utf8);;
}

function sumarDias(fecha,dias) {
    fecha.setDate(fecha.getDate()+dias)
    return fecha;
}

module.exports = { encryp, descrypt, sumarDias }