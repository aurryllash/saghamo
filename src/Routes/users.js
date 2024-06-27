const express = require('express');
const router = express.Router()
const { requirePermits } = require('../middleware/RoleSecurity');
const { get_all_users, delete_user, change_user_role } = require('../Controllers/users')

router.get('/', requirePermits('see_users'), get_all_users)
router.delete('/delete/:id', requirePermits('delete_user'), delete_user)
router.put('/role/:id', requirePermits('change_user_role'), change_user_role) 

module.exports = router