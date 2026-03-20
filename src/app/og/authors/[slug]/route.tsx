// src/app/og/authors/[slug]/route.tsx

import { ImageResponse } from '@vercel/og';
import { getAuthorBySlug } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const author = await getAuthorBySlug(slug);

        const name = author?.name || 'Author';
        const avatar = author?.avatar || null;

        return new ImageResponse(
            (
                <div style={{
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#06202a',
                    color: 'white',
                    fontFamily: 'Inter, system-ui, Arial, sans-serif',
                    alignItems: 'center'
                }}>
                    {avatar && <img src={avatar} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.45)' }} />}
                    <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center', gap: 24, padding: 48 }}>
                        <div style={{ width: 120, height: 120, borderRadius: 9999, background: '#fff2', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                            {avatar ? <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ fontSize: 28 }}>{name?.[0] || 'A'}</div>}
                        </div>
                        <div>
                            <div style={{ fontSize: 20, opacity: 0.9 }}>Author</div>
                            <div style={{ fontSize: 56, fontWeight: 700 }}>{name}</div>
                        </div>
                    </div>
                </div>
            ),
            { width: 1200, height: 630 }
        );
    } catch (err) {
        console.error('OG author image error', err);
        return new ImageResponse((
            <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#06202a', color: 'white' }}>
                <div style={{ fontSize: 36 }}>Author</div>
            </div>
        ), { width: 1200, height: 630 });
    }
}
