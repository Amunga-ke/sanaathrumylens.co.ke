// src/app/og/events/[slug]/route.tsx

import { ImageResponse } from '@vercel/og';
import { getEventBySlug } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const event = await getEventBySlug(slug);

        const title = event?.title || 'Event';
        const date = event?.startDate ? new Date(event.startDate).toLocaleDateString() : '';
        const bg = event?.coverImage || null;

        return new ImageResponse(
            (
                <div style={{
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#0f172a',
                    color: 'white',
                    fontFamily: 'Inter, system-ui, Arial, sans-serif',
                }}>
                    {bg && <img src={bg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.45)' }} />}
                    <div style={{ position: 'relative', padding: 48, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', width: '100%' }}>
                        <div style={{ fontSize: 20, opacity: 0.9 }}>{date}</div>
                        <div style={{ fontSize: 56, lineHeight: 1.02, fontWeight: 700, marginTop: 8 }}>{title}</div>
                    </div>
                </div>
            ),
            { width: 1200, height: 630 }
        );
    } catch (err) {
        console.error('OG event image error', err);
        return new ImageResponse((
            <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: 'white' }}>
                <div style={{ fontSize: 36 }}>Event</div>
            </div>
        ), { width: 1200, height: 630 });
    }
}
