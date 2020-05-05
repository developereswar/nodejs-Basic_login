const jwt = require('jsonwebtoken')
const config = require('./config')

module.exports = (req,res,next) => {
  const token = req.body.token || req.query.token || req.headers['authorization']
  // decode token
  if (token) {
    // verifies secret and checks exp
    jwt.verify(token, config.RefreshToken, function(err, decoded) {
        if (err) {
            return res.status(401).json({"error": true, "message": 'Unauthorized access.' });
        }
     
      next(decoded);
    });
  } else {
    // if there is no token
    // return an error
    return res.status(403).send({
        "error": true,
        "message": 'No token provided.'
    });
  }
}