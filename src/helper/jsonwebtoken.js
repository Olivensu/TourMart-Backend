const jwt = require('jsonwebtoken');

const createJsonWebToken = (payload, secretkey,expiresIn)=>{
    if(typeof payload !== 'object' || !payload){
        throw new Error('Payload must be a non-empty object')
    }
    if(typeof secretkey !== 'string' || secretkey === ''){
        throw new Error('secretkey must be a non-empty string')
    }
    try {
        const token = jwt.sign(payload, secretkey, {expiresIn:expiresIn});
        return token;
    } catch (error) {
        console.error('Failed to sign the jwt:', error);
        throw error;
    }
}

module.exports = {createJsonWebToken};