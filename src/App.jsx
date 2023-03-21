import React, { useState, useEffect } from "react";
import ReactPlayer from "react-player";
import "./App.css";
import { listSongs } from "./graphql/queries";
import { updateSong, createSong } from "./graphql/mutations";
import { Amplify, API, graphqlOperation, Storage } from "aws-amplify";
import { v4 as uuid } from "uuid";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PauseIcon from "@mui/icons-material/Pause";
import AddIcon from "@mui/icons-material/Add";
import PublishIcon from "@mui/icons-material/Publish";

import awsExports from "./aws-exports";

import { Authenticator, Loader, Button } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(awsExports);

function App() {
  const [songs, setSongs] = useState([]);
  const [songPlaying, setSongPlaying] = useState("");
  const [audioURL, setAudioURL] = useState("");
  const [showAddSong, setShowAddSong] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchSongs = async () => {
    try {
      const songData = await API.graphql(graphqlOperation(listSongs));
      const songList = songData.data.listSongs.items;
      console.log("song list", songList);
      setSongs(songList);
      setLoading(false);
    } catch (error) {
      console.log("error on fetching songs", error);
    }
  };

  const addLike = async (i) => {
    try {
      const song = songs[i];
      song.likes = song.likes + 1;
      delete song.createdAt;
      delete song.updatedAt;

      const songData = await API.graphql(
        graphqlOperation(updateSong, { input: song })
      );
      const songList = [...songs];
      songList[i] = songData.data.updateSong;
      setSongs(songList);
    } catch (error) {
      console.log("error on adding like to song", error);
    }
  };

  const toggleSong = async (i) => {
    if (songPlaying === i) {
      setSongPlaying("");
      return;
    }

    const songFilePath = songs[i].filePath;
    try {
      const fileAccessURL = await Storage.get(songFilePath, { expires: 60 });
      console.log("fileAccessURL:", fileAccessURL);
      setSongPlaying(i);
      setAudioURL(fileAccessURL);
      return;
    } catch (error) {
      console.error("error accessing the file from s3", error);
      setAudioURL("");
      setSongPlaying("");
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchSongs();
  }, []);

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div className="App">
          {
            <header className="App-header">
              <h1>Hello, {user.attributes.name}!</h1>
              <Button variation="primary" onClick={signOut}>Sign out</Button>
            </header>
          }
          {loading ? (
            <div className="loaderContainer">
              <Loader variation="linear" />
            </div>
          ) : (
            <div className="songList">
              {songs.length
                ? songs.map((song, i) => {
                    return (
                      <Paper variant="outlined" key={`song${i}`}>
                        <div className="songCard">
                          <div className="playButtonColumn">
                            <IconButton
                              aria-label="play"
                              onClick={() => toggleSong(i)}
                            >
                              {songPlaying === i ? (
                                <PauseIcon />
                              ) : (
                                <PlayArrowIcon />
                              )}
                            </IconButton>
                          </div>
                          <div className="titleColumn">
                            <div className="songTitle">{song.title}</div>
                            <div className="songOwner">{song.owner}</div>
                          </div>
                          <div className="favoriteColumn">
                            <IconButton
                              aria-label="like"
                              onClick={() => addLike(i)}
                            >
                              <FavoriteIcon />
                            </IconButton>
                            {song.likes}
                          </div>
                          <div className="songDescriptionColumn">
                            {song.description}
                          </div>
                        </div>
                        {songPlaying === i ? (
                          <div className="ourAudioPlayer">
                            <ReactPlayer
                              url={audioURL}
                              controls
                              playing
                              height="50px"
                              onPause={() => toggleSong(i)}
                            />
                          </div>
                        ) : null}
                      </Paper>
                    );
                  })
                : null}
              {showAddSong ? (
                <AddSong
                  onUpload={() => {
                    setShowAddSong(false);
                    fetchSongs();
                  }}
                />
              ) : (
                <IconButton sx={{width: 40, alignSelf: "center"}} onClick={() => setShowAddSong(true)}>
                  <AddIcon />
                </IconButton>
              )}
            </div>
          )}
        </div>
      )}
    </Authenticator>
  );
}

export default App;

const AddSong = ({ onUpload }) => {
  const [songData, setSongData] = useState({});
  console.log("🚀🚀 ~ file: App.jsx:151 ~ AddSong ~ songData:", songData);
  const [mp3Data, setMp3Data] = useState();
  console.log("🚀🚀 ~ file: App.jsx:153 ~ AddSong ~ mp3Data:", mp3Data);

  const uploadSong = async () => {
    console.log("songData", songData);
    const { title, description, owner } = songData;

    const { key } = await Storage.put(`${uuid()}.mp3`, mp3Data, {
      contentType: "audio/mp3",
    });

    const createSongInput = {
      id: uuid(),
      title,
      description,
      owner,
      filePath: key,
      likes: 0,
    };
    await API.graphql(graphqlOperation(createSong, { input: createSongInput }));

    onUpload();
  };

  return (
    <div className="newSong">
      <TextField
        label="Title"
        value={songData.title}
        onChange={(e) => setSongData({ ...songData, title: e.target.value })}
      />
      <TextField
        label="Artist"
        value={songData.artist}
        onChange={(e) => setSongData({ ...songData, owner: e.target.value })}
      />
      <TextField
        label="Description"
        value={songData.description}
        onChange={(e) =>
          setSongData({ ...songData, description: e.target.value })
        }
      />
      <input
        type="file"
        accept="audio/mp3"
        onChange={(e) => setMp3Data(e.target.files[0])}
      />
      <IconButton onClick={uploadSong}>
        <PublishIcon />
      </IconButton>
    </div>
  );
};
