import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import SpotifyWebApi from "spotify-web-api-node";
import spotifyApi from "../lib/spotify";



function useSpotify() {
    const {data: session, status} = useSession();

    useEffect(() => {
        //Si el intento de token de acceso falla redirigimos al login 
        if(session)
            if(session.error === 'RefreshAccessTokenError')
                signIn();
                
        spotifyApi.setAccessToken(session?.user.accessToken);
    }, [session]);

    return spotifyApi;
}

export default useSpotify;