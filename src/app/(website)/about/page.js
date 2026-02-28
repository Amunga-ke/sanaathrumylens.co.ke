// src/app/(website)/about/page.jsx
import Link from "next/link";

export const metadata = {
    title: "About | SanaaThruMyLens",
    description:
        "SanaaThruMyLens is a bold, street-smart opinion blog exploring Kenyan and African art, film, music, and culture through critique, context, and conversation.",
};

export default function AboutPage() {
    return (
        <main className="bg-[#F5F1E8] text-[#111111]">
            {/* ================= HERO ================= */}
            <section className="max-w-6xl mx-auto px-6 pt-24 pb-20">
                <p className="text-sm uppercase tracking-widest text-orange-600 mb-6">
                    About SanaaThruMyLens
                </p>

                <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl leading-tight mb-8">
                    Africa’s creativity,
                    <span className="block">seen through a critical lens.</span>
                </h1>

                <p className="text-lg text-gray-700 max-w-2xl leading-relaxed">
                    Unpacking music, art, culture, and stories shaping Kenya, Africa,
                    and beyond.
                </p>
            </section>

            {/* ================= INTRO ================= */}
            <section className="max-w-6xl mx-auto px-6 pb-20">
                <div className="max-w-3xl space-y-6 text-gray-700 leading-relaxed">
                    <p>
                        SanaaThruMyLens is a bold, street-smart opinion blog rooted in the
                        belief that African creativity deserves more than surface-level
                        attention.
                    </p>

                    <p>
                        We explore music, film, books, visual arts, fashion, and cultural
                        expression with curiosity, context, and critique — spotlighting
                        both emerging voices and iconic moments shaping Kenya’s and
                        Africa’s creative landscape.
                    </p>

                    <p>
                        This platform exists for creatives, students, and culture lovers
                        who want to understand not just what’s trending, but why it
                        matters.
                    </p>
                </div>
            </section>

            {/* ================= WHAT WE COVER ================= */}
            <section className="max-w-6xl mx-auto px-6 py-20 border-t border-gray-300">
                <h2 className="font-serif text-3xl mb-12">What We Cover</h2>

                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 text-gray-700">
                    <div>
                        <h3 className="font-semibold mb-2">Music & Album Reviews</h3>
                        <p className="text-sm leading-relaxed">
                            Lyrics, production, visuals, and the cultural weight behind the sound.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Video & Visual Analysis</h3>
                        <p className="text-sm leading-relaxed">
                            Breaking down imagery, symbolism, and visual storytelling.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Artist Spotlights</h3>
                        <p className="text-sm leading-relaxed">
                            Emerging talents, established icons, and creative journeys.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Film & Book Reviews</h3>
                        <p className="text-sm leading-relaxed">
                            African narratives, craft, and storytelling traditions.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Cultural Commentary</h3>
                        <p className="text-sm leading-relaxed">
                            Opinion pieces on identity, society, and creative expression.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Education in the Arts</h3>
                        <p className="text-sm leading-relaxed">
                            History, context, and insight into creative disciplines.
                        </p>
                    </div>
                </div>

                <p className="text-sm text-gray-600 mt-10 max-w-2xl">
                    And beyond — from creative entrepreneurship and fashion to theatre,
                    technology, festivals, and exhibitions.
                </p>
            </section>

            {/* ================= PERSPECTIVE (MISSION EMBEDDED) ================= */}
            <section className="bg-[#111111] text-white">
                <div className="max-w-6xl mx-auto px-6 py-24">
                    <h2 className="font-serif text-3xl mb-8">Our Perspective</h2>

                    <div className="max-w-3xl space-y-6 text-gray-300 leading-relaxed">
                        <p>
                            We believe African art is not just entertainment — it is memory,
                            resistance, identity, and possibility.
                        </p>

                        <p>
                            Our work sits at the intersection of celebration and critique.
                            We ask questions, challenge narratives, and dig into the context
                            behind the art we consume daily.
                        </p>

                        <p>
                            SanaaThruMyLens exists to inform, inspire, and spark meaningful
                            conversations about creativity in Africa and the diaspora.
                        </p>
                    </div>
                </div>
            </section>

            {/* ================= TEAM ================= */}
            <section className="max-w-6xl mx-auto px-6 py-20">
                <h2 className="font-serif text-3xl mb-12">The People Behind the Lens</h2>

                <div className="grid sm:grid-cols-2 gap-12 max-w-4xl">
                    <div>
                        <h3 className="font-semibold text-lg">Sharon Agigi</h3>
                        <p className="text-sm text-gray-600 mb-3">Founder</p>
                        <p className="text-gray-700 leading-relaxed">
                            Cultural storyteller passionate about African music, film,
                            and creative identity.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-lg">Elijoy Gatwiri</h3>
                        <p className="text-sm text-gray-600 mb-3">Editor</p>
                        <p className="text-gray-700 leading-relaxed">
                            Shapes conversations around art, culture, and emerging African voices.
                        </p>
                    </div>
                </div>
            </section>

            {/* ================= NEWSLETTER CTA ================= */}
            <section className="border-t border-gray-300">
                <div className="max-w-6xl mx-auto px-6 py-20">
                    <h2 className="font-serif text-3xl mb-6">
                        Join the Conversation
                    </h2>

                    <p className="text-gray-700 max-w-2xl mb-8 leading-relaxed">
                        Get weekly insights, reviews, and cultural stories from across
                        Africa — delivered straight to your inbox.
                    </p>

                    {/* Hook this to the same newsletter logic as your homepage */}
                    <Link
                        href="/subscribe"
                        className="inline-block px-6 py-3 border border-[#111111] rounded hover:bg-[#111111] hover:text-white transition-colors"
                    >
                        Subscribe to the Newsletter
                    </Link>
                </div>
            </section>
        </main>
    );
}
