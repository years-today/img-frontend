'use client';

import VideoSection from '@/app/VideoSection';
import AboutSection from '@/app/AboutSection';
import ContactSection from '@/app/ContactSection';

export default function DailyVideosPage() {

    return (
        <div className="snap-container">
            <VideoSection />
            <AboutSection />
            <ContactSection />
        </div>
    );
}