const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocal = require("passport-local-mongoose");

const UserSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true
    }
});

UserSchema.plugin(passportLocal);

module.exports = mongoose.model("User", UserSchema);