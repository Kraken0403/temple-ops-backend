// src/auth/auth.controller.ts
import {
    Controller,
    Post,
    Get,
    Body,
    UseGuards,
    Request,
  } from '@nestjs/common';
  import { AuthService }    from './auth.service';
  import { SignupDto }      from './dto/signup.dto';
  import { LoginDto }       from './dto/login.dto';
  import { LocalAuthGuard } from './local-auth.guard';
  import { JwtAuthGuard }   from './jwt-auth.guard';
  
  @Controller('auth')
  export class AuthController {
    constructor(private readonly auth: AuthService) {}
  
    /** Create a new user */
    @Post('signup')
    signup(@Body() dto: SignupDto) {
      return this.auth.signup(dto);
    }
  
    /** Validate email/password and return JWT */
    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(
      @Body() dto: LoginDto,
      @Request() req: { user: any },
    ) {
      return this.auth.login(req.user);
    }
  
    /** Return the JWT-validated user info */
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req: { user: any }) {
      return req.user;
    }
  }
  