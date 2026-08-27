const requireRole = requiredRole => (req, res, next) => {
	if (!req.user || !req.user.role) {
		return res.status(403).json({ message: 'Role information missing' })
	}
	if (req.user.role !== requiredRole) {
		return res.status(403).json({ message: 'Insufficient permissions' })
	}
	return next()
}

module.exports = requireRole
