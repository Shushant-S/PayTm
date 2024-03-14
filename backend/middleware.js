const jwt = require("jsonwebtoken");
const JWT_SECRET = require('./config')

const authMiddleware = (req, res, next) => {
    
    const authHeaders = req.headers.authorization;

    if(!authHeaders || !authHeaders.startsWith('Bearer ')){
        return res.status(403).json({
            message: "token missing"
        });
    }

    const token = authHeaders.split(' ')[1];

    try{    
        const decode = jwt.verify(token, JWT_SECRET);
        req.userId = decode.userId;
        next();
    }
    catch(err){
        return res.status(403).json({
            message: "Invalid Token"
        })
    }
}


module.exports = {authMiddleware}