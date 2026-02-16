import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, { timestamps: true }) // timestamps adds createdAt and updatedAt

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next()
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

// Compare password method
userSchema.methods.matchPassword = async function(password) {
    return await bcrypt.compare(password, this.password)
}

const User = mongoose.model('User', userSchema)

export default User
