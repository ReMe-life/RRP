const _auth = {};
const jwt = require("jsonwebtoken");
var path = require('path');
var CryptoJS = require("crypto-js");
const fs = require('fs');

_auth.authenticate = async (req, res, next) => {
    let token = await getToken(req);
    var cert = fs.readFileSync(path.resolve('app/controllers/referral/public.pem'))  // get public key
    jwt.verify(token, cert, { algorithms: ['RS512'] }, function (err, payload) {
        if (err) {
            res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }
        else {
            next();
        }
    });
};

const getToken = async function (req) {
    if (
        req.headers.authorization
    ) {
        return await getJwt(req.headers.authorization)
    }
    return null;
};

const getJwt = async (token) => {
    token = decodeURIComponent(token);
    var bytes = CryptoJS.AES.decrypt(token, process.env.SECRET_KEY);
    var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData.token;

    // // token = decodeURIComponent(token);
    // // var bytes = CryptoJS.AES.decrypt(token, process.env.SECRET_KEY);
    // // var jwt = bytes.toString(CryptoJS.enc.Utf8);
    // return 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzUxMiJ9.eyJleHAiOjE2MTk2NTI5MDcsImlkIjoiZDNlNTNkNmMtNTZiMi00YTU3LThkMDktZjM1NGI1OWEwNTMwIiwiZmlyc3RfbmFtZSI6ImFtaXQiLCJsYXN0X25hbWUiOiJzYWluaSIsImVtYWlsIjoiYW1pdC5zYWluaUBhbnRpZXJzb2x1dGlvbnMuY29tIn0.LCc-X19ZcA8VdH9r9jaH4lH8Dnv5TjI3XzweueGWu15LYse-oDJlyCVkWBJ_twfaVQicnXlnVd0HwA9-ronWm2wQxu6nKwTF2ujrfnbu4QBlIo383XzlAT_ldtP9n7SHktyazBjqvfMWxu-M6bVnQZltnhzIRCOHaxcvfR8JysnIimjARrA5EGpHtcMasQQlUbikjpJed2-6De6X7x26-RNiriV3393UlLkkA1ig4kX8Oi3MpN0C06esrTnHzGP2xEjOD5AMr7f1Mmv1-lZ-u8H10F5m09CVWqM1-hfZ0fFxQ078k2IBstXqwd1toBrDlC0c_IOIjnL1FpXF76Hwno4TzxsPgnIRh3V5vnQj8ghRVfMKJH788JN3OtP8ac3337zMRuKfW16aBgqS6KTL4MQopjECed3bT314HZSj4w7xfczQc-22NrxHbPbqfhH864qIIb15Tr2DXlJnxbhR2R1fO-ZmV6hsR0_CZGEkoUdN-bhQdG7PVaR8_HaFcnEAKCWHH4EbKZou3GileMKbH1epXNeXjrPIvl3HVyotnQIhuCVbwmxxb1uh2yc9ARz3IO1mvDxFe_i4mqBVf3N2ZP9D4r8cSqX2C5s-OSu8YBmZTqQV9j80WrrRMCISHDvHTSUX8ublTDsyrNzqB1AsnHAMbZ9mWAxN9GN1sJedx24';

}
module.exports = _auth;