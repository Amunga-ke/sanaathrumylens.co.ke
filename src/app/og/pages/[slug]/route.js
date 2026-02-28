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
    const maxLength = 20; // Ideal length for 72px font
    const baseSize = 72;
    const minSize = 36;
    if (title.length <= maxLength) return baseSize;
    const scale = (maxLength / title.length) * baseSize;
    return Math.max(minSize, Math.floor(scale));
}

// Approximate if title is "long" for vertical centering
function isLongTitle(title, fontSize) {
    const approxCharsPerLine = 1200 * 0.9 / fontSize; // 90% max width
    return title.length > approxCharsPerLine;
}

export default async function handler(req, { params }) {
    try {
        const slug = params?.slug || 'home';
        const title = titleFromSlug(slug);
        const dynamicFontSize = getFontSize(title);
        const longTitle = isLongTitle(title, dynamicFontSize);

        // Styles
        const containerStyle = {
            display: 'flex',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(180deg,#0f172a 0%, #071323 100%)',
            color: 'white',
            fontFamily: 'Inter, system-ui, Arial, sans-serif',
            justifyContent: longTitle ? 'center' : 'flex-end', // vertical centering if long
            alignItems: 'flex-start',
            padding: 64,
            boxSizing: 'border-box',
            position: 'relative', // required for absolute logo positioning
        };

        const contentStyle = {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: longTitle ? 'center' : 'flex-end',
            width: '100%',
            height: '100%',
        };

        const subtitleStyle = {
            fontSize: 24,
            opacity: 0.9,
            marginBottom: 8,
        };

        const titleStyle = {
            fontSize: dynamicFontSize,
            fontWeight: 800,
            lineHeight: 1.1,
            maxWidth: '90%',
            wordBreak: 'break-word',
        };

        const logoStyle = {
            position: 'absolute',
            top: 32,
            left: 32,
            width: 64,
            height: 64,
        };

        return new ImageResponse(
            (
                <div style={containerStyle}>
                    {/* Logo in top-left */}
                    <img src="https://www.sanaathrumylens.co.ke/logo.png" alt="Logo" style={logoStyle} />

                    <div style={contentStyle}>
                        <div style={subtitleStyle}>Sanaathrumylens</div>
                        <div style={titleStyle}>{title}</div>
                    </div>
                </div>
            ),
            { width: 1200, height: 630 }
        );
    } catch (err) {
        console.error('OG pages image error', err);
        return new ImageResponse(
            (
                <div
                    style={{
                        display: 'flex',
                        width: '100%',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#0f172a',
                        color: 'white',
                    }}
                >
                    <div style={{ fontSize: 36 }}>Sanaathrumylens</div>
                </div>
            ),
            { width: 1200, height: 630 }
        );
    }
}
