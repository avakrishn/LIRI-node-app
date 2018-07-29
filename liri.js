// Read and set any environment variables with the dotenv package
require("dotenv").config();

var keys = require("./keys.js");
var request = require("request");
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var inquirer = require("inquirer");

var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);

var pro = process.argv;
var action = process.argv[2];

var songName = "";
var artistArray = [];
var num = 0;

switch (action) {
    case "my-tweets":
      tweets();
      break;
    
    case "spotify-this-song":
      spotifyThis();
      break;
    
    case "movie-this":
      movieThis();
      break;
    
    case "do-what-it-says":
      says();
      break;
}


function spotifyThis(){
    if(!process.argv[3]){
        songName = "The Sign"
        spotify.search({ type: 'track', query: songName }, function(error, data){
            if (error) {
            return console.log('Error occurred: ' + error);
            }
            var songObj = data.tracks.items[5];
        //  console.log(data.tracks.items[5]); 
            var artist = songObj.artists[0].name;
            var song =  songObj.name;
            var link = songObj.preview_url;
            var album = songObj.album.name;
    
            console.log(`=======================================================`);
            // Output the artist(s) of the song
            console.log(`Artist: ${artist}`);
            // Output the song's name
            console.log(`The Song's Name: ${song}`);
            // Output a preview link of the song from Spotify
            console.log(`A Preview Link of the Song from Spotify: ${link}`);
            // Output the album that the song is from
            console.log(`Album containing ${song}: ${album}`);
            console.log(`=======================================================`);
        
        });
    }
    else{
        for(i=3; i<pro.length; i++){
            songName += pro[i] + " ";
        }

        songSearch(songName, num);
        
    }

}

function songSearch(sName, number){
    spotify.search({ type: 'track', query: sName }, function(error, data){
        if (error) {
        return console.log('Error occurred: ' + error);
        }
        var songObj = data.tracks.items[number];
    //  console.log(data.tracks.items[5]); 
        for(j = 0; j < songObj["artists"].length; j++){
            artistArray.push(songObj.artists[j].name);
        }
        var artist = artistArray.join(", ");
        var song =  songObj.name;
        var link = songObj.preview_url;
        var album = songObj.album.name;

        console.log(`=======================================================`);

        // Output the artist(s) of the song
        if(artistArray.length == 1){
            console.log(`Artist: ${artist}`);
        }else{
            console.log(`Artists: ${artist}`);
        }
        
        // Output the song's name
        console.log(`The Song's Name: ${song}`);

        // Output a preview link of the song from Spotify
        console.log(`A Preview Link of the Song from Spotify: ${link}`);

        // Output the album that the song is from
        console.log(`Album containing the song "${song}": ${album}`);

        // console.log(`=======================================================`);
        // console.log(songObj);

        artistArray =[];

        inquirer.prompt([
            // Here we ask the user to confirm.
            {
            type: "confirm",
            message: "Is this the song you were thinking of? \n  =======================================================",
            name: "conf",
            default: true
            },
        ])
        .then(function(inquirerResponse) {
            // console.log(inquirerResponse.conf); //if user picked y then conf is true if user picked n then conf is false
            if(!inquirerResponse.conf){
                num++;
                if(num<20){
                    console.log(`..........................................................`);
                    console.log(`Here is another song:`);
                    songSearch(songName, num);
                }
                else{
                    console.log(`..........................................................`);
                    return console.log("Please choose a different song.");
                }
                
            }
        }); 
    });
}