import { AuthService } from '@/app/features/auth/auth.service';
import { IAuthResponse } from '@/app/features/auth/data-types/interface/auth.interfaces';
import { LoginDto } from '@/app/features/auth/dto/login.dto';
import { RegisterDto } from '@/app/features/auth/dto/register.dto';
import { AuthGuard } from '@/shared/guard/auth.guard';
import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

@ApiTags('Auth')
@Controller({
  path: 'auth',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'iniciar sesión' })
  @Post('login')
  login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<IAuthResponse> {
    return this.authService.login(loginDto.email, loginDto.password, response);
  }

  @ApiOperation({ summary: 'cerrar sesión' })
  @UseGuards(AuthGuard)
  @Post('logout')
  logout(@Res() response: Response): Promise<IAuthResponse> {
    return this.authService.logout(response);
  }

  @Post('register')
  register(@Body() registerDto: RegisterDto): Promise<IAuthResponse> {
    return this.authService.registerUser(registerDto);
  }
}
