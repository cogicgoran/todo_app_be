import { IsString, IsNotEmpty} from 'class-validator';

class UserPasswordResetDTO {
    @IsNotEmpty()
    @IsString()
    public email: string;
}

export default UserPasswordResetDTO;