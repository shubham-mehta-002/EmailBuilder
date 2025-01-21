const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate : {
          validator : (value) =>  /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value),
          message:"Invalid email format"
        },
        trim:true
      },
      password: {
        type: String,
        required: true,
        validate : {
          validator : (value) =>  /^(?=.*[A-Z])(?=.*[a-z])(?=.*[!"#$%&'()*+,-.:;<=>?@[\]^_`{|}~]).{8,}$/.test(value),
          message: "Password must include at least one uppercase letter, one lowercase letter, one special character, and be at least 8 characters long."
        },
        trim:true
      },
      fullName: {
        type: String,
        validate : {
          validator : (value) => /^[A-Za-z ]+$/.test(value),
          message: "Enter a valid name"
        },
        trime:true
      },
      templates: [{
        type: Schema.Types.ObjectId,
        ref: 'Template'
      }],
});


const User = mongoose.model('User', userSchema);
module.exports = User