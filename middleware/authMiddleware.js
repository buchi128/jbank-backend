const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
	const authHeader = req.headers.authorization || req.headers.Authorization
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ message: 'Missing or invalid authorization header' })
	}

	const token = authHeader.split(' ')[1]
	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret')
		// expected payload to include at least user id and role
		req.user = payload
		return next()
	} catch (error) {
		return res.status(401).json({ message: 'Invalid token', error: error.message })
	}
}

module.exports = authMiddleware
