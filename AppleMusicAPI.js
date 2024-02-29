import { devToken } from "./token.js";
var music = {};

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
    } catch (err) {
        // Handle configuration error
    }

    music = MusicKit.getInstance();
    var user = await music.authorize();
});
/**
 * Récupère une Library Playlist (Playlist créé par un utilisateur) avec l'API d'Apple Music
 * @param {*} id ID d'une Library Playlist (Exemple : p.xraeDzZiM0B4Vgb)
 * @returns Une Catalog Playlist, donc exploitable.
 */
async function getLibraryPlaylist(id) {
    let res = await music.api.music("/v1/me/library/playlists/" + id + "/catalog");
    //c'est quoi cette structure apple
    let catalogId = res.data.data[0].id;
    //je pourrais faire un appel à getCatalogPlaylist() mais le traitement supplémentaire en vaudra ptet pas la chandelle
    return await getCatalogPlaylist(catalogId);
}

/**
 * Récupère une Catalog Playlist (Playlist créé pour Apple Music (?)) avec l'API d'Apple Music
 * @param {*} id ID d'une Catalog Playlist (Exemple : pl.154af9931b214278a64274c410046e69)
 * @returns Objet playlist sérialisé, avec ensemble des musiques sérialisés
 */
async function getCatalogPlaylist(id) {
    let res = await music.api.music("/v1/catalog/fr/playlists/" + id);
    return await serializeCatalogPlaylist(res);
}

async function getLibraryPlaylistTracks(id) {
    let playlist = await getLibraryPlaylist(id);
    let catalogId = playlist.data.data[0].id;
    return await getCatalogPlaylistTracks(catalogId);
}

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
