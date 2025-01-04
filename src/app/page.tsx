'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Import necessary hooks
import copy from 'copy-to-clipboard';
import YouTube, { YouTubePlayer, YouTubeEvent } from 'react-youtube';

interface Video {
    author: string;
    description: string;
    link: string;
    id: string;
    title: string;
    datePublished: string;
    viewCount: string;
}

export default function DailyVideosPage() {
    const [remainingVideos, setRemainingVideos] = useState<Video[]>([]);
    const [currentVideo, setCurrentVideo] = useState<Video | null>(null);
    const [backStack, setBackStack] = useState<Video[]>([]);
    const [fwdStack, setFwdStack] = useState<Video[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const searchParams = useSearchParams();

    const [player, setPlayer] = useState< YouTubePlayer >(null);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                // Update the URL to your actual endpoint
                const response = await fetch('https://api.years.today/api/videos/today');
                const { videos } = await response.json();
                setRemainingVideos(videos);

                const videoIdParam = searchParams.get('videoId');

                if (videoIdParam) {
                    // If a videoId is present in the URL, find that video
                    const initialVideo = videos.find((video: { id: string; }) => video.id === videoIdParam);
                    if (initialVideo) {
                        setCurrentVideo(initialVideo);
                        setBackStack([]);
                        setRemainingVideos(videos.filter((video: { id: string; }) => video.id !== videoIdParam));
                    } else {
                        // If not found, create a fallback Video object
                        const fallbackVideo: Video = {
                            author: 'Unknown Author',
                            description: 'This video is not available in today\'s list.',
                            link: `https://www.youtube-nocookie.com/watch?v=${videoIdParam}`,
                            id: videoIdParam,
                            title: 'Unknown Video',
                            datePublished: 'Unknown Date',
                            viewCount: '-1'
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
    }, []);
    // potential bug: https://chatgpt.com/share/676e5c6f-0798-8001-86ae-16f74bd7a128

    // logging (DELETE later)
    useEffect(() => {
        console.log('remainingVideos changed:', remainingVideos);
        console.log('backStack:', backStack);
        console.log('fwdStack:', fwdStack);
    }, [remainingVideos]);

    //Volume
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!player) return;
    
            if (e.key === 'ArrowUp') {
                // Increase volume by 10
                const currentVolume = player.getVolume();
                const newVolume = Math.min(currentVolume + 10, 100);
                player.setVolume(newVolume);
            } else if (e.key === 'ArrowDown') {
                // Decrease volume by 10
                const currentVolume = player.getVolume();
                const newVolume = Math.max(currentVolume - 10, 0);
                player.setVolume(newVolume);
            }
        };
    
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [player]);

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

    const getNumberFromTitle = (title: string ): string | null => {
        const match = title.match(/\d{4}/);
        return match ? match[0] : null;
    }
    const checkViews = (count: string): string | null => count === '-1' ? null : count;

    const formatDate = (dateString: string): string | null => {
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            return null;
        }
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        const day = date.getUTCDate(); // 1 - 31
        const month = months[date.getUTCMonth()]; // 0 - 11
        const year = date.getUTCFullYear();
        
        return `${day} ${month} ${year}`;
    }


    const selectRandomVideo = (allVideos: Video[], availableVideos: Video[]) => {
        if (availableVideos.length === 0) {

            // TODO: batch load new videos from archive
            setCurrentVideo(null);
            return;
        }

        const randomIndex = Math.floor(Math.random() * availableVideos.length);
        const selectedVideo = availableVideos[randomIndex];

        setCurrentVideo(selectedVideo);
        setBackStack(prevHistory => [...prevHistory, selectedVideo]); // Append to backStack
        setRemainingVideos(availableVideos.filter((_, index) => index !== randomIndex));
        // setIsPlaying(false);

        // Update the URL with the new videoId
        router.replace(`?videoId=${selectedVideo.id}`);
    };

    const handleNextVideo = () => {
        if (!currentVideo) return;

        // If user previously clicked “Back” and we have something in forwardStack,
        // we should use that “next” item so that going forward returns to the same video.
        if (fwdStack.length > 0) {
            // 1) Move currentVideo onto the backStack
            setBackStack((prev) => [...prev, currentVideo]);
            // 2) Pop from the forwardStack to get the new current
            const nextVideo = fwdStack[fwdStack.length - 1];
            setFwdStack((prev) => prev.slice(0, prev.length - 1));
            // 3) Set it as current
            setCurrentVideo(nextVideo);
            setIsPlaying(true);
            // router.replace(...) if you want the URL to reflect nextVideo.id
            router.replace(`?videoId=${nextVideo.id}`);

        } else {
            // No “forward” video is waiting; pick a random from remaining
            if (remainingVideos.length === 0) {
                alert('All videos for today watched!');
                return;
            }

            const randomIndex = Math.floor(Math.random() * remainingVideos.length);
            const selectedVideo = remainingVideos[randomIndex];

            // 1) Move currentVideo onto the backStack
            setBackStack((prev) => [...prev, currentVideo]);
            // 2) Clear the forwardStack because we’re branching to a new path
            setFwdStack([]);
            // 3) Set new currentVideo
            setCurrentVideo(selectedVideo);
            setRemainingVideos((prev) =>
                prev.filter((_, idx) => idx !== randomIndex)
            );
            setIsPlaying(true);
            router.replace(`?videoId=${selectedVideo.id}`);
        }
    };

    const handlePreviousVideo = () => {
        // If there’s nothing in backStack, we can’t go “back”
        if (backStack.length === 0 || !currentVideo) return;
      
        // 1) Push currentVideo onto the forwardStack
        setFwdStack((prev) => [...prev, currentVideo]);
      
        // 2) Pop from backStack to become the new current
        const prevVideo = backStack[backStack.length - 1];
        setBackStack((prev) => prev.slice(0, prev.length - 1));
      
        // 3) Set as current
        setCurrentVideo(prevVideo);
        setIsPlaying(true);
        router.replace(`?videoId=${prevVideo.id}`);
      };


    const handlePausePlay = () => {
        if (player) {
            if (isPlaying) {
                player.pauseVideo();
            } else {
                player.playVideo();
            }
        }
        setIsPlaying(!isPlaying);
    };

    const handleGoToStart = () => {
        // For a real "go to start" feature, you'd use the YouTube Player API
        // to seek to 0. Here, we'll just reset isPlaying to force reload.

        if (player) {
            player.seekTo(0);
        }
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

    const onReady = (event: YouTubeEvent ) => {
        setPlayer(event.target);
        // setIsPlaying(false);
        event.target.setVolume(10);
    }

    const onStateChange = (event: YouTubeEvent) => {
        // YouTube player states: 1=playing, 2=paused, etc.
        if (event.data === 1) {
            setIsPlaying(true);
        } else if (event.data === 2) {
            setIsPlaying(false);
        }
    };

    const opts = {
        width: '100%',
        height: '100%',
        playerVars: {
            autoplay: isPlaying ? 1 : 0,
            controls: 0,
            rel: 0,
            modestbranding: 1,
            iv_load_policy: 3,
            playsinline: 1,
        },
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-8 relative">
            {/* Header with Share Button */}
            <header className="w-full max-w-xl flex justify-between items-center mb-6 px-4">
                <h1 className="text-2xl font-bold">years.today</h1>

                {getNumberFromTitle(currentVideo.title) && (
                    <h3>title {getNumberFromTitle(currentVideo.title)}</h3>
                )}
                {checkViews(currentVideo.viewCount) && (
                    <h3>views {checkViews(currentVideo.viewCount)}</h3>
                )}
                {formatDate(currentVideo.datePublished) && (
                    <h3>{formatDate(currentVideo.datePublished)}</h3>
                )}

                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={handleShare}
                >
                    Share
                </button>
            </header>

            {/* ---------- Video Container: aspect ratio locked ---------- */}
            <div
                id="player-container"
                className="w-[1440px] max-w-xl aspect-video mb-6 relative overflow-hidden"
            >
                {/* Make the YouTube iframe absolutely fill the container */}
                <div className="absolute inset-0">
                    <YouTube
                        videoId={currentVideoId}
                        opts={opts}
                        onReady={onReady}
                        onStateChange={onStateChange}
                        className="absolute w-[300%] h-full left-[-100%]" // ensures the iframe fills its parent
                    />

                    {/* ---------- OVERLAY ---------- */}
                    <div
                        className="screen-container absolute inset-0 z-10"
                        style={{ pointerEvents: 'all' }} // blocks user clicks
                        onClick={handlePausePlay}
                    >
                    </div>
                </div>
            </div>

            {/* ---------- Controls ---------- */}
            <div className="flex space-x-4 mb-4">
                <button
                    className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    onClick={handlePreviousVideo}
                    disabled={backStack.length === 0}
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