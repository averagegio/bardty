/** @type {import('next').NextConfig} */
const nextConfig = {
	async redirects() {
		return [
			{
				source: '/:path*',
				has: [
					{
						type: 'host',
						value: 'www.bardty.com'
					}
				],
				destination: 'https://bardty.com/:path*',
				permanent: true
			}
		];
	}
};

export default nextConfig;
