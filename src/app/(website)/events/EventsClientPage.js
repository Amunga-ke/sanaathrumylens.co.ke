// src/app/events/EventsClientPage.js
"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    Search, Calendar, MapPin, Clock, Flame,
    ChevronLeft, ChevronRight, ArrowRight, Grid, List, ChevronDown
} from "lucide-react";
import { SITE_URL } from "@/app/seo/constants";

const formatDate = (date) => {
    if (!date) return 'Date TBD';
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
};

const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
};

const getEventStatus = (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    if (now < start) {
        const daysUntil = Math.ceil((start - now) / (1000 * 60 * 60 * 24));
        if (daysUntil <= 7) return { label: 'Starting Soon', color: 'bg-blue-100 text-blue-800' };
        return { label: 'Upcoming', color: 'bg-gray-100 text-gray-800' };
    } else if (end && now <= end) {
        return { label: 'Ongoing', color: 'bg-green-100 text-green-800' };
    } else {
        return { label: 'Past', color: 'bg-gray-100 text-gray-500' };
    }
};

const EventCard = ({ event, viewMode }) => {
    const status = getEventStatus(event.startDate, event.endDate);
    return (
        <Link
            href={`/events/${event.slug || event.id}`}
            className={`bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 ${viewMode === 'list' ? 'flex gap-4 p-4' : ''}`}
        >
            <div className={`relative ${viewMode === 'list' ? 'w-48 h-32 shrink-0' : 'aspect-video'}`}>
                {event.coverImage ? (
                    <Image
                        src={event.coverImage}
                        alt={event.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 400px"
                        unoptimized
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400"></div>
                )}
                <div className="absolute top-3 left-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                    </span>
                </div>
            </div>
            <div className={viewMode === 'list' ? 'flex-1 space-y-2' : 'p-4 space-y-2'}>
                <h3 className="font-bold text-gray-900 hover:text-orange-500 transition-colors line-clamp-2">
                    {event.title}
                </h3>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Calendar size={14} />
                    <span>{formatDate(event.startDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <MapPin size={14} />
                    <span>{event.isOnline ? 'Online Event' : event.venue || event.city || 'Location TBD'}</span>
                </div>
                <div className="flex items-center justify-between mt-3">
                    <span className="text-orange-500 text-sm font-medium">
                        {event.isFree ? 'Free' : `${event.currency || 'KES'} ${event.price || 0}`}
                    </span>
                    <span className="text-gray-400 text-xs">{event.registeredCount || 0} registered</span>
                </div>
            </div>
        </Link>
    );
};

export default function EventsClientPage() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [showPastEvents, setShowPastEvents] = useState(false);
    const [viewMode, setViewMode] = useState('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(12);

    useEffect(() => {
        async function fetchEvents() {
            try {
                const response = await fetch('/api/events');
                if (!response.ok) throw new Error('Failed to load events');
                const data = await response.json();
                setEvents(data);
            } catch (err) {
                console.error("Error fetching events:", err);
                setError('Failed to load events');
            } finally {
                setLoading(false);
            }
        }
        fetchEvents();
    }, []);

    const filteredEvents = useMemo(() => {
        const now = new Date();
        return events.filter((e) => {
            const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
                (e.description || '').toLowerCase().includes(search.toLowerCase());
            const eventDate = new Date(e.startDate);
            const matchesDate = showPastEvents || eventDate >= now;
            return matchesSearch && matchesDate;
        });
    }, [events, search, showPastEvents]);

    const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
    const paginatedEvents = filteredEvents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    const featuredEvent = filteredEvents.find(e => e.featured);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, showPastEvents]);

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
                        <p className="text-gray-500 mb-4">{error}</p>
                        <button onClick={() => window.location.reload()} className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600">
                            Refresh Page
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="bg-gradient-to-b from-gray-100 to-gray-50 py-12 md:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="text-center">
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Discover Amazing Events</h1>
                        <p className="text-gray-600 mb-8">Workshops, meetups, concerts & creative gatherings</p>
                        <div className="max-w-2xl mx-auto">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search events..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full px-6 py-4 pr-12 rounded-xl bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Filters */}
                <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <button
                                onClick={() => setShowPastEvents(!showPastEvents)}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${showPastEvents ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                {showPastEvents ? 'Hide Past Events' : 'Show Past Events'}
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-gray-200 text-orange-500' : 'text-gray-500 hover:bg-gray-100'}`}>
                                <Grid size={20} />
                            </button>
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-gray-200 text-orange-500' : 'text-gray-500 hover:bg-gray-100'}`}>
                                <List size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-500">
                            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredEvents.length)}-{Math.min(currentPage * itemsPerPage, filteredEvents.length)} of {filteredEvents.length} events
                        </p>
                    </div>
                </div>

                {/* Featured Event */}
                {featuredEvent && currentPage === 1 && (
                    <div className="bg-white rounded-lg overflow-hidden shadow-lg mb-8">
                        <Link href={`/events/${featuredEvent.slug || featuredEvent.id}`} className="block">
                            <div className="md:flex">
                                <div className="md:w-1/2 relative aspect-video md:aspect-auto min-h-64">
                                    {featuredEvent.coverImage ? (
                                        <Image
                                            src={featuredEvent.coverImage}
                                            alt={featuredEvent.title}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            priority
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400"></div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-orange-500 text-white text-sm px-3 py-1 rounded-full font-medium">Featured Event</span>
                                    </div>
                                </div>
                                <div className="md:w-1/2 p-6 md:p-8">
                                    <h2 className="text-2xl font-bold mb-4 text-gray-900 hover:text-orange-500 transition-colors">{featuredEvent.title}</h2>
                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Calendar size={18} />
                                            <span>{formatDate(featuredEvent.startDate)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <MapPin size={18} />
                                            <span>{featuredEvent.isOnline ? 'Online Event' : featuredEvent.venue || 'Location TBD'}</span>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 mb-6 line-clamp-3">{featuredEvent.description}</p>
                                    <span className="text-orange-500 font-medium flex items-center gap-2">
                                        View Details <ArrowRight size={16} />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                )}

                {/* Events Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="bg-white rounded-lg overflow-hidden shadow animate-pulse">
                                <div className="aspect-video bg-gray-200"></div>
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : paginatedEvents.length > 0 ? (
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
                        {paginatedEvents.filter(e => e.id !== featuredEvent?.id).map((event) => (
                            <EventCard key={event.id} event={event} viewMode={viewMode} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No events found</p>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50">
                            <ChevronLeft size={20} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage - 3), currentPage + 2).map(page => (
                            <button key={page} onClick={() => setCurrentPage(page)} className={`w-10 h-10 rounded-lg ${currentPage === page ? 'bg-orange-500 text-white' : 'hover:bg-gray-100'}`}>
                                {page}
                            </button>
                        ))}
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
