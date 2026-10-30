import {User} from '../model/user.model.js';

export async function updateUserByEmail (email, updatedData) {
    return User.findOneAndUpdate(
        {email: email},  // filter
        updatedData,  // updated data
        {returnDocument: 'after'},  // options
    );
}

export async function findUSerById (id) {
    return User.findOne({_id: id, isDeleted: false}, {password:0},{})
}

export async function banUser(userId) {
    return User.findByIdAndUpdate(
        userId,
        {isBanned: true},
        {returnDocument: 'after'}
    );
}