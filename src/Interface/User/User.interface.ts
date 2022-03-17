export interface UserInterface {
    username: string;
    email: string;
    password: string;
    resetToken?: string;
    resetTokenExpiration?: Date;
}
