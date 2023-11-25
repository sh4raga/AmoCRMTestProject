/* eslint-disable prettier/prettier */
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class UserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}
