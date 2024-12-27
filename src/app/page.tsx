'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Import necessary hooks
import copy from 'copy-to-clipboard';

interface Video {
    author: string;
    description: string;
    link: string;
    id: string;
    title: string;
    datePublished: string;
}

export default function DailyVideosPage() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [remainingVideos, setRemainingVideos] = useState<Video[]>([]);
    const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
    const [history, setHistory] = useState<Video[]>([]);
    const [isPlaying, setIsPlaying] = useState(true);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                // Update the URL to your actual endpoint
                const response = await fetch('https://api.years.today/api/videos/today');
                const { videos } = await response.json();
                setVideos(videos);
                setRemainingVideos(videos);

                const videoIdParam = searchParams.get('videoId');

                if (videoIdParam) {
                    // If a videoId is present in the URL, find that video
                    const initialVideo = videos.find((video: { id: string; }) => video.id === videoIdParam);
                    if (initialVideo) {
                        setCurrentVideo(initialVideo);
                        setHistory([initialVideo]);
                        setRemainingVideos(videos.filter((video: { id: string; }) => video.id !== videoIdParam));
                    } else {
                        // If not found, create a fallback Video object
                        const fallbackVideo: Video = {
                            author: 'Unknown Author',
                            description: 'This video is not available in today\'s list.',
                            link: `https://www.youtube.com/watch?v=${videoIdParam}`,
                            id: videoIdParam,
                            title: 'Unknown Video',
                            datePublished: 'Unknown Date',
                        };
                        setCurrentVideo(fallbackVideo);
                    }
                    return;
                }

                // If no videoId param, select a random video
                if (videos.length > 0) {
                    selectRandomVideo(videos, videos);
                }
            } catch (error) {
                console.error('Error fetching videos:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, [searchParams]);

    useEffect(() => {
        console.log('remainingVideos changed:', remainingVideos);
      }, [remainingVideos]);

    /**
     * Helper to extract the YouTube video ID from a standard
     * 'https://www.youtube.com/watch?v=xyz' link.
     */
    const getVideoIdFromLink = (link: string): string => {
        try {
            const url = new URL(link);
            return url.searchParams.get('v') || '';
        } catch (err) {
            console.error('Invalid YouTube URL:', link);
            console.log(err);
            return '';
        }
    };

    const selectRandomVideo = (allVideos: Video[], availableVideos: Video[]) => {
        if (availableVideos.length === 0) {
            // TODO: batch load new videos from archive
            setCurrentVideo(null);
            return;
        }

        const randomIndex = Math.floor(Math.random() * availableVideos.length);
        const selectedVideo = availableVideos[randomIndex];

        setCurrentVideo(selectedVideo);
        setHistory(prevHistory => [...prevHistory, selectedVideo]); // Append to history
        setRemainingVideos(availableVideos.filter((_, index) => index !== randomIndex));
        setIsPlaying(true);

        // Update the URL with the new videoId
        router.replace(`?videoId=${selectedVideo.id}`);
    };

    const handleNextVideo = () => {
        if (remainingVideos.length === 0) {
            // Load new ones here or notify the user
            alert('All videos for today watched!');
            return;
        }

        selectRandomVideo(videos, remainingVideos);
    };

    const handlePreviousVideo = () => {
        if (history.length <= 1) {
            return;
        }

        const newHistory = [...history];
        const lastVideo = newHistory.pop();
        if (lastVideo) {
            setRemainingVideos(prev => [...prev, lastVideo]); // Optionally, add back to remainingVideos
            setCurrentVideo(newHistory[newHistory.length - 1]);
            setHistory(newHistory);
            setIsPlaying(true);

            // Update the URL with the previous videoId
            const previousVideoId = newHistory[newHistory.length - 1].id;
            router.replace(`?videoId=${previousVideoId}`);
        }
    };

    const handlePausePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const handleGoToStart = () => {
        // For a real "go to start" feature, you'd use the YouTube Player API
        // to seek to 0. Here, we'll just reset isPlaying to force reload.
        setIsPlaying(false);
        setTimeout(() => setIsPlaying(true), 200);
    };

    const handleShare = () => {
        if (!currentVideo) return;

        const currentUrl = window.location.origin + window.location.pathname;
        const shareUrl = `${currentUrl}?videoId=${currentVideo.id}`;

        // Copy the URL to the clipboard
        const isCopied = copy(shareUrl);
        if (isCopied) {
            alert('Share link copied to clipboard!');
        } else {
            alert('Failed to copy the link. Please copy it manually.');
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p>Loading daily videos...</p>
            </div>
        );
    }

    if (!currentVideo) {
        return (
            <div className="flex h-screen items-center justify-center">
                <p>No videos available today.</p>
            </div>
        );
    }

    // Current video link -> parse out the ID
    const currentVideoLink = currentVideo.link;
    const currentVideoId = getVideoIdFromLink(currentVideoLink);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-8 relative">
            {/* Header with Share Button */}
            <header className="w-full max-w-xl flex justify-between items-center mb-6 px-4">
                <h1 className="text-2xl font-bold">Daily Videos</h1>
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={handleShare}
                >
                    Share
                </button>
            </header>

            <div className="w-full max-w-xl aspect-video mb-6">
                <iframe
                    className="w-full h-full rounded"
                    src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=${isPlaying ? 1 : 0}`}
                    title="YouTube video player"
                    allowFullScreen
                />
            </div>

            {/* Controls */}
            <div className="flex space-x-4 mb-4">
                <button
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    onClick={handlePreviousVideo}
                    disabled={history.length <= 1}
                >
                    Previous
                </button>

                <button
                    className={`px-4 py-2 rounded text-white ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                        }`}
                    onClick={handlePausePlay}
                >
                    {isPlaying ? 'Pause' : 'Play'}
                </button>

                <button
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    onClick={handleNextVideo}
                    disabled={remainingVideos.length === 0}
                >
                    Next (Random)
                </button>
            </div>

            <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleGoToStart}
            >
                Go to Start
            </button>
        </div>
    );
}