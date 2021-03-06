const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AccountSchema = new Schema({
    accountNumber:{
        type:String,
        required:true,
        unique: true
    },
    balance:{
        type: Number,
        required:true,
    },
    user: String
});

mongoose.model('Account', AccountSchema);