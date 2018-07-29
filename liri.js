// Read and set any environment variables with the dotenv package
require("dotenv").config();

// Grab the fs package to handle read/write/append
var fs = require("fs");


var request = require("request");
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var inquirer = require("inquirer");

var keys = require("./keys.js");

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

    case "playlist":
        songPlaylist();
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
            console.log(`A Preview Link of the Song, "${song}", from Spotify: ${link}`);
            // Output the album that the song is from
            console.log(`Album containing the Song, "${song}": ${album}`);
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
        console.log(`A Preview Link of the Song, "${song}", from Spotify: ${link}`);

        // Output the album that the song is from
        console.log(`Album containing the Song, "${song}": ${album}`);

        // console.log(`=======================================================`);
        // console.log(songObj);

        artistArray =[];

        inquirer.prompt([
            // Here we ask the user to confirm.
            {
            type: "confirm",
            message: "Is this the song you are looking for?",
            name: "conf",
            default: true,
            },
        ])
        .then(function(inquirerResponse) {
            console.log(`=======================================================`);
            // console.log(inquirerResponse.conf); //if user picked y then conf is true if user picked n then conf is false
            if(!inquirerResponse.conf){
                num++;
                if(num<20){
                    console.log(`......................................................`);
                    console.log(`Here's another song:`);
                    songSearch(songName, num);
                }
                else{
                    console.log(`......................................................`);
                    console.log("Please choose a different song.");
                    return console.log(`......................................................`);
                }
                
            }
            else{
                var songTrack = `"${song}" by ${artist}; `
                fs.appendFile("playlist.txt", songTrack, function(err) {
                    // append or add text to the end of the file
                    // if playlist.txt does not exist then will create that file
                    
                    // If an error was experienced
                    if (err) {
                        console.log(err);
        
                    }
                
                    // If no error is experienced, we'll log the phrase below to our node console.
                    else {
                        console.log(`Awesome! The song, "${song}" by ${artist} was added to your Playlist. To view your Playlist type in the command: playlist.`);
                        return console.log(`......................................................`);
                    }
                    
                    });
                
            }
        }); 
    });
}

function songPlaylist() {
    fs.readFile("playlist.txt", "utf8", function(error, data) {
        // data is type: string and contains all the content of playlist.txt
        // error object will be undefined if no error, but will contain an error if there is an error
        
        // If the code experiences any errors it will log the error to the console.
        if (error) {
            return console.log(error);
        }
        
        console.log(data);
        //split method creates an array from the string where each element in the array is created by splitting the string at ";"
        var dataArr = data.split(";");
        console.log(dataArr);

        console.log(`=======================================================`);
        console.log(`Your Playlist:`)
        console.log(`.......................................................`);
    
        // We will then display the content of the array as a playlist on each line.
        for (k =0; k < dataArr.length-1; k++){
            console.log(`#${parseInt(k)+1}: ${dataArr[k]}`);
            console.log(`.......................................................`);
        }
        console.log(`=======================================================`);
       
        });
        
}