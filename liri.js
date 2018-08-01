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

var command = process.argv[2];
var input = process.argv[3];
var totalInput;

var songName = "";
var movieName ="";
var artistArray = [];
var num = 0;
var random = false;


if(!command){
    inquirer.prompt([
        {
            type: "list",
            message: "Please choose a command:",
            choices: ["my-tweets", "spotify-this-song", "playlist", "movie-this","do-what-it-says", "commands"],
            name: "userChoice",
        },
    ]).then(function(inquirerResponse){
        if(inquirerResponse.userChoice == "my-tweets"){
            totalInput = "my-tweets";
            tweets();
        }
        else if(inquirerResponse.userChoice == "spotify-this-song"){
            command = "spotify-this-song";
            inquirer.prompt([
                {
                    type: "input",
                    message: "What song would you like to search for?",
                    name: "songInput"
                  },
            ]).then(function(songRes){
                if(songRes.songInput !== ""){
                    input = songRes.songInput;
                }else{
                    input = undefined;
                }
                totalInput = command + " " + input;
                spotifyThis();
            });
        }
        else if(inquirerResponse.userChoice == "playlist"){
            totalInput = "playlist";
            songPlaylist();
            
        }
        else if(inquirerResponse.userChoice == "movie-this"){
            command = "movie-this";
            inquirer.prompt([
                {
                    type: "input",
                    message: "What movie would you like to search for?",
                    name: "movieInput"
                  },
            ]).then(function(movieRes){
                if(movieRes.movieInput !== ""){
                    input = movieRes.movieInput;
                }else{
                    input = undefined;
                }
                totalInput = command + " " + input;
                movieThis();
            });
        }
        else if(inquirerResponse.userChoice == "do-what-it-says"){
            totalInput = "do-what-it-says";
            itSays();
        }
        else if(inquirerResponse.userChoice == "commands"){
            totalInput = "commands";
            commands();
        }
    });
}
else{
    choice();
}

function choice(){
    switch (command) {
        case "my-tweets":
            totalInput = "my-tweets";
            tweets();
            break;
        
        case "spotify-this-song":
            spotifyThis();
            break;
    
        case "playlist":
            totalInput = "playlist";
            songPlaylist();
            break;
        
        case "movie-this":
            movieThis();
            break;
        
        case "do-what-it-says":
            totalInput = "do-what-it-says";
            itSays();
            break;

        case "commands":
            totalInput = "commands";
            commands();
            break;
    }
}

// This will show my last 20 tweets and when they were created at in the terminal/bash window.
function tweets(){
    var params = {screen_name: 'LIRI51505595'};
    client.get('statuses/user_timeline', params, function(error, tweets, response) {
        // console.log(response);
        if (!error) {
            console.log(`===========================================================================`);
            console.log(`===========================================================================`);
            if(20 > tweets.length){
                tweetNum = tweets.length
            }
            else{
                tweetNum = 20
            }
            for (l=0; l<tweetNum; l++){
                var tweet = tweets[l].text;
                var dateCreated = tweets[l].user.created_at;
                console.log(`Tweet #${l+1}: ${tweet}`);
                console.log(`Date created: ${dateCreated}`);
                console.log("............................................................................");
            }
            console.log(`===========================================================================`);
            console.log(`===========================================================================`);
        //   console.log(tweets);
        }
      });
}


function spotifyThis(){
    //  if user types in command "spotify-this-song" withiout specifying a song as the next argument
    if(input === undefined){
        songName = "The Sign";
        totalInput = command;
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

            console.log(`===========================================================================`);
            console.log(`Please enter a song name after the command 'spotify-this-song' to get an output like this:`);

            var musicLogArr = [`===========================================================================`,
            `===========================================================================`, 
            `Artist: ${artist}`,
            `............................................................................`,
            `The Song's Name: ${song}`,
            `............................................................................`,
            `A Preview Link of "${song}", from Spotify: ${link}`,
            `............................................................................`,
            `Album containing "${song}": ${album}`,
            `===========================================================================`,
            `===========================================================================`];
            musicLog = musicLogArr.join('\n');
            console.log(musicLog);
            outputLog(musicLogArr);

            // another way to console log:


            // console.log(`=======================================================`);
            // // Output the artist(s) of the song
            // console.log(`Artist: ${artist}`);
            // console.log(`.......................................................`);

            // // Output the song's name
            // console.log(`The Song's Name: ${song}`);
            // console.log(`.......................................................`);

            // // Output a preview link of the song from Spotify
            // console.log(`A Preview Link of "${song}", from Spotify: ${link}`);
            // console.log(`.......................................................`);

            // // Output the album that the song is from
            // console.log(`Album containing "${song}": ${album}`);
            // console.log(`=======================================================`);
        
        });
    }
    // if the user selects the do-what-it-says command or if the user uses the inquirer prompt instead of writing a command argument as process.argv[2] then
    else if (process.argv[2] === "do-what-it-says" || !process.argv[2]){
        songName = input;
        songSearch(songName, num);
    }
    else{
        songName = process.argv.slice(3).join(' ');
        input = songName;
        totalInput = command + " " + input;
        songSearch(songName, num);
        // alternate way:
        // for(i=3; i<pro.length; i++){
        //     songName += pro[i] + " ";
        // }
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
        if(songObj.preview_url !== null){
            var link = songObj.preview_url;
        }
        else{
            var link = "No preview link available"
        }
        var album = songObj.album.name;

        // Determine if there is just one artist or multiple artists of the song
        if(artistArray.length == 1){
            var numArtist = `Artist:`
        }
        else{
            var numArtist = `Artists:`
        }

        var musicLogArr = [`===========================================================================`,
        `===========================================================================`, 
        `${numArtist} ${artist}`,
        `............................................................................`,
        `The Song's Name: ${song}`,
        `............................................................................`,
        `A Preview Link of "${song}", from Spotify: ${link}`,
        `............................................................................`,
        `Album containing "${song}": ${album}`,
        `===========================================================================`,
        `===========================================================================`];
        musicLog = musicLogArr.join('\n');
        console.log(musicLog);
        outputLog(musicLogArr);

        if (!random){
            artistArray =[];

            inquirer.prompt([
                // Here we ask the user to confirm.
                {
                    type: "confirm",
                    message: "Would you like to add this song to your playlist?",
                    name: "correctSong",
                    default: true,
                
                },
                {
                    type: "confirm",
                    message: `Would you like to search for a different "${sName}" song?`,
                    name: "searchAgain",
                    default: true,
                },

            ]).then(function(inquirerResponse) {
                console.log(`===========================================================================`);
                // console.log(inquirerResponse.correctSong); //if user picked y then correctSong is true if user picked n then correctSong is false
                if(inquirerResponse.correctSong && inquirerResponse.searchAgain){
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
                            console.log(`Awesome! The song, "${song}" by ${artist} was added to your Playlist. To view your Playlist use the command: 'playlist'.`);
                            console.log(`===========================================================================`);
                            num++;
                            if(num<20){
                                console.log(`===========================================================================`);
                                console.log(`Here's another song:`);
                                songSearch(sName, num);
                            }
                            else{
                                console.log(`===========================================================================`);
                                console.log("Please choose a different song.");
                                console.log(`===========================================================================`);
                            }
                        }  
                    });
                }
                else if(inquirerResponse.correctSong){
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
                            console.log(`Awesome! The song, "${song}" by ${artist} was added to your Playlist. To view your Playlist use the command: 'playlist'.`);
                            console.log(`===========================================================================`);
                        }
                    });
                }
                else if(inquirerResponse.searchAgain){
                    num++;
                    if(num<20){
                        console.log(`===========================================================================`);
                        console.log(`Here's another song:`);
                        songSearch(sName, num);
                    }
                    else{
                        console.log(`===========================================================================`);
                        console.log("Please choose a different song.");
                        console.log(`===========================================================================`);
                    }
                }
            }); 

        }
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
        else if(data == ""){
            console.log(data);
            console.log(`===========================================================================`);
            console.log(`Your Playlist is empty. Please use the spotify-this-song command and search for songs you would like to add to your playlist.`)
            console.log(`===========================================================================`);
        }
        else{
            // console.log(data);
            //split method creates an array from the string where each element in the array is created by splitting the string at ";"
            var dataArr = data.split(";");
            // console.log(dataArr);

            console.log(`===========================================================================`);
            console.log(`===========================================================================`);
            console.log(`Your Playlist:`)
            console.log(`............................................................................`);
        
            // We will then display the content of the array as a playlist on each line.
            for (k =0; k < dataArr.length-1; k++){
                console.log(`#${parseInt(k)+1}: ${dataArr[k]}`);
                console.log(`............................................................................`);
            }
            console.log(`===========================================================================`);
            console.log(`===========================================================================`);
        }
    });
        
}

function movieThis(){
    //  if user types in command "movie-this" withiout specifying a movie as the next argument
    if (input === undefined){
        movieName = "mr+nobody"
        input = "";
        totalInput = command + " " + input;
        console.log(`===========================================================================`);
        console.log(`Please enter a movie name after the command 'movie-this' to get an output like this:`)
    }
    // if the user selects the do-what-it-says command or if the user uses the inquirer prompt instead of writing a command argument as process.argv[2] then
    else if(process.argv[2] == "do-what-it-says" || !process.argv[2]){
        var movieArr = input.split(" ");
        movieName = movieArr.join("+");
    }
    else{
        var movieArr = process.argv.slice(3);
        movieName = movieArr.join("+");
        input = movieArr.join(" ");
        totalInput = command + " " + input;
    }
    

    // console.log(movieName);

    var url = "http://www.omdbapi.com/?t="+ movieName + "&y=&plot=short&apikey=trilogy";

    // console.log(url);

    // Then run a request to the OMDB API with the movie specified
    // use the request package to retrieve data from the OMDB API
    request(url, function(error, response, body) {

        // If the request is successful (i.e. if the response status code is 200)
        if (!error && response.statusCode === 200) {
            // Parse the body of the site 
            movieResult = JSON.parse(body);
            var title = movieResult.Title;
            var year = movieResult.Year;
            var ratingIMDB = movieResult.Ratings[0].Value;
            if(movieResult.Ratings[1] !== undefined){
                var ratingTom = movieResult.Ratings[1].Value;
            } else{
                var ratingTom = "No rating as of yet."
            }
            
            var country = movieResult.Country;
            var lang = movieResult.Language;
            var plot = movieResult.Plot;
            var actors = movieResult.Actors;

            var movieLogArr = [`===========================================================================`,
            `===========================================================================`, 
            `Title of the movie: ${title}`,
            `............................................................................`,
            `Year "${title}" came out: ${year}`,
            `............................................................................`,
            `IMDB Rating of "${title}": ${ratingIMDB}`,
            `............................................................................`,
            `Rotten Tomatoes Rating of "${title}": ${ratingTom}`,
            `............................................................................`,
            `Country where "${title}" was produced: ${country}`,
            `............................................................................`,
            `Language of "${title}": ${lang}`,
            `............................................................................`,
            `Plot of "${title}": ${plot}`,
            `............................................................................`,
            `Actors in "${title}": ${actors}`,
            `===========================================================================`,
            `===========================================================================`];
            movieLog = movieLogArr.join('\n');
            console.log(movieLog);
            outputLog(movieLogArr);

            // another way to console log the movie data:

            // console.log(`===========================================================================`);
            // console.log(`===========================================================================`);

            // // Output the Title of the movie.
            // console.log(`Title of the movie: ${title}`);
            // console.log(`..........................................................................`);

            // // Output the Year the movie came out.
            // console.log(`Year "${title}" came out: ${year}`);
            // console.log(`..........................................................................`);

            // // Output the IMDB Rating of the movie.
            // console.log(`IMDB Rating of "${title}": ${ratingIMDB}`);
            // console.log(`..........................................................................`);

            // // Output the Rotten Tomatoes Rating of the movie.
            // console.log(`Rotten Tomatoes Rating of "${title}": ${ratingTom}`);
            // console.log(`..........................................................................`);

            // // Output the Country where the movie was produced.
            // console.log(`Country where "${title}" was produced: ${country}`);
            // console.log(`..........................................................................`);

            // // Output the Language of the movie.
            // console.log(`Language of "${title}": ${lang}`);
            // console.log(`..........................................................................`);

            // // Output the Plot of the movie.
            // console.log(`Plot of "${title}": ${plot}`);
            // console.log(`..........................................................................`);

            // // Output the Actors in the movie.
            // console.log(`Actors in "${title}": ${actors}`);

            // console.log(`===========================================================================`);
            // console.log(`===========================================================================`);
        }
        else{
            console.log(error);
            console.log("Please try again.")
        }
    });
}

function itSays(){
      // Using the `fs` Node package, LIRI will take the text inside of random.txt and then use it to call one of LIRI's commands.
    fs.readFile("random.txt", "utf8", function(error, content) {
        // data is type: string and contains all the content of playlist.txt
        // error object will be undefined if no error, but will contain an error if there is an error
        
        // If the code experiences any errors it will log the error to the console.
        if (error) {
            return console.log(error);
        }
        
        contentArr = content.split(',');
        command = contentArr[0];
        input = contentArr[1];
        random = true;
        choice();
    });
}

function outputLog(outputArr){
    output = outputArr.join('\n\t');
    var toLogArr = [`-------------------------------------------------------------------------------`,
    `Command: ${totalInput}`,
    `Output: \n\t${output}`,
    `------------------------------------------------------------------------------`,
    ``];
    var toLog = toLogArr.join(`\n`);
    fs.appendFile("log.txt", toLog, function(err) {
        // append or add text to the end of the file
        // if playlist.txt does not exist then will create that file
        
        // If an error was experienced
        if (err) {
            console.log(err);

        }
    
        // If no error is experienced, we'll log the phrase below to our node console.
        else {
            // return console.log(`Your command and output was logged in log.txt`);
        }
        
    });
}

function commands(){
    console.log(`===============================================================================================================`);
    console.log(`Here are the list of possible commands and their output:`);
    console.log(`...............................................................................................................`);
    console.log(`Command__________________________________________Output________________________________________________________`);
    console.log(`...............................................................................................................`);
    console.log(`"my-tweets"______________________________________last 20 tweets and when they were created`);
    console.log(`...............................................................................................................`);
    console.log(`"spotify-this-song" <song name here>_____________information about the song such as artist, album, preview link`);
    console.log(`...............................................................................................................`);
    console.log(`"playlist"_______________________________________playlist of songs created from "spotify-this-song" command`);
    console.log(`...............................................................................................................`);
    console.log(`"movie-this" <movie name here>___________________information about the movie such as year, rating, plot, actors`);
    console.log(`...............................................................................................................`);
    console.log(`"do-what-it-says"________________________________random command is executed`);
    console.log(`...............................................................................................................`);
    console.log(`===============================================================================================================`);
}