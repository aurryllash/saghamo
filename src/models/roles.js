const roles = {
    admin: [
        'add_product',
        'delete_product',
        'update_product',
        'read_product',
        'see_users',
        'delete_user',
        'change_user_role',
        'status_change'
    ],
    meneger: [
        'add_product',
        'update_product',
        'read_product'
    ],
    user: [
        'read_product'
    ]
};

module.exports = roles