import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { signJwt, verifyJwt } from '@/lib/auth';
import { redis } from '@/lib/redis';
import bcrypt from 'bcryptjs';

export async function POST(request) {
	try {
		const { username, password } = await request.json();
		if (!username || !password) {
			return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
		}

		// Simple demo auth: look up user password hash in Redis (e.g., key user:USERNAME)
		let stored = null;
		try {
			stored = await redis.hgetall(`user:${username}`);
		} catch (e) {
			return NextResponse.json({ error: 'Auth store unavailable' }, { status: 500 });
		}
		if (!stored || !stored.password) {
			return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
		}

		const valid = stored.password ? await bcrypt.compare(password, stored.password) : false;
		if (!valid) {
			return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
		}

		const token = await signJwt({ sub: username, role: stored.role || 'user' }, '7d');
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

export async function GET() {
	try {
		const headerList = await headers();
		const cookieHeader = headerList.get('cookie') || '';
		const match = /(?:^|; )session=([^;]+)/.exec(cookieHeader);
		const raw = match ? decodeURIComponent(match[1]) : null;
		if (!raw) return NextResponse.json({ authenticated: false }, { status: 200 });
		const payload = await verifyJwt(raw);
		return NextResponse.json({ authenticated: true, user: payload }, { status: 200 });
	} catch {
		return NextResponse.json({ authenticated: false }, { status: 200 });
	}
}


