import { IsString, IsNotEmpty, MinLength, Length, MaxLength} from 'class-validator';

class UserRegistrationDTO {
    @IsString()
    @IsNotEmpty()
    @MinLength(4)
    @MaxLength(32)
    public username: string;

    @IsNotEmpty()
    @IsString()
    public email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @MaxLength(128)
    public password: string;
}

export default UserRegistrationDTO;