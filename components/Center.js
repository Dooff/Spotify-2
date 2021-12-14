import { ChevronDownIcon } from "@heroicons/react/outline";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { shuffle } from "lodash";
import { playlistIdState, playlistState } from "../atoms/playlistAtom";
import { useRecoilValue, useRecoilState } from "recoil";
import useSpotify from "../hooks/useSpotify";
import Songs from "./Songs";

const colors = [
    'from-indigo-500',
    'from-blue-500',
    'from-red-500',
    'from-green-500',
    'from-yellow-500',
    'from-pink-500', 
    'from-purple-500'
]

function Center() {
    const {data: session} = useSession();
    const [color, setColor] = useState(null);
    const spotifyApi = useSpotify();
    const playlistId = useRecoilValue(playlistIdState);
    const [playlist, setPlaylist] = useRecoilState(playlistState)
    
//cuando el componente carga usamos el use effect

    useEffect(() => {
        setColor(shuffle(colors).pop());
    }, [playlistId])

    useEffect(() => {
        spotifyApi.getPlaylist(playlistId).then((data) => {
            setPlaylist(data.body);
        })
        .catch((err) => console.log("Algo salió mal...", err));
    }, [spotifyApi, playlistId]);

    return (
        <div className="flex-grow h-screen overflow-y-scroll scrollbar-hide">            
            <header className="absolute top-5 right-8">
                <div className="flex items-center bg-black text-white space-x-3 opacity-90 
                hover:opacity-80 cursor-pointer rounded-full p-1 pr-2" onClick={signOut}>
                    <img className="rounded-full w-10 h-10" src={session?.user.image} />
                    <h2>{session?.user.name}</h2>
                    <ChevronDownIcon className="w-5 h-5" />
                </div>
            </header>

            <section className={`flex items-end space-x-7 bg-gradient-to-b to-black ${color} h-80 text-white p-8`}>
                <img className="h-44 w-44 shadow2xl" src={playlist?.images?.[0]?.url} />
                
                <div>
                    <p>PLAYLIST</p>
                    {/* clases del h1 -> texto adaptado a dispositivos de pantalla pequeña, después media y por último pantalla grande */}
                    <h1 className="text-2xl md:text-3xl xl:text-5xl font-bold">{playlist?.name}</h1>
                </div>
            </section>
            

            <div>
                <Songs />
            </div>
        </div>
    );
}

export default Center;
