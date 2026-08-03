export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

export async function GET() {
  const keys = Object.keys(process.env).sort();
  const interesting = keys.filter(
    (k) =>
      /mongo|jwt|cloudinary|telegram|blackbox|database|uri/i.test(k) &&
      !/npm_|path|home|pwd|node_/i.test(k)
  );

  const mongo =
    process.env.MONGODB_URI ||
    process.env.MONGO_URL ||
    process.env.DATABASE_URL ||
    process.env.MONGO_URI ||
    '';

  return NextResponse.json({
    ok: true,
    platform: 'railway',
    hasMongo: Boolean(mongo),
    hasJwt: Boolean(process.env.JWT_SECRET),
    hasCloudinary: Boolean(
      process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY
    ),
    // names only — no secret values
    seenRelatedKeys: interesting,
    tip:
      interesting.length === 0
        ? 'Is service pe koi Mongo/JWT variable nahi mil raha. Variables GALAT service pe hain ya Redeploy nahi hua.'
        : 'Related keys mil gayi. Agar hasMongo false hai to name MONGODB_URI ya MONGO_URL hona chahiye.',
  });
}
