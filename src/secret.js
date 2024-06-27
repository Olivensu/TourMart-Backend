require("dotenv").config();

const serverPort = process.env.PORT || 5000
const mongoDBURL = process.env.MONGODB_CONNECT
const defaultImgURL = process.env.DEFAULT_IMAGE_PATH || '/public/image/users/tasbiul-pic.jpg'
const activationKey = process.env.JWT_ACTIVATION_KEY || 'GAGWAGWRBGHAEHEHAE@_$%NSNRNS'
const accessKey = process.env.JWT_ACCESS_KEY || 'GAGWAGWRBGHAESRFJSDJSJSRJ@_$%NSRJSRJ'
const refreshKey = process.env.JWT_REFRESH_KEY || 'GAGWAGWRBGHAESRFJSDJSJSRJ@_$%NSRJSRJ'
const resetPasswordKey = process.env.JWT_RESET_PASSWORD_KEY || 'GAGWAGWRBGHAESRFJSDJSJSRESET_PASSWORD_KEY'
const smtpUsername = process.env.SMTP_USERNAME || '';
const smtpPassword = process.env.SMTP_PASSWORD || '';
const clientUrl = process.env.CLIENT_URL || '';
const uploadFile = process.env.UPLOAD_FILE || 'public/image/users';
const maxFileSize = process.env.MAX_FILE_SIZE || 5097152;
const allowedFileTypes = process.env.ALLOWED_FILE_TYPE || ['jpg', 'jpeg', 'png',];

module.exports ={serverPort,mongoDBURL,defaultImgURL,resetPasswordKey,refreshKey,activationKey,accessKey,smtpUsername,smtpPassword,clientUrl,uploadFile, maxFileSize,allowedFileTypes}