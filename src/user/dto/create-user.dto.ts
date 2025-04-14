export class CreateUserDto {
  email: string;
  password: string;
  role: string;
  profilePicture?: string;
  userName?: string;
  exibitionName?: string;
}