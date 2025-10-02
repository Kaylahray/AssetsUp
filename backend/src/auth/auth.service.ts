
import { Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
	private refreshTokens: Map<string, string> = new Map(); // userId -> refreshToken

	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
	) {}

	async validateUser(email: string, password: string): Promise<User | null> {
		const user = await this.usersService.userRepository.findOneBy({ email });
		if (!user) return null;
		const isMatch = await bcrypt.compare(password, user.passwordHash);
		return isMatch ? user : null;
	}

	async login(user: User) {
		const payload = { sub: user.id, email: user.email, role: user.role };
		const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
		const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
		this.refreshTokens.set(user.id, refreshToken);
		return { accessToken, refreshToken };
	}

	async refresh(userId: string, refreshToken: string) {
		const storedToken = this.refreshTokens.get(userId);
		if (!storedToken || storedToken !== refreshToken) {
			throw new UnauthorizedException('Invalid refresh token');
		}
		const user = await this.usersService.findOne(userId);
		if (!user) throw new UnauthorizedException('User not found');
		return this.login(user);
	}
}
