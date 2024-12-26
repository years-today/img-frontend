'use client';

import { useEffect, useState } from 'react';

interface Video {
    author: string;
    description: string;
    link: string;
    vidId: string;
    title: string;
    // Using camelCase for datePublished
    datePublished: string;
}

export default function DailyVideosPage() {
    const [videos, setVideos] = useState<Video[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const fetchVideos = async () => {
        try {
          // Update the URL to your actual endpoint
          const response = await fetch('http://127.0.0.1:5050/api/videos/today');
          const { videos } = await response.json();
          setVideos(videos);
        } catch (error) {
          console.error('Error fetching videos:', error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchVideos();
    }, []);
  
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
        return '';
      }
    };
  
    const handleNextVideo = () => {
      if (!videos.length) return;
      // Randomly pick a new index from the entire list
      const randomIndex = Math.floor(Math.random() * videos.length);
      setCurrentIndex(randomIndex);
      setIsPlaying(true);
    };
  
    const handlePreviousVideo = () => {
      // If you wanted a purely random selection for 'Previous' as well,
      // you could do the same random approach. For example:
      // setCurrentIndex(Math.floor(Math.random() * videos.length));
      // or simply move backward by 1:
      setCurrentIndex((prev) => {
        if (prev === 0) return videos.length - 1;
        return prev - 1;
      });
      setIsPlaying(true);
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
  
    if (loading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <p>Loading daily videos...</p>
        </div>
      );
    }
  
    if (!videos.length) {
      return (
        <div className="flex h-screen items-center justify-center">
          <p>No videos available today.</p>
        </div>
      );
    }
  
    // Current video link -> parse out the ID
    const currentVideoLink = videos[currentIndex].link;
    const currentVideoId = getVideoIdFromLink(currentVideoLink);
  
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-8">
        <h1 className="text-2xl font-bold mb-6">Daily Videos</h1>
  
        <div className="w-full max-w-xl aspect-video mb-6">
          <iframe
            className="w-full h-full rounded"
            src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=${isPlaying ? 1 : 0}`}
            title="YouTube video player"
            allowFullScreen
          />
        </div>
  
        {/* Controls */}
        <div className="flex space-x-4">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={handlePreviousVideo}
          >
            Previous
          </button>
  
          <button
            className={`px-4 py-2 rounded text-white ${
              isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            }`}
            onClick={handlePausePlay}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
  
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={handleNextVideo}
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