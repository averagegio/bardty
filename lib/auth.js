import { SignJWT, jwtVerify } from 'jose';

const encoder = new TextEncoder();

function getJwtSecretBytes() {
	const secretFromEnv = process.env.JWT_SECRET;
	const secret = secretFromEnv && secretFromEnv.length >= 32
		? secretFromEnv
		: 'dev-secret-change-me-dev-secret-change-me';
	return encoder.encode(secret);
}

const jwtSecretBytes = getJwtSecretBytes();

export async function signJwt(payload, expiresIn = '7d') {
	return await new SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt()
		.setExpirationTime(expiresIn)
		.sign(jwtSecretBytes);
}

export async function verifyJwt(token) {
	const { payload } = await jwtVerify(token, jwtSecretBytes);
	return payload;
}


