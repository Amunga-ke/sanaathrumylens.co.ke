// src/app/events/[slug]/page.js
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE } from '../../../seo/constants';
import { generateEventMetadata } from '@/app/seo/meta';
import EventClientPage from './EventClientPage';

export async function generateMetadata({ params }) {
    // Await params first - Next.js 15 requires this
    const { slug } = await params;

    // Fetch minimal event data for SEO
    const event = await fetchEventForSEO(slug);

    if (!event) {
        return {
            title: 'Event Not Found',
            description: 'The event you are looking for does not exist.',
        };
    }

    return generateEventMetadata(event);
}

// Minimal fetch for SEO metadata only
async function fetchEventForSEO(slug) {
    try {
        const { db } = await import('@/lib/firebase');
        const { collection, query, where, getDocs, limit } = await import('firebase/firestore');

        const eventsRef = collection(db, 'events');
        const eventQuery = query(
            eventsRef,
            where('slug', '==', slug),
            where('status', '==', 'published'),
            where('isDeleted', '==', false),
            limit(1)
        );

        const eventSnapshot = await getDocs(eventQuery);

        if (eventSnapshot.empty) {
            return null;
        }

        const eventDoc = eventSnapshot.docs[0];
        const data = eventDoc.data();

        return {
            id: eventDoc.id,
            slug: slug,
            title: data.title || 'Event',
            description: data.description || data.excerpt || '',
            excerpt: data.excerpt || '',
            coverImage: data.coverImage || DEFAULT_OG_IMAGE,
            startDate: data.startDate?.toDate(),
            endDate: data.endDate?.toDate(),
            isOnline: data.isOnline || false,
            location: data.location,
            category: data.category,
            registration: data.registration,
            tags: data.tags || [],
        };
    } catch (error) {
        console.error('Error fetching event for SEO:', error);
        return null;
    }
}

// Helper function to serialize Firestore data
function serializeEventData(eventData) {
    if (!eventData) return null;

    // Convert to plain object, handling Firestore Timestamps
    const serialized = { ...eventData };

    // Handle date fields
    if (eventData.startDate && typeof eventData.startDate.toDate === 'function') {
        serialized.startDate = eventData.startDate.toDate().toISOString();
    } else if (eventData.startDate instanceof Date) {
        serialized.startDate = eventData.startDate.toISOString();
    }

    if (eventData.endDate && typeof eventData.endDate.toDate === 'function') {
        serialized.endDate = eventData.endDate.toDate().toISOString();
    } else if (eventData.endDate instanceof Date) {
        serialized.endDate = eventData.endDate.toISOString();
    }

    // Handle registration deadline
    if (eventData.registration?.deadline) {
        if (typeof eventData.registration.deadline.toDate === 'function') {
            serialized.registration.deadline = eventData.registration.deadline.toDate().toISOString();
        } else if (eventData.registration.deadline instanceof Date) {
            serialized.registration.deadline = eventData.registration.deadline.toISOString();
        }
    }

    // Handle stats (remove any Firestore-specific objects)
    if (eventData.stats) {
        serialized.stats = { ...eventData.stats };
        // Remove any non-serializable fields
        Object.keys(serialized.stats).forEach(key => {
            if (serialized.stats[key] && typeof serialized.stats[key] === 'object') {
                serialized.stats[key] = serialized.stats[key].toString ? serialized.stats[key].toString() : JSON.stringify(serialized.stats[key]);
            }
        });
    }

    return serialized;
}

export default async function EventPage({ params }) {
    // Await params first - Next.js 15 requires this
    const { slug } = await params;

    // Fetch full event data for initial render
    const initialEvent = await fetchFullEvent(slug);

    // Serialize the event data to remove Firestore-specific objects
    const serializedEvent = serializeEventData(initialEvent);

    return <EventClientPage
        initialEvent={serializedEvent}
        slug={slug}
        siteUrl={SITE_URL}
        siteName={SITE_NAME}
    />;
}

// Fetch full event data for initial server render
async function fetchFullEvent(slug) {
    try {
        const { db } = await import('@/lib/firebase');
        const { collection, query, where, getDocs, doc, getDoc, limit } = await import('firebase/firestore');

        let eventDoc;
        let eventId = slug;

        // Check if slug is a document ID (20 chars) or a custom slug
        if (slug.length !== 20) {
            const eventsQuery = query(
                collection(db, 'events'),
                where('slug', '==', slug),
                where('status', '==', 'published'),
                where('isDeleted', '==', false),
                limit(1)
            );
            const snapshot = await getDocs(eventsQuery);
            if (!snapshot.empty) {
                eventDoc = snapshot.docs[0];
                eventId = eventDoc.id;
            }
        } else {
            eventDoc = await getDoc(doc(db, 'events', slug));
        }

        if (!eventDoc || !eventDoc.exists()) {
            return null;
        }

        const eventData = eventDoc.data();

        return {
            id: eventId,
            ...eventData,
            startDate: eventData.startDate,
            endDate: eventData.endDate,
            registration: {
                ...eventData.registration,
                deadline: eventData.registration?.deadline,
            },
            stats: eventData.stats || {},
        };
    } catch (error) {
        console.error('Error fetching full event:', error);
        return null;
    }
}