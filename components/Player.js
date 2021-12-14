import { useSession } from "next-auth/react";
import { useState } from "react";
import { useRecoilState } from "recoil";
import useSpotify from "../hooks/useSpotify";
import { isPlayingState, currentTrackIdState } from "../atoms/songAtom";
import useSongInfo from "../hooks/useSongInfo";
import { useEffect, useCallback } from "react";
import { HeartIcon, VolumeUpIcon as VolumeDownIcon, } from "@heroicons/react/outline";
import { RewindIcon, FastForwardIcon, PauseIcon, PlayIcon, VolumeUpIcon, SwitchHorizontalIcon, ReplyIcon } from "@heroicons/react/solid";
import { debounce } from "lodash";

function Player() {

    const spotifyApi = useSpotify();
    const { data: session, status } = useSession();
    const [currentTrackId, setCurrentTrackId] = useRecoilState(currentTrackIdState);
    const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);
    const [volume, setVolume] = useState(50);
    const songInfo = useSongInfo();

    const fetchCurrentSong = () => {
        console.log(songInfo);
        if(!songInfo){
            spotifyApi.getMyCurrentPlayingTrack().then((data) => {
                console.log("Reproduciendo: ", data.body?.item, data);
                setCurrentTrackId(data.body?.item?.id);

                spotifyApi.getMyCurrentPlaybackState().then((data) => {
                    setIsPlaying(data.body?.is_playing);
                })
            });
        }
    }

    const handlePlayPause = () => {
        spotifyApi.getMyCurrentPlaybackState().then((data) => {
            if(data.body?.is_playing) {
                spotifyApi.pause().catch((err) => console.log("Error when pausing: ", err.message));
                setIsPlaying(false);
            }else {
                spotifyApi.play().catch((err) => console.log("Error when playing (play button): ", err.message));
                setIsPlaying(true);
            }
        });
    }

    useEffect(() => {
        if(spotifyApi.getAccessToken() && !currentTrackId){
            //fecth song info
            fetchCurrentSong();
            setVolume(50);
        }

    }, [currentTrackId, spotifyApi, session]);

    useEffect(() => {
        if(volume > 0 && volume < 100)
            debounceAdjustVolume(volume);
    }, [volume]);

    const debounceAdjustVolume = useCallback(
        //Should check for active device 
        debounce((volume) => {
            spotifyApi.setVolume(volume).catch((err) => console.log("Error when updating volume: ", err.message));
        }, 500), 
        []
    );

    return (
        <div className="h-24 bg-gradient-to-b from-black to-gray-900 text-white grid grid-cols-3 text-xs md:text-base px-2 md:px-8">
            {/* Left */}
            <div className="flex items-center space-x-4">
                <img className="hidden md:inline h-10 w-10" src={songInfo?.album?.images?.[0]?.url} />
                <div>
                    <h3>{songInfo?.name}</h3>
                    <p>{songInfo?.artists?.[0]?.name}</p>
                </div>
            </div>

            {/* Center */}

            <div className="flex items-center justify-evenly">
                <SwitchHorizontalIcon className="button" />
                <RewindIcon onClick={() => spotifyApi.skipToPrevious()} className="button" />

                {isPlaying ? (
                    <PauseIcon onClick={handlePlayPause} className="button w-10 h-10" />
                ) : (
                    <PlayIcon onClick={handlePlayPause} className="button w-10 h-10" />
                )}
                <FastForwardIcon onClick={() => spotifyApi.skipToNext()} className="button" />
                <ReplyIcon className="button" />
            </div>

            {/* Right */}
            <div className="flex items-center space-x-3 md:space-x-4 justify-end pr-5">
                <VolumeDownIcon className="button" onClick={() => volume > 0 && setVolume(volume - 10)} />
                <input className="w-14 md:w-28" type="range" value={volume} onChange={(e) => setVolume(Number(e.target.value))} min={0} max={100} />
                <VolumeUpIcon className="button" onClick={() => volume < 100 && setVolume(volume + 10)} />
            </div>
        </div>
    )
}

export default Player;
