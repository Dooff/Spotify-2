import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import spotifyApi, { LOGIN_URL } from "../../../lib/spotify";


async function refreshAccessToken(token) {
  try {

    spotifyApi.setAccessToken(token.accessToken);
    spotifyApi.setRefreshToken(token.refreshToken);
    
    const { body: refreshedToken } = await spotifyApi.refreshAccessToken();
    console.log("REFRESHED TOKEN IS: ", refreshedToken);

    return {
      ...token,
      accessToken: refreshedToken.access_token,
      accessTokenExpires: Date.now + refreshedToken.expires_in * 1000, // lo convertimos en horas (1hora) ya que spotify api nos devuelve 3600s
      refreshToken: refreshedToken.refresh_token ?? token.refreshToken,
      //Cambiamos el token por el nuevo, en cualquier otro caso dejamos el anterior existente
    }

  }

  catch (error) {
    console.log(error.error);

    return {
      ...token,
      error:"RefreshAccessTokenError",
    };
  }
}

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    SpotifyProvider({
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
      authorization: LOGIN_URL,
    }),
    // ...add more providers here
  ],
  secret: process.env.JWT_SECRET,
  pages : {
    signIn: '/login'
  },
  callbacks: {
    async jwt({token, account, user}) {
      //initial sign in
      if(account && user) {
        return {
          ...token,
          accessToken: account.accessToken,
          refreshToken: account.refresh_token,
          username: account.providerAccountId,
          accessTokenExpires: account.expires_at * 1000, //obtenemos el valor en milisegundos y lo multiplicamos * 1000 1hora
        }
      }

      //Retorna el token anterior si no ha expirado aún
      if(Date.now < token.accessTokenExpires){
        console.log("EL TOKEN DE ACCESO EXISTENTE ES VÁLIDO");
        return token
      }

      //Si el token expira lo refrescamos
      console.log("EL TOKEN DE ACCESO HA EXPIRADO, ACTUALIZANDO...");
      return await refreshAccessToken(token);
    },

    async session({ session, token }) {
      session.user.accessToken = token.accessToken;
      session.user.refreshToken = token.refreshToken;
      session.user.username = token.username;

      return session;
    }
  }
})