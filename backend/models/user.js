const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
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

module.exports = mongoose.models.User || mongoose.model("User", userSchema);