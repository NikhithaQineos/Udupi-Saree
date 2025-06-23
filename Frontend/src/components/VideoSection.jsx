import React from "react";
import "./Video.css";

const VideoSection = () => {
  const videos = [
    {
      id: 1,
      src: "videos/saree-video-1.mp4",
      title: "Modern Style Of Saree Draping - Fashion Friendly",
    },
    {
      id: 2,
      src: "videos/saree-video-2.mp4",
      title: "How to Drape a Gown Saree - Saree Wearing Styles - Glamrs",
    },
    {
      id: 3,
      src: "videos/saree-video-3.mp4",
      title: "Pick a Blouse & Can-Can Skirt - Saree Styling",
    },
    {
      id: 4,
      src: "videos/saree-video-4.mp4",
      title: "Classic Saree Draping Style - Traditional Look",
    },
  ];

  return (
    <div className="video-section">
      <h2 className="video-heading">Saree Draping Styles</h2>
      <div className="video-grid">
        {videos.map((video) => (
          <div key={video.id} className="video-item">
            <video
              muted
              loop
              preload="metadata"
              onMouseOver={(e) => window.innerWidth >= 1024 && e.target.play()}
              onMouseOut={(e) => window.innerWidth >= 1024 && e.target.pause()}
              onTouchStart={(e) => e.target.play()}
              onTouchEnd={(e) => e.target.pause()}
            >
              <source src={video.src} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <p className="video-title">{video.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoSection;
