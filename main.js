import * as deezerAPI from "./deezerAPI.js";
import * as AppleAPI from "./AppleMusicAPI.js";

/**
 * Expression régulière pour pouvoir reconnaître l'URL de playlist de Deezer, ce que l'utilisateur est supposé déposer dans la dropzone.
 */
const regexDeezerPlaylist = /https:\/\/www\.deezer\.com\/[a-z]{2,2}\/playlist\//i;
/**
 * Variable pour afficher la provenance de la playlist
 */
var provenancePlaylist = "";
/**
 * ID de la playlist reçu après traitement de l'élément lâché de l'utilisateur.
 */
var idPlaylist = "";
/**
 * Objet contenant la playlist récupéré de la base de donnée.
 */
var playlist = {};
/**
 * Balise d'affichage des données. Dans l'affichage par défaut, c'est la balise à droite de la dropzone.
 */
const dataDisplay = $("#datadisplay");

//Ajout d'événements pour le glisser-déposer
$("#dropzone").on({
    //Evenement nécessaire afin de faire comprendre que cette balise est une zone de largage (traduction de dropzone ?)
    dragover: function (event) {
        event.preventDefault();
        event.originalEvent.dataTransfer.dropEffect = "move";
    },

    drop: async function (event) {
        //Blocage du comportement par défaut lors du glissage d'une URL, c'est-à-dire le chargement de l'URL glissé dans l'onglet en cours.
        event.preventDefault();
        //Suppression des éléments présents sur la page si une playlist est déjà présente
        clearCurrentPlaylist();
        let data = event.originalEvent.dataTransfer.getData("text");
        //Test d'assimmilation, commence par vérifier si l'élément droppé correspond à une URL de playlist Deezer,
        //Sinon, il vérifie si c'est un élément JSON, manière dont Apple Music fonctionne.
        if (regexDeezerPlaylist.test(data)) {
            //debug
            console.log("drop : Lien de Playlist Deezer");
            provenancePlaylist = "Deezer";
            //découpage de l'URL pour ne garder que l'ID de la playlist.
            idPlaylist = data.replace(regexDeezerPlaylist, "");
            playlist = await deezerAPI.getPlaylistInfo(idPlaylist);
            //Ajout des informations dans le DOM, dans la balise dataDisplay
            $(`<img>`).attr("src", playlist.picture_medium).appendTo(dataDisplay);
            $(`<h2 style="margin: 0"></h1>`).text(playlist.title).appendTo(dataDisplay);
            $(`<p style="margin: 0"></p>`).text(playlist.id).appendTo(dataDisplay);
            $(`<h2 style="grid-column: 1/3"></h2>`).text("Contenu de la playlist").appendTo("#tracklist");
            playlist.tracks = await deezerAPI.getPlaylistTracks(idPlaylist);
            //Ajout des chansons dans une balise qui sera ajouté à la fin dans le DOM. N'est pas ajouté au fur et à mesure (dans le DOM) pour éviter le spam de requête pour les couvertures d'album, qui dépasserait le quota autorisé.
            let trackList = $(`<div id="tracklist"></div>`);
            for (let i = 0; i < playlist.tracks.length; i++) {
                let track = playlist.tracks[i];
                let trackDisplay = $(`<div></div>`).addClass("track");
                $(`<img></img>`).attr("src", track.album.cover).appendTo(trackDisplay);
                let infoDisplay = $(`<div></div>`);
                $(`<p style="font-weight:bold"></p>`).text(track.title).appendTo(infoDisplay);
                $(`<p></p>`).text(track.artist.name).appendTo(infoDisplay);
                $(`<p style="font-size: 13px;"></p>`)
                    .text("ISRC : " + track.isrc)
                    .appendTo(infoDisplay);
                infoDisplay.appendTo(trackDisplay);
                trackDisplay.appendTo(trackList);
            }
            //Ajout à ce moment précis dans le DOM
            trackList.appendTo("body");
            //Ajout du nombre de musiques dans la playlist à ce moment pour pouvoir donner précisément le nombre récupéré à partir de la liste de musique (et non de l'API, malgré le fait que l'API donne le nombre. (Pourquoi j'ai fait ça ?))
            $(`<p style="margin: 0"></p>`)
                .text("Nombre de musiques : " + playlist.tracks.length)
                .appendTo(dataDisplay);

            //Traitement du JSON
        } else if ((data = tryParseJSON(data))) {
            console.log("drop : JSON");
            console.log(data);
            //vérification de la présence d'un élément dans le JSON qui démontre que c'est bien un JSON de playlist déposé.
            if ((idPlaylist = data.items[0].identifiers.cloudUniversalLibraryID)) {
                provenancePlaylist = "Apple Music";
                console.log(idPlaylist);
            }
        }
    },
});

/**
 * Vide tout les éléments concernant la playlist en cours. (objet, infos dans le DOM ...)
 */
function clearCurrentPlaylist() {
    playlist = {};
    $("#tracklist").empty();
    $(datadisplay).empty();
}
