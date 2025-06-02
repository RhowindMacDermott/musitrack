import React, { useState, useEffect } from 'react';
import {
  getAuthUrl,
  getAccessTokenFromUrl,
  getUserProfile,
  getUserTopTracks,
  getUserRecentlyPlayed,
  getRecommendations,
} from './spotifyService';

function LoginButton() {
  const handleLogin = () => {
    window.location.href = getAuthUrl();
  };

  return (
    <div className="max-w-md mx-auto p-8 card rounded-xl text-center animate-gradient bg-gradient-to-r from-purple-800 via-violet-900 to-purple-800">
      <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
        Welcome to MusiTrack
      </h2>
      <p className="mb-8 text-gray-300">
        Discover your music journey and get personalized recommendations based on your taste.
      </p>
      <button
        onClick={handleLogin}
        className="btn w-full bg-gradient-to-r from-green-500 to-emerald-700 text-white py-3 px-6 rounded-lg font-semibold text-lg hover:from-green-600 hover:to-emerald-800 transform hover:scale-105 transition-all duration-300 shadow-lg"
      >
        Connect with Spotify
      </button>
    </div>
  );
}

function UserProfile({ profile, onLogout }) {
  return (
    <div className="card max-w-3xl mx-auto p-8 rounded-xl backdrop-blur-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Your Profile
        </h2>
        <button
          onClick={onLogout}
          className="btn bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 transform hover:scale-105 transition-all duration-300"
        >
          Log Out
        </button>
      </div>
      <div className="space-y-4">
        <p className="text-xl"><span className="text-gray-400">Name:</span> {profile.display_name}</p>
        <p className="text-xl"><span className="text-gray-400">Email:</span> {profile.email}</p>
        <p className="text-xl"><span className="text-gray-400">Country:</span> {profile.country}</p>
      </div>
    </div>
  );
}

function MusicRecommendations({ recommendations }) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="card max-w-3xl mx-auto p-8 mt-8 rounded-xl text-center">
        <p className="text-xl text-gray-400">Finding your perfect music matches...</p>
        <div className="animate-pulse mt-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-700 rounded-lg opacity-25"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card max-w-3xl mx-auto p-8 mt-8 rounded-xl">
      <h2 className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
        Recommended for You
      </h2>
      <div className="space-y-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="p-4 rounded-lg bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 transform hover:scale-102 transition-all duration-300"
          >
            <p className="font-semibold text-xl text-white">{rec.name}</p>
            <p className="text-gray-400">
              {rec.artists.map(a => a.name).join(', ')} - {rec.album.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [accessToken, setAccessToken] = useState(null);
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('Initializing...');

  useEffect(() => {
    const token = getAccessTokenFromUrl();
    if (token) {
      window.history.pushState({}, null, '/');
      setAccessToken(token);
      setDebugInfo('Connected to Spotify');
    } else {
      setDebugInfo('Ready to connect with Spotify');
    }
  }, []);

  useEffect(() => {
    if (!accessToken) return;

    async function fetchData() {
      try {
        const userProfile = await getUserProfile(accessToken);
        setProfile(userProfile);
        setDebugInfo('Loading your music preferences...');

        const topTracksData = await getUserTopTracks(accessToken);
        const seedTracks = topTracksData.items.map(track => track.id);

        const recsData = await getRecommendations(accessToken, seedTracks);
        setRecommendations(recsData.tracks);
        setDebugInfo('Your personalized recommendations are ready!');
      } catch (err) {
        setError(err.message);
        setDebugInfo('Something went wrong. Please try again.');
      }
    }

    fetchData();
  }, [accessToken]);

  const handleLogout = () => {
    setAccessToken(null);
    setProfile(null);
    setRecommendations([]);
    setDebugInfo('Ready to connect with Spotify');
  };

  if (error) {
    return (
      <div className="card max-w-md mx-auto p-6 rounded-xl text-center">
        <p className="text-red-400 mb-4">Error: {error}</p>
        <button
          onClick={handleLogout}
          className="btn bg-purple-600 text-white py-2 px-6 rounded-lg hover:bg-purple-700 transition-all duration-300"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div className="space-y-6">
        <LoginButton />
        <p className="text-center text-gray-400 animate-pulse">{debugInfo}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center mt-8">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-gray-400">{debugInfo}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8">
      <UserProfile profile={profile} onLogout={handleLogout} />
      <MusicRecommendations recommendations={recommendations} />
      <p className="text-center text-gray-400 text-sm">{debugInfo}</p>
    </div>
  );
}
