import { NextResponse } from 'next/server';
import { signJwt } from '@/lib/auth';
import { redis } from '@/lib/redis';
import bcrypt from 'bcryptjs';

function isValidUsername(username) {
	return typeof username === 'string' && /^[a-zA-Z0-9_\-]{3,32}$/.test(username);
}

function isValidPassword(password) {
	return typeof password === 'string' && password.length >= 8 && password.length <= 128;
}

export async function POST(request) {
	try {
		const { username, password } = await request.json();
		if (!isValidUsername(username) || !isValidPassword(password)) {
			return NextResponse.json({ error: 'Invalid username or password format' }, { status: 400 });
		}

		const key = `user:${username}`;
		try {
			const exists = await redis.exists(key);
			if (exists) {
				return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
			}
		} catch (e) {
			return NextResponse.json({ error: 'User store unavailable' }, { status: 500 });
		}

		const passwordHash = await bcrypt.hash(password, 10);
		const now = Date.now();
		try {
			await redis.hset(key, {
				password: passwordHash,
				role: 'user',
				createdAt: String(now)
			});
		} catch (e) {
			return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
		}

		const token = await signJwt({ sub: username, role: 'user' }, '7d');
		const response = NextResponse.json({ ok: true });
		response.cookies.set('session', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60 * 24 * 7
		});
		return response;
	} catch (error) {
		return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
	}
}


