'use client';

import VideoSection from '@/app/VideoSection';
import AboutSection from '@/app/AboutSection';
import ContactSection from '@/app/ContactSection';
import SectionIndicator from '@/app/SectionIndicator';
import { useRef } from 'react';

export default function DailyVideosPage() {
    
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div className="snap-container" ref={containerRef}>
            <SectionIndicator containerRef={containerRef} />
            <VideoSection />
            <AboutSection />
            <ContactSection />
        </div>
    );
}