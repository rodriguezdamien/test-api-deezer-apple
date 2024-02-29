/**
 * Récupère une playlist avec l'API de Deezer
 * @param {string} id ID de la playlist souhaité
 * @returns Objet playlist sérialisé avec ensemble des musiques sérialisés
 */
async function getPlaylist(id) {
    let playlistInfo = {};
    //raccourci possible avec $.getJSON() (https://api.jquery.com/jQuery.getJSON/)
    await $.ajax({
        url: "https://api.deezer.com/playlist/" + id,
        type: "GET",
        dataType: "json",
        success: async function (json) {
            playlistInfo = json;
        },
    });
    //On retourne la playlist déjà sérialisé
    return await serializePlaylist(playlistInfo);
}

/**
 * Récupère la liste des musiques d'une playlist avec l'API de Deezer
 * @param {*} id ID de la playlist souhaité
 * @returns liste des musiques d'une playlist dans un tableau.
 */
async function getPlaylistTracks(id) {
    //j'ai passé beaucoup trop de temps pour quelque chose de beaucoup trop simple
    //roi du monde ici : https://stackoverflow.com/a/70523543
    let tracks = [];
    let url = "http://api.deezer.com/playlist/" + id + "/tracks";
    do {
        await $.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function (json) {
                //push ne rendant pas le résultat souhaité, peut-être un manque de compréhension de ma part sur la fonction ?
                tracks = tracks.concat(json.data);
                //Récupération de la page suivante de musique. Arrive si la playlist a plus de 25 musiques.
                url = json.next;
            },
        });
        //boucle jusqu'à qu'il n'y ai plus de valeur dans URL (donc "", qui renvoie false)
    } while (url);
    return tracks;
}
/**
 * Sérialise la playlist passé en paramètre pour être dans un format plus facilement exploitable.
 * (Des modifications restent à envisager sur les informations gardées)
 * @param {*} playlist Playlist a sérialiser
 * @returns Playlist sérialisé avec toutes ses musiques sérialisés
 */
async function serializePlaylist(playlist) {
    //On sérialise les musiques avant de sérialiser la playlist pour pouvoir l'insérer dans le return ainsi que la longueur de la playlist.
    let CatalogTracks = await getPlaylistTracks(playlist.id);
    let tracks = [];
    for (let track of CatalogTracks) {
        tracks.push({
            id: track.id,
            title: track.title,
            artwork: track.album.cover,
            isrc: track.isrc,
            durationMs: track.duration * 1000,
            artist: track.artist.name,
        });
    }
    return {
        id: playlist.id,
        name: playlist.title,
        artwork: playlist.picture_medium, //picture_big, small, xl ou picture tout court
        nbTracks: playlist.nb_tracks,
        creatorName: playlist.creator.name,
        //curators ?
        //URL de la musique ?
        creationDate: playlist.creation_date,
        desc: playlist.description,
        tracks: tracks,
    };
}

export { getPlaylist };
