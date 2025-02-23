'use client';

import VideoSection from '@/app/VideoSection';
import AboutSection from '@/app/AboutSection';
import ContactSection from '@/app/ContactSection';
import SectionIndicator from '@/app/SectionIndicator';
import { useRef } from 'react';

export default function DailyVideosPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLDivElement>(null);
    const aboutRef = useRef<HTMLDivElement>(null);
    const contactRef = useRef<HTMLDivElement>(null);

    return (
        <div className="snap-container" ref={containerRef}>
            <SectionIndicator 
                containerRef={containerRef}
                videoRef={videoRef}
                aboutRef={aboutRef}
                contactRef={contactRef}
            />
            <div ref={videoRef}>
                <VideoSection />
            </div>
            <div ref={aboutRef}>
                <AboutSection />
            </div>
            <div ref={contactRef}>
                <ContactSection />
            </div>
        </div>
    );
}