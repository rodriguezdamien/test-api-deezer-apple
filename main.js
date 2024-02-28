const regexDeezerPlaylist = /https:\/\/www\.deezer\.com\/[a-z]{2,2}\/playlist\//i;
var provenancePlaylist = "";
var idPlaylist = "";
var playlist = {};
var isDragover = false;
var dataDisplay = $("#dataDisplay");

$("#dropzone").on({
    //Nécesasire afin de faire comprendre que cette balise est une zone de largage (traduction de dropzone ?)
    dragover: function (event) {
        event.preventDefault();
        event.originalEvent.dataTransfer.dropEffect = "move";
    },

    drop: function (event) {
        event.preventDefault();
        let data = event.originalEvent.dataTransfer.getData("text");

        console.log("données :");
        console.log(data);

        //Test d'assimmilation, commence par vérifier si l'élément droppé correspond à une URL de playlist Deezer,
        //Sinon, il vérifie si c'est un élément JSON, manière dont Apple Music fonctionne. (aucun traitement sur Apple Music tant que pas de token)
        if (regexDeezerPlaylist.test(data)) {
            provenancePlaylist = "Deezer";
            console.log("drop : Lien de Playlist Deezer");
            idPlaylist = data.replace(regexDeezerPlaylist, "");
            getDeezerPlaylist(idPlaylist);
        } else if ((data = tryParseJSON(data))) {
            console.log("drop : JSON");
            console.log(data);

            if ((idPlaylist = data.items[0].identifiers.cloudUniversalLibraryID)) {
                provenancePlaylist = "Apple Music";
                console.log(idPlaylist);
            }
        }
    },
});
//Fonction de récupération d'informations d'une playlist avec un id passé en paramètre.
//Ne retourne rien, puisqu'il insère directement la playlist dans la variable "playlist". (pas sûr de garder cette manière)
function getDeezerPlaylist(id) {
    //Suppression des éléments présents sur la page si une playlist est déjà présente
    clearCurrentPlaylistDisplay();
    //raccourci possible avec $.getJSON() (https://api.jquery.com/jQuery.getJSON/)
    $.ajax({
        url: "https://api.deezer.com/playlist/" + id,
        type: "GET",
        dataType: "json",
        success: async function (json) {
            console.log(json);
            playlist = json;

            //Insertion des informations de la playlist dans le DOM
            //Possibilité de créer les balises directement dans le code HTML et de les identifier ici avec le sélecteur
            $(`<img>`).attr("src", playlist.picture_medium).appendTo(dataDisplay);
            $(`<p style="margin-bottom:0;"></p>`).text(provenancePlaylist).appendTo(dataDisplay);
            $(`<h2 style="margin: 0"></h1>`).text(playlist.title).appendTo(dataDisplay);
            $(`<p style="margin: 0"></p>`).text(playlist.id).appendTo(dataDisplay);
            $(`<p style="margin: 0"></p>`)
                .text("Nombre de musiques : " + playlist.tracks.data.length)
                .appendTo(dataDisplay);
            $(`<h2 style="grid-column: 1/3"></h2>`).text("Contenu de la playlist").appendTo("#tracklist");

            //Recherche des codes ISRC des musiques
            for (let i = 0; i < playlist.tracks.data.length; i++) {
                //Solution (temporaire ?) pour faire attendre entre chaque requête d'API et éviter d'attendre le quota autorisé.
                await delay(100);
                let trackId = playlist.tracks.data[i].id;
                $.ajax({
                    url: "https://api.deezer.com/track/" + trackId,
                    type: "GET",
                    dataType: "json",
                    success: function (json) {
                        playlist.tracks.data[i] = json;
                        console.log(i);
                        console.log(json);
                        let trackDisplay = $(`<div></div>`).addClass("track");
                        $(`<img></img>`).attr("src", json.album.cover).appendTo(trackDisplay);
                        let infoDisplay = $(`<div></div>`);
                        $(`<p style="font-weight:bold"></p>`).text(json.title).appendTo(infoDisplay);
                        $(`<p></p>`).text(json.artist.name).appendTo(infoDisplay);
                        $(`<p style="font-size: 13px;"></p>`)
                            .text("ISRC : " + json.isrc)
                            .appendTo(infoDisplay);
                        infoDisplay.appendTo(trackDisplay);
                        trackDisplay.appendTo("#tracklist");
                    },
                });
            }
            console.log(playlist);
        },
    });
}

function clearCurrentPlaylistDisplay() {
    $("#tracklist").empty();
}

//solution (temporaire ?) pour limiter le nombre de réponses
async function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
