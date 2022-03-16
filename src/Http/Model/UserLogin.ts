import { IsString, IsNotEmpty, MinLength, MaxLength} from 'class-validator';

class UserLoginDTO {
    @IsNotEmpty()
    @IsString()
    public email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @MaxLength(128)
    public password: string;
}

export default UserLoginDTO;