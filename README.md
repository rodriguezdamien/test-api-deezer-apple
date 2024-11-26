# Deezer & Apple Music API Testing

Test des deux API des géantes plateformes musicales n'étant pas Spotify dans le cadre de mon stage.
Aucune Dev Token pour le MusicKit d'Apple n'est fourni dans ce code.

## Comment ça marche ?

Glisser une playlist de Deezer ou Apple Music de votre side bar à l'intérieur de la grosse boîte qui le demande, vous devriez voir des informations sur votre playlist.

Si vous ne voyez rien, il est fort probable que ça soit parce que vous êtes en local, et que le [Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/fr/docs/Web/HTTP/CORS) n'est pas activé. Pour régler le problème, il est possible d'installer l'une de ces deux extensions :

-   [CORS everywhere](https://addons.mozilla.org/fr/firefox/addon/cors-everywhere/) (Firefox)
-   [Allow CORS](https://chromewebstore.google.com/detail/allow-cors-access-control/lhobafahddgcelffkeicbaginigeejlf?hl=fr) (Chromium)

## Sérialisation des playlists

Voici la structure de l'objet playlist :

```json
{
  "id": ID de la playlist,
  "name": Nom de la playlist,
  "artwork": URL vers un artwork en 250*250 pixels,
  "nbTracks": Nombre de musique dans la playlist,
  "creatorName": Nom du créateur de la playlist,
  "creationDate": (TEMPORAIRE) Date de création pour Deezer, Date dernière modif pour Apple Musique,
  "desc": Description de la playlist,
  "tracks": [ Liste des musiques
    {
      "id": ID de la musique,
      "title": Titre de la musique,
      "artwork": URL vers un artwork en 250*250 pixels,
      "isrc": Code ISRC de la musique,
      "durationMs": Durée de la musique en milisecondes,
      "artist": Nom de l'artiste de la musique
    },
  ]
}
```

Cette structure est réalisé après passage de l'objet dans les fonctions de sérialisation présentent dans les fichiers `AppleMusicAPI.js` & `DeezerAPI.js`.

## Liens intéressants

- [Doc API Deezer](https://developers.deezer.com/api)
- [Doc API Apple Music](https://developer.apple.com/documentation/applemusicapi/)
- [Doc MusicKit on the Web](https://js-cdn.music.apple.com/musickit/v3/docs/index.html)

## Création d'un Developer Token pour l'API Apple Music

Pour créer un Token, vous avez deux choix :

Soit vous passez par le [script python ici](https://github.com/rodriguezdamien/appleMusicTokenGen) (Uniquement Linux)

Soit vous trouverez un guide ici :
[Guide de création d'un Developer Token Apple Music](DevToken.md)
