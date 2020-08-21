import { UserModel, USER_ROLE_ENUM } from "../models/user.model"
import { hash, hashSync } from "bcrypt"

export const SeedSuperadmin = () => {
    const userData = {
        name: "Admin 1",
        location: "Uk",
        email: "super_admin@mail.com",
        password: hashSync("5ct0cz", 8),
        mobileNumber: "0",
        age: "18",
        role: USER_ROLE_ENUM.SUPER_ADMIN,
        profilePic: "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"
    }
    return UserModel.findOrCreate({
        where: { email: 'super_admin@mail.com'},
        defaults: userData
    })
}