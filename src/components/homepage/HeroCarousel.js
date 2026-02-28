import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import heroImage1 from "@/assets/hero-1.webp";
import heroImage2 from "@/assets/hero-2.webp";
import heroImage3 from "@/assets/hero-3.webp";

const slides = [
    {
        image: heroImage1,
        title: "Latest from the Creative Ecosystem",
        subtitle:
            "Connecting master craftspeople with emerging artists to ensure Kenya's creative legacy continues to evolve and inspire.",
    },
    {
        image: heroImage2,
        title: "Sanaa Thru' My Lens",
        subtitle:
            "Exploring Kenya's vibrant art and creative culture through authentic stories, emerging artists, and cultural heritage.",
    },
    {
        image: heroImage3,
        title: "Stories That Shape Culture",
        subtitle:
            "Discover the voices, visions, and traditions driving East Africa's creative renaissance.",
    },
];

const HeroCarousel = () => {
    const [current, setCurrent] = useState(0);

    const next = useCallback(
        () => setCurrent((c) => (c + 1) % slides.length),
        []
    );
    const prev = useCallback(
        () => setCurrent((c) => (c - 1 + slides.length) % slides.length),
        []
    );

    useEffect(() => {
        const id = setInterval(next, 6000);
        return () => clearInterval(id);
    }, [next]);

    return (
        <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
            {/* Slides */}
            {slides.map((slide, i) => (
                <div
                    key={i}
                    className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0"
                        }`}
                    style={{ backgroundImage: `url(${slide.image})` }}
                />
            ))}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />

            {/* Arrows */}
            <button
                onClick={prev}
                aria-label="Previous slide"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button
                onClick={next}
                aria-label="Next slide"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Content — bottom left */}
            <div className="absolute bottom-0 left-0 right-0 z-20 px-6 sm:px-10 lg:px-16 pb-16">
                <div className="max-w-xl">
                    <h1 className="font-poppins font-bold text-2xl sm:text-3xl md:text-4xl text-white leading-tight mb-3">
                        {slides[current].title}
                    </h1>
                    <p className="font-lora text-sm sm:text-base text-white/85 leading-relaxed">
                        {slides[current].subtitle}
                    </p>
                </div>
            </div>

            {/* Dots */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${i === current ? "bg-white" : "bg-white/40"
                            }`}
                    />
                ))}
            </div>
        </section>
    );
};

export default HeroCarousel;
