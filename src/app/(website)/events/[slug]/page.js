// src/app/events/[slug]/page.js
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE } from '../../../seo/constants';
import { generateEventMetadata } from '@/app/seo/meta';
import { getEventBySlug } from '@/lib/db';
import EventClientPage from './EventClientPage';

export async function generateMetadata({ params }) {
    // Await params first - Next.js 15 requires this
    const { slug } = await params;

    // Fetch minimal event data for SEO
    const event = await getEventBySlug(slug);

    if (!event) {
        return {
            title: 'Event Not Found',
            description: 'The event you are looking for does not exist.',
        };
    }

    return generateEventMetadata({
        id: event.id,
        slug: event.slug,
        title: event.title,
        description: event.description || '',
        excerpt: event.description || '',
        coverImage: event.coverImage || DEFAULT_OG_IMAGE,
        startDate: event.startDate,
        endDate: event.endDate,
        isOnline: event.isOnline,
        location: event.venue,
        category: null,
        registration: null,
        tags: [],
    });
}

export default async function EventPage({ params }) {
    // Await params first - Next.js 15 requires this
    const { slug } = await params;

    // Fetch full event data for initial render
    const event = await getEventBySlug(slug);

    // Serialize the event data
    const serializedEvent = event ? {
        id: event.id,
        slug: event.slug,
        title: event.title,
        description: event.description,
        content: event.content,
        coverImage: event.coverImage,
        venue: event.venue,
        address: event.address,
        city: event.city,
        country: event.country,
        isOnline: event.isOnline,
        onlineUrl: event.onlineUrl,
        startDate: event.startDate?.toISOString?.() || event.startDate,
        endDate: event.endDate?.toISOString?.() || event.endDate,
        timezone: event.timezone,
        isFree: event.isFree,
        price: event.price,
        currency: event.currency,
        ticketUrl: event.ticketUrl,
        capacity: event.capacity,
        registeredCount: event.registeredCount,
        status: event.status,
        featured: event.featured,
    } : null;

    return <EventClientPage
        initialEvent={serializedEvent}
        slug={slug}
        siteUrl={SITE_URL}
        siteName={SITE_NAME}
    />;
}
