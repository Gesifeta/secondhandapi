
const verifyToken = require('../auth/authRoutes')

const isAuthenticated = (req, res, next) => {
    const authHeader = req.headers['authorization']
    if (!authHeader) {
        return res.status(403).json({
            message: 'You are not logged in'
        })
    }
    if (authHeader.split(' ')[1]) {
        const token = authHeader.split(' ')[1]
        const decoded = verifyToken(token)
        if (decoded) {
            req.user = decoded
            next()
        }
        return res.status(403).json({ message: 'You are not authorized' })
    }
    return res.status(403).json({ message: 'You are not authorized' })

}
module.exports = isAuthenticated