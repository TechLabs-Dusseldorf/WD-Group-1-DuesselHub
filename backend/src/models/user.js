import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }, // not necessary but maybe for later
}, { timestamps: true }) // timestamps adds createdAt and updatedAt

// Hash password before saving
userSchema.pre('save', async function() {
    if (!this.isModified('password')) return
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
})

// Compare password method
userSchema.methods.matchPassword = async function(password) {
    return await bcrypt.compare(password, this.password)
}

const User = mongoose.model('User', userSchema)

export default User
