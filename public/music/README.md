# Recorded music

The game ships with 15 synthesised tracks. To add real, produced tracks (your own, or licensed from Nigerian producers),
drop audio files here and list them in `index.json`. The game loads them at start-up and mixes them in with the synthesised
library, matching by mood and station:

    {
      "tracks": [
        { "id": "my_amapiano_loop", "name": "My Amapiano Loop", "file": "my_amapiano_loop.mp3",
          "mood": "medium", "stations": ["amapiano"], "gain": 1 }
      ]
    }

- `mood`: calm, chill, medium, high, tense, triumph or sad. A recorded track plays in the situations where a synthesised track
  of that mood would play (about half the time, when the case rolls an even seed).
- `stations`: any of afrobeats, amapiano, chill, street. Players who pick a station only hear matching tracks.
- Use seamless loops (2 to 4 minutes, MP3 or OGG). Recorded tracks are looped and crossfaded; they do not react to Heat
  within the song, so make a calm, a medium and a tense version of each style.
- Only publish music you have the rights to use.
