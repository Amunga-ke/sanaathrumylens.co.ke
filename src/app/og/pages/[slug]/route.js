// src/app/og/pages/[slug]/route.js
import { ImageResponse } from '@vercel/og';

export const runtime = 'nodejs';

// Convert slug to readable title
function titleFromSlug(slug) {
    if (!slug) return 'Sanaathrumylens';
    const s = Array.isArray(slug) ? slug.join('/') : slug;
    if (s === 'home' || s === '') return 'Sanaathrumylens';
    return s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Dynamic font size based on title length
function getFontSize(title) {
    const maxLength = 20;
    const baseSize = 72;
    const minSize = 36;
    if (title.length <= maxLength) return baseSize;
    const scale = (maxLength / title.length) * baseSize;
    return Math.max(minSize, Math.floor(scale));
}

// Approximate if title is "long" for vertical centering
function isLongTitle(title, fontSize) {
    const approxCharsPerLine = (1200 * 0.9) / fontSize;
    return title.length > approxCharsPerLine;
}

export async function GET(req, { params }) {
    try {
        const { slug } = await params;
        const title = titleFromSlug(slug);
        const dynamicFontSize = getFontSize(title);
        const longTitle = isLongTitle(title, dynamicFontSize);

        return new ImageResponse(
            (
                <div style={{
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(180deg,#0f172a 0%, #071323 100%)',
                    color: 'white',
                    fontFamily: 'Inter, system-ui, Arial, sans-serif',
                    justifyContent: longTitle ? 'center' : 'flex-end',
                    alignItems: 'flex-start',
                    padding: 64,
                    boxSizing: 'border-box',
                    position: 'relative',
                }}>
                    <img src="https://www.sanaathrumylens.co.ke/logo.png" alt="Logo" style={{ position: 'absolute', top: 32, left: 32, width: 64, height: 64 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: longTitle ? 'center' : 'flex-end', width: '100%', height: '100%' }}>
                        <div style={{ fontSize: 24, opacity: 0.9, marginBottom: 8 }}>Sanaathrumylens</div>
                        <div style={{ fontSize: dynamicFontSize, fontWeight: 800, lineHeight: 1.1, maxWidth: '90%', wordBreak: 'break-word' }}>{title}</div>
                    </div>
                </div>
            ),
            { width: 1200, height: 630 }
        );
    } catch (err) {
        console.error('OG pages image error', err);
        return new ImageResponse(
            (
                <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white' }}>
                    <div style={{ fontSize: 36 }}>Sanaathrumylens</div>
                </div>
            ),
            { width: 1200, height: 630 }
        );
    }
}
