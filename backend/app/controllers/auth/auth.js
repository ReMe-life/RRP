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
    var jwt = bytes.toString(CryptoJS.enc.Utf8);
    return jwt;
}
module.exports = _auth;