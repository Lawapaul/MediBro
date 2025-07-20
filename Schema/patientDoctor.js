const { name } = require('ejs');
const { text } = require('express');
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/MediBro');
}

const patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    email: {
        type: String,
        required: true,
    }
})

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    experience: {
        type: Number,
        required: true,
    },
    specialization: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    }
})
patientSchema.plugin(passportLocalMongoose);
doctorSchema.plugin(passportLocalMongoose);
module.exports.patient = new mongoose.model("patient",patientSchema);
module.exports.doctor = new mongoose.model("doctor",doctorSchema);