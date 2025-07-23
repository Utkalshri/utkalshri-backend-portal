export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const userRole = req.user.role;

      if (!userRole) {
        return res.status(403).json({ error: 'Role not found in token.' });
      }

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ error: 'Forbidden: insufficient role.' });
      }

      // ✅ User has allowed role
      next();

    } catch (err) {
      console.error('Role check error:', err);
      res.status(500).json({ error: 'Server error during role check.' });
    }
  };
};
