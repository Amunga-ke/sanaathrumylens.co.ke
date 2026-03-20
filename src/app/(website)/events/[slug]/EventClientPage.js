// src/app/events/[slug]/EventClientPage.js
"use client";
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Calendar, MapPin, Clock, Users, Ticket, Share2,
    ArrowLeft, Phone, Mail, Globe, Facebook, Twitter,
    Linkedin, ChevronRight
} from 'lucide-react';

// Helper to parse serialized dates
function parseEventDates(event) {
    if (!event) return null;
    const parsed = { ...event };
    if (event.startDate) parsed.startDate = new Date(event.startDate);
    if (event.endDate) parsed.endDate = new Date(event.endDate);
    return parsed;
}

export default function EventClientPage({
    initialEvent = null,
    slug,
    siteUrl = 'https://example.com',
    siteName = 'Event Platform'
}) {
    const [event, setEvent] = useState(() => parseEventDates(initialEvent));
    const [similarEvents, setSimilarEvents] = useState([]);
    const [loading, setLoading] = useState(!initialEvent);
    const [error, setError] = useState(null);
    const [registering, setRegistering] = useState(false);

    const fetchEvent = useCallback(async () => {
        if (initialEvent) return;
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/events/' + slug);
            if (!response.ok) throw new Error('Event not found');
            const data = await response.json();
            setEvent(parseEventDates(data));
        } catch (err) {
            console.error('Error fetching event:', err);
            setError('Event not found or failed to load');
        } finally {
            setLoading(false);
        }
    }, [slug, initialEvent]);

    useEffect(() => {
        if (!initialEvent && slug) fetchEvent();
    }, [slug, initialEvent, fetchEvent]);

    const handleRegister = async () => {
        setRegistering(true);
        setTimeout(() => {
            setRegistering(false);
            alert('Registration successful!');
        }, 1500);
    };

    const formatDate = (date) => {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) return 'Date TBD';
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatTime = (date) => {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) return 'Time TBD';
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDateTimeRange = (startDate, endDate) => {
        const start = startDate instanceof Date ? startDate : null;
        const end = endDate instanceof Date ? endDate : null;
        if (!start) return 'Date & Time TBD';
        if (!end || start.toDateString() === end.toDateString()) {
            return formatDate(start) + ' at ' + formatTime(start);
        }
        return formatDate(start) + ' - ' + formatDate(end);
    };

    const getEventStatus = (startDate, endDate) => {
        if (!startDate || !(startDate instanceof Date)) {
            return { label: 'Date TBD', color: 'bg-gray-100 text-gray-600' };
        }
        const now = new Date();
        const start = startDate;
        const end = endDate instanceof Date ? endDate : null;
        if (now < start) {
            const daysUntil = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
            if (daysUntil === 0) return { label: 'Today', color: 'bg-blue-100 text-blue-800' };
            if (daysUntil <= 7) return { label: 'This Week', color: 'bg-blue-100 text-blue-800' };
            return { label: 'Upcoming', color: 'bg-gray-100 text-gray-800' };
        } else if (end && now <= end) {
            return { label: 'Happening Now', color: 'bg-green-100 text-green-800' };
        } else {
            return { label: 'Past Event', color: 'bg-gray-100 text-gray-500' };
        }
    };

    const shareEvent = (platform) => {
        const url = window.location.href;
        const title = event?.title || '';
        const shareUrls = {
            facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url),
            twitter: 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(url) + '&text=' + encodeURIComponent(title),
            linkedin: 'https://www.linkedin.com/shareArticle?mini=true&url=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(title),
        };
        if (platform === 'copy') {
            navigator.clipboard.writeText(url);
            alert('Event link copied to clipboard!');
            return;
        }
        if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank', 'noopener,noreferrer');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-gray-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500">Loading event details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center max-w-md p-8 bg-white rounded-lg shadow">
                    <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
                    <p className="text-gray-500 mb-6">The event you&apos;re looking for doesn&apos;t exist or has been cancelled.</p>
                    <Link href="/events" className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium">
                        Browse All Events
                    </Link>
                </div>
            </div>
        );
    }

    const eventStatus = getEventStatus(event.startDate, event.endDate);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Back Navigation */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <Link href="/events" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium">
                        <ArrowLeft size={16} />
                        Back to Events
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Event Status */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className={'inline-block px-3 py-1 rounded-full text-sm font-medium ' + eventStatus.color}>
                                {eventStatus.label}
                            </span>
                            {event.featured && (
                                <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                                    Featured Event
                                </span>
                            )}
                        </div>

                        {/* Event Title */}
                        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">{event.title}</h1>

                        {/* Event Image */}
                        {event.coverImage && (
                            <div className="relative aspect-video rounded-xl overflow-hidden mb-8 shadow-lg">
                                <Image
                                    src={event.coverImage}
                                    alt={event.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 66vw"
                                    priority
                                    unoptimized
                                />
                            </div>
                        )}

                        {/* Event Details */}
                        <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
                            <h2 className="text-xl font-bold mb-4 text-gray-900">Event Details</h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-orange-500 mt-1 shrink-0" />
                                    <div>
                                        <p className="font-medium text-gray-900">Date & Time</p>
                                        <p className="text-gray-600">{formatDateTimeRange(event.startDate, event.endDate)}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-orange-500 mt-1 shrink-0" />
                                    <div>
                                        <p className="font-medium text-gray-900">Location</p>
                                        <p className="text-gray-600">
                                            {event.isOnline ? (
                                                <span className="text-blue-600">Online Event</span>
                                            ) : (
                                                [event.venue, event.city, event.country].filter(Boolean).join(', ') || 'Location TBD'
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Event Description */}
                        {event.description && (
                            <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
                                <h2 className="text-xl font-bold mb-4 text-gray-900">About This Event</h2>
                                <div className="prose prose-lg max-w-none text-gray-700">
                                    <p>{event.description}</p>
                                </div>
                            </div>
                        )}

                        {/* Share Event */}
                        <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
                            <h3 className="font-bold mb-3 text-gray-900">Share this event</h3>
                            <div className="flex gap-2">
                                <button onClick={() => shareEvent('facebook')} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                                    <Facebook size={20} />
                                </button>
                                <button onClick={() => shareEvent('twitter')} className="p-2 bg-blue-50 text-blue-400 rounded-lg hover:bg-blue-100 transition-colors">
                                    <Twitter size={20} />
                                </button>
                                <button onClick={() => shareEvent('linkedin')} className="p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                                    <Linkedin size={20} />
                                </button>
                                <button onClick={() => shareEvent('copy')} className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Registration Card */}
                        <div className="bg-white rounded-xl p-6 shadow-lg sticky top-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Ticket className="w-6 h-6 text-orange-500" />
                                <h3 className="text-xl font-bold text-gray-900">Registration</h3>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <div className="text-3xl font-bold text-gray-900 mb-1">
                                        {event.isFree ? 'FREE' : (event.currency || 'KES') + ' ' + (event.price || 0)}
                                    </div>
                                    <div className="text-gray-500">
                                        {event.isFree ? 'No cost to attend' : 'Per person'}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleRegister}
                                disabled={registering || eventStatus.label === 'Past Event'}
                                className={'w-full py-3 rounded-lg font-medium transition-colors ' + 
                                    (eventStatus.label === 'Past Event'
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-orange-500 text-white hover:bg-orange-600')}
                            >
                                {registering ? 'Processing...' : eventStatus.label === 'Past Event' ? 'Event Ended' : event.ticketUrl ? 'Get Tickets' : 'Register Now'}
                            </button>

                            <p className="text-gray-500 text-sm text-center mt-3">
                                {event.registeredCount || 0} people registered
                            </p>
                        </div>

                        {/* Online Link */}
                        {event.isOnline && event.onlineUrl && (
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h3 className="font-bold mb-4 text-gray-900">Join Online</h3>
                                <a
                                    href={event.onlineUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-orange-500 hover:text-orange-600"
                                >
                                    <Globe size={16} />
                                    Join Event Online
                                    <ChevronRight size={12} />
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Back to Events */}
                <div className="mt-12 text-center">
                    <Link href="/events" className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium">
                        ← Browse All Events
                    </Link>
                </div>
            </div>
        </div>
    );
}
