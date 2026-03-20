// src/app/og/[slug]/route.tsx
import { ImageResponse } from '@vercel/og';
import { getPostBySlug } from '@/lib/db';

export const runtime = 'nodejs';

const FONT_SIZE = 56;

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const post = await getPostBySlug(slug);

        const title = post?.title || 'Sanaathrumylens';
        const author = post?.author?.name || process.env.NEXT_PUBLIC_SITE_NAME || 'Sanaathrumylens';
        const bg = post?.coverImage || post?.featuredImage || null;

        return new ImageResponse(
            (
                <div
                    style={{
                        display: 'flex',
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#111827',
                        color: 'white',
                        fontFamily: 'Inter, system-ui, Arial, sans-serif',
                        position: 'relative',
                    }}
                >
                    {bg && (
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                backgroundImage: `url(${bg})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                filter: 'brightness(0.45)',
                            }}
                        />
                    )}
                    <div
                        style={{
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            padding: 48,
                            width: '100%',
                        }}
                    >
                        <div style={{ fontSize: 28, opacity: 0.85, marginBottom: 12 }}>{author}</div>
                        <div
                            style={{
                                fontSize: FONT_SIZE,
                                lineHeight: 1.05,
                                fontWeight: 700,
                                maxWidth: '90%',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {title}
                        </div>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            }
        );
    } catch (err) {
        console.error('OG image generation error:', err);

        return new ImageResponse(
            <div
                style={{
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#111827',
                    color: 'white',
                    fontFamily: 'Inter, system-ui, Arial, sans-serif',
                }}
            >
                <div style={{ fontSize: 36 }}>Sanaathrumylens</div>
            </div>,
            { width: 1200, height: 630 }
        );
    }
}
