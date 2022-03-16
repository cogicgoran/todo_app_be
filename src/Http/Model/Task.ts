import { IsString, IsNotEmpty, IsBoolean, Length} from 'class-validator';

class TaskDTO {
    @IsNotEmpty()
    @IsString()
    @Length(3, 64)
    public title: string;

    @IsNotEmpty()
    @IsString()
    @Length(3, 256)
    public message: string;

    @IsNotEmpty()
    @IsBoolean()
    public completed: boolean;
}

export default TaskDTO;