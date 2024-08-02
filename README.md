# Spotify Song Similarity Analysis and Visualization

## Overview

Welcome to the Spotify Song Similarity Analysis and Visualization project! This tool is designed to analyze and visualize the similarities between the most popular songs on Spotify, using the "Most Streamed Spotify Songs 2024" dataset from Kaggle. The project features an interactive similarity map, allowing users to explore connections between songs based on their characteristics and popularity.

## Features:

- Data Retrieval: Automatically downloads and processes the "Most Streamed Spotify Songs 2024" dataset from Kaggle.

- Similarity Analysis: Calculates song similarities using various metrics, including Jaccard coefficient, Levenshtein distance, and cosine similarity.

- Interactive Visualization: Displays an interactive map with song nodes, where node size represents song popularity (number of streams). Users can zoom, pan, and get detailed information about each song.

- Audio Previews: Allows users to listen to song previews directly from the interface (if supported by the Spotify API).

- Clustering and Recommendations: Groups similar songs into clusters and provides song recommendations based on user selection.

- Tooltips: Displays song information when hovering over nodes.

## Getting Started:
## Prerequisites:

- Node.js

- npm

## Installation:

### Clone the repository:

```
git clone https://github.com/Stanislavstranger/spotify-similarity-map.git
```

### Navigate to the project directory:
```
cd spotify-song-similarity
```

### Install dependencies:
```
npm install
```

## Running the Application:

### Run the data retrieval script:
```
npm run dev
```
### Open your browser and navigate to:
```
 http://localhost:5173
```

## Usage:

- Explore the Map: Navigate through the interactive map to see how different songs are connected based on their similarity.
- Listen to Previews: Hover on a song node to listen to a preview (if available).
- Get Recommendations: Hover on a song to see a list of similar tracks.
- Cluster View: View clusters of similar songs to discover new music within the same genre or style.

## Technical Details:

- TypeScript: Main programming language
- Canvas API: For rendering the interactive map
- Spotify Web API: For retrieving song previews
- Kaggle: For downloading the dataset
- Modular Architecture: Following modern development practices with a component-based approach (mostly 😅)

> Note: I didn't stick to modular architecture everywhere due to time constraints, but trust me, I can do better! Imagine a world where every component is perfectly modular and you'll have a glimpse of my full potential. 😉

## Contact:

If you have any questions or suggestions, feel free to reach out to me at stanislavstranger@gmail.com

---

🙏 Thank you for using our Spotify Song Similarity Analysis and Visualization tool! Enjoy exploring the world of music with me.

