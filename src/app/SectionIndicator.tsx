'use client';


import { useEffect, useState, RefObject } from 'react';
import styles from './SectionIndicator.module.css';

const sections = ['Video', 'About', 'Contact'];

interface SectionIndicatorProps {
    containerRef: RefObject<HTMLDivElement | null>;
    videoRef: RefObject<HTMLDivElement | null>;
    aboutRef: RefObject<HTMLDivElement | null>;
    contactRef: RefObject<HTMLDivElement | null>;
}

export default function SectionIndicator({ containerRef, videoRef, aboutRef, contactRef }: SectionIndicatorProps) {
    const [currentSection, setCurrentSection] = useState(sections[0]);

    const handleScroll = () => {
        if (containerRef.current) {
            const scrollPositionTop = containerRef.current.scrollTop;
            const sectionHeight = window.innerHeight;

            const threshold =  0.2;


            if (scrollPositionTop < sectionHeight * threshold) {
                setCurrentSection(sections[0]); // Active when at least partially in the first section
            } else if (scrollPositionTop >= sectionHeight * (1 - threshold) && scrollPositionTop <= sectionHeight * (1 + threshold)) {
                setCurrentSection(sections[1]); // Active when at least partially in the second section
            } else if (scrollPositionTop >= (sectionHeight * (2 - threshold))) {
                setCurrentSection(sections[2]); // Active when at least partially in the third section
            } else {
                setCurrentSection('Between'); // When not in any section
            }

        }
    };

    const scrollToSection = (section: string) => {
        switch (section) {
            case 'Video':
                videoRef.current?.scrollIntoView({ behavior: 'smooth' });
                break;
            case 'About':
                aboutRef.current?.scrollIntoView({ behavior: 'smooth' });
                break;
            case 'Contact':
                contactRef.current?.scrollIntoView({ behavior: 'smooth' });
                break;
            default:
                break;
        }
    };


    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
        }
        return () => {
            if (container) {
                container.removeEventListener('scroll', handleScroll);
            }
        };
    }, [currentSection, containerRef]); // Add containerRef as a dependency

    return (
        <div className="fixed top-24 left-24">
            {sections.map((section) => (
                <h2 key={section} 
                    className={`${styles.sectionIndicator} ${currentSection === section ? styles.active : styles.inactive}`}
                    onClick={() => scrollToSection(section)}
                >
                    {section}
                </h2>
            ))}
        </div>
    );
}