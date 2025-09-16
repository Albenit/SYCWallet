const mongo = require('mongoose')

const user = mongo.Schema({
    address: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true,
    },
    lastLogin: { 
        type: Date 
    },
    loginCount: { 
        type: Number, 
        default: 0 
    },
},{timestamps:true})

module.exports = mongo.model('user',user)