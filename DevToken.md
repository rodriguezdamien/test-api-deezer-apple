## Création d'un Developer Token pour Apple Music

_N'ayant pas accès à l'interface du portail du programme de développeur d'Apple, je ne suis pas en mesure d'expliquer comment générer un **"identifier" et une clé privée**, qui sont nécessaires pour obtenir un Developer Token pour Apple Music, [mais voici un article qui explique, si nécessaire](https://dev.classmethod.jp/articles/generating-token-for-apple-music-api/) (je ne sais pas s'il est à jour)_

Après avoir obtenu une clé privée et un son "identifier", vous aurez besoin de l'identifiant d'équipe (TeamID) [que vous pouvez trouver ici](https://developer.apple.com/account/#/membership/).
Vous avez maintenant tout pour générer votre JWT.

_A partir d'ici, les informations ne seront peut-être pas très précises ou exactes, n'ayant pas trop connaissances du fonctionnement des JWT et de leur utilisation/génération (?) dans le code pour le moment_

Pour générer le JWT, nous allons utiliser Postman.

-   Dirigez-vous dans "**Authorization**"

![1](https://i.ibb.co/376yKzt/Pasted-image-20240228104611.png)

-   Dans "**Type**", sélectionnez "**JWT Bearer**"

![2](https://i.ibb.co/rm6Qf8y/Pasted-image-20240228104721.png)

-   Voici ce que vous devez mettre dans le formulaire :
    _ Algorithm : ES256
    _ Private Key : La clé obtenue dans la première étape, vous pouvez mettre le fichier ou copier/coller son contenu.
    _ Payload : Vous allez devoir mettre trois propriétés :
    _ "iss": Mettez votre TeamID, récupéré plus tôt.
    _ "iat": signifiant "issuedAt", est un timestamp en Unix epoch. Mettez votre date actuelle ([Vous pouvez la prendre ici, par exemple](https://www.epochconverter.com/))
    _ "exp": signifiant "expiring", est également un timestamp. C'est le moment où votre token expirera. Vous pouvez choisir une date suivant jusqu'à maximum 6 mois la date du "issuedAt". ([Toujours au même endroit](https://www.epochconverter.com/))

![3](https://i.ibb.co/8xzKnSM/Pasted-image-20240228104838.png)

-   Allez dans "**Advenced configuration**" et mettez ceci :
    _ Header prefix : "Bearer"
    _ Headers : signifiant "key identifier" Vous devez mettre l'dentifier' de votre clé obtenu au début.

![4](https://i.ibb.co/Xz0xtgx/Pasted-image-20240228105511.png)

-   Normalement, si tout a bien été correctement saisi, vous devriez pouvoir faire des appels d'API.
    Voici un exemple que vous pouvez essayer :

```http
GET https://api.music.apple.com/v1/catalog/us/albums/1679454273
```

![5](https://i.ibb.co/vw9DrxL/Pasted-image-20240228110057.png)
