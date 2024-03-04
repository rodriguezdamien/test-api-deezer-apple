import { devToken } from "./token.js";
var music = {};

/*
Explication de l'événement MusicKitLoaded :
Provoqué par le script de l'Apple Music Kit ajouté dans le HTML, elle permet de signaler à Javascript qu'il
peut commencer à configurer l'objet qui va permettre de faire appel à l'API d'Apple Music.

NOTE :
L'événement "MusicKitLoaded" me pose quelque problème en Dev, il semblerait 
qu'il ne se déclenche pas si la page est rechargé, parce qu'il est déjà chargé dans le cache ?
(PS : Effectivement, c'est le cache, vérifié avec la fonction "désactiver le cache quand la console est ouverte")
J'ai fix temporairement en test avec DOMContentLoaded, mais n'hésitez (vraiment) pas à essayer d'une autre manière si possible.
*/
document.addEventListener("musickitloaded", async function () {
    try {
        await MusicKit.configure({
            developerToken: devToken,
            app: {
                //penser à donner des vrais infos
                name: "Apple Music API Discovering",
                build: "2024.2.29",
            },
        });
        console.log("Apple Music chargé");
    } catch (err) {
        // je vous laisse décider
        console.log(
            "problème lors de la création de l'objet MusicKit : les fonctionnalités Apple Music ne marcheront pas."
        );
    }

    music = MusicKit.getInstance();
    //pas besoin de l'attribuer dans une variable, c'était juste pour le récupérer et l'utiliser autre part
    var musicUserToken = await music.authorize();
});
/**
 * Récupère une Library Playlist (Playlist créé par un utilisateur) avec l'API d'Apple Music
 * @param {*} id ID d'une Library Playlist (Exemple : p.xraeDzZiM0B4Vgb)
 * @returns Une Catalog Playlist, donc exploitable.
 * 
 * Exemple JSON réponse pour Library Playlist (DONNEES PERTINENTE UNIQUEMENT) :
 * {
    "data": [
        {
            "id": id de Playlist (p.ldvAAZ3C3Qmop9),
            "type": type de playlist, library ou catalog (library_playlists),
            "href": "/v1/me/library/playlists/p.ldvAAZ3C3Qmop9",
            "attributes": {
                "name": nom de la playlist,
                "description": {
                    "standard": Description de la playlist
                },
                "dateAdded": "2021-09-30T00: 55: 48Z",
                "artwork": {
                    "width": largeur de l'artwork,
                    "height": hauteur de l'artwork,
                    "url": url vers l'artwork
                    },
                "isPublic": booléen : si la playlist est public, alors vrai.
                "hasCatalog": à un équivalent catalog playlist, si oui alors exploitable.
            }
        }
    ]
}*/
async function getLibraryPlaylist(id) {
    let res = await music.api.music("/v1/me/library/playlists/" + id + "/catalog");
    //c'est quoi cette structure apple
    let catalogId = res.data.data[0].id;
    return await getCatalogPlaylist(catalogId);
}

/**
 * Récupère une Catalog Playlist (Playlist créé pour Apple Music (?)) avec l'API d'Apple Music
 * @param {*} id ID d'une Catalog Playlist (Exemple : pl.154af9931b214278a64274c410046e69)
 * @returns Objet playlist sérialisé, avec ensemble des musiques sérialisés
 *
 * Exemple de JSON réponse pour Catalog Playlist :
 * {
    "data": [
        {
            "id": id de la playlist,
            "type": type de playlist (playlists),
            "href": "/v1/catalog/fr/playlists/pl.u-4Jomaj3CJ9oaB81",
            "attributes": {
                "curatorName": créateur de la playlist ("Damien Rodriguez"),
                "lastModifiedDate": "2024-02-29T08:42:05Z",
                "name": nom de la playlist ("MAX & JVKE"),
                "description": {
                    "standard": description ("J'adore ces mecs")
                },
                "playlistType": ? "user-shared",
                "artwork": {
                    "width": 2400,
                    "height": 2400,
                    "url": "https://is1-ssl.mzstatic.com/image/thumb/gen/{w}x{h}AM.PDCXS01.jpg?c3=D56C09&c4=1C1B20&t=TUFYICYgSlZLRQ%3D%3D&signature=dabbdad6f0b0705b59eea3acd03fe8422ce38b8aadfdbe6aecf5948435a3facd&c1=C6C4B6&vkey=1&c2=F1E492&tc=000000"
                },
                "url": url vers la playlist ("https://music.apple.com/fr/playlist/max-jvke/pl.u-4Jomaj3CJ9oaB81"),
            },
            "relationships": {
                "tracks": {
                    "href": "/v1/catalog/fr/playlists/pl.u-4Jomaj3CJ9oaB81/tracks",
                    "data": [
                        [... (limité en terme de quantité de chanson récupéré ici, raison de la fonction getCatalogPlaylistTracks() )]
                        Voir getCatalogPlaylistTracks() pour un exemple
                    ]
                }
            }
        }
    ]
}
 */
async function getCatalogPlaylist(id) {
    let res = await music.api.music("/v1/catalog/fr/playlists/" + id);
    return await serializeCatalogPlaylist(res);
}

/**
 * Récupère les musiques d'une library playlist
 *
 * @param {*} id ID d'une LibraryPlaylist
 * @returns Une liste de Catalog Tracks (plus exploitable)
 *
 * Voir getCatalogPlaylistTracks pour voir un exemple de JSON
 */
async function getLibraryPlaylistTracks(id) {
    let playlist = await getLibraryPlaylist(id);
    let catalogId = playlist.data.data[0].id;
    return await getCatalogPlaylistTracks(catalogId);
}

/**
 * Récupère les musiques d'une catalog playlist
 * 
 * @param {*} id ID d'une Catalog Playlist
 * @returns liste de catalog tracks
 * 
 * Exemple de JSON réponse :
 *  
 * {
    //Si "next" est présent dans le json, alors la boucle va permettre de continuer de récupérer le reste.
    "next": "/v1/catalog/fr/playlists/pl.u-55D6ZJ1H6al89v2/tracks?offset=100",
    "data": [
        {
            "id": "1513523921",
            "type": "songs",
            "href": "/v1/catalog/fr/songs/1513523921",
            "attributes": {
                "albumName": "FINAL FANTASY VII REMAKE (Original Soundtrack)",
                "genreNames": [
                    "Bande originale",
                    "Musique"
                ],
                "trackNumber": 46,
                "releaseDate": "2020-05-27",
                "durationInMillis": 141547,
                "isrc": "JPA842002176",
                "artwork": {
                    "width": 3000,
                    "height": 3000,
                    "url": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/12/5e/5c/125e5cde-5b44-e252-eb01-71ea41372512/dj.hcaxwvok.jpg/{w}x{h}bb.jpg",
                    "bgColor": "000000",
                    "textColor1": "fefefe",
                    "textColor2": "dfd9d6",
                    "textColor3": "cbcbcb",
                    "textColor4": "b3aeab"
                },
                "composerName": "牧野忠義 & Square Enix Music",
                "url": "https://music.apple.com/fr/album/%E9%91%BC%E7%89%9F-drum-ffvii-remake/1513522478?i=1513523921",
                "playParams": {
                    "id": "1513523921",
                    "kind": "song"
                },
                "discNumber": 3,
                "hasCredits": false,
                "isAppleDigitalMaster": false,
                "hasLyrics": false,
                "name": "鑼牟 -Drum- (FFVII REMAKE)",
                "previews": [
                    {
                        "url": "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/c8/5a/b1/c85ab167-4636-965d-07ae-ac0f21d3eac5/mzaf_3327570785587897143.plus.aac.p.m4a"
                    }
                ],
                "artistName": "牧野忠義 & Square Enix Music"
            }
        }, 
        [d'autres musiques ...]
        ]
    }
 */
async function getCatalogPlaylistTracks(id) {
    let url = "/v1/catalog/fr/playlists/" + id + "/tracks";
    let tracks = [];
    do {
        let res = await music.api.music(url);
        tracks = tracks.concat(res.data.data);
        url = res.data.next;
    } while (url);
    return tracks;
}

async function serializeCatalogPlaylist(playlist) {
    let CatalogTracks = await getCatalogPlaylistTracks(playlist.data.data[0].id);
    let tracks = [];
    for (let track of CatalogTracks) {
        tracks.push({
            id: track.id,
            title: track.attributes.name,
            artwork: track.attributes.artwork.url.replace(/{[w,h]}/g, 120),
            isrc: track.attributes.isrc,
            durationMs: track.attributes.durationInMillis,
            artist: track.attributes.artistName,
        });
    }
    return {
        source: "Apple Music",
        id: playlist.data.data[0].id,
        name: playlist.data.data[0].attributes.name,
        artwork: playlist.data.data[0].attributes.artwork.url.replace(/{[w,h]}/g, 250),
        nbTracks: tracks.length,
        creatorName: playlist.data.data[0].attributes.curatorName,
        //curators ?
        //ça n'est pas la date de création mais bien la dernière date de modification, donc techniquement la création de la dernière version de la playlist
        creationDate: playlist.data.data[0].attributes.lastModifiedDate,
        desc: playlist.data.data[0].attributes.description.standard,
        tracks: tracks,
    };
}

export { getLibraryPlaylist, getCatalogPlaylist };
