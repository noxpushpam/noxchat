export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    platform: 'railway',
    env: {
      MONGODB_URI: !!(process.env.MONGODB_URI || process.env.MONGO_URL),
      JWT_SECRET: !!process.env.JWT_SECRET,
      CLOUDINARY: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
      TELEGRAM: !!process.env.TELEGRAM_BOT_TOKEN,
      BLACKBOX: !!process.env.BLACKBOX_API_KEY,
    },
  });
}
