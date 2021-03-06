// Read and set any environment variables with the dotenv package
require("dotenv").config();

// Grab the fs package to handle read/write/append
var fs = require("fs");

// Grab the request, twitter, node-spotify-api, and inquirer packages
var request = require("request");
var Twitter = require('twitter');
var Spotify = require('node-spotify-api');
var inquirer = require("inquirer");

// import keys for twitter and node-spotify api from keys.js
var keys = require("./keys.js");

// 
var spotify = new Spotify(keys.spotify);
var client = new Twitter(keys.twitter);

//---------------------------------------------Global Variables

// after node liri.js the user inputs the command which this is the 1st argument
var command = process.argv[2];
// after command if applicable user will include write a movie name or song name and that will be the 2nd argument
var input = process.argv[3];

var totalInput;
var songName = "";
var movieName ="";
var artistArray = [];
var num = 0;
var random = false;


//---------------------------------------------Start of Code

//if user does not specify a command then user will choose a command using the inquirer prompt type: list
if(!command){
    inquirer.prompt([
        {
            type: "list",
            message: "Please choose a command:",
            choices: ["my-tweets", "spotify-this-song", "playlist", "movie-this", "watchlist","do-what-it-says", "commands", "exit"],
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
        else if (inquirerResponse.userChoice == "watchlist"){
            totalInput = "watchlist";
            movieWatchlist();
        }
        else if(inquirerResponse.userChoice == "do-what-it-says"){
            totalInput = "do-what-it-says";
            itSays();
        }
        else if(inquirerResponse.userChoice == "commands"){
            totalInput = "commands";
            commands();
        }
        else{
            return;
        }
    });
}
else{
    choice();
}

//----------------------------------------------Functions

// depending on what command is typed by the user the respective function is run
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

        case "watchlist":
            totalInput = "watchlist";
            movieWatchlist();
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

// this will show my last 20 tweets and when they were created at in the terminal/bash window.
function tweets(){
    var params = {screen_name: 'LIRI51505595'};
    client.get('statuses/user_timeline', params, function(error, tweets, response) {
        // console.log(response);
        if (!error) {

            var tweetLogArr = [`===========================================================================`,
            `===========================================================================`];
    
            if(20 > tweets.length){
                tweetNum = tweets.length
            }
            else{
                tweetNum = 20
            }
            for (l=0; l<tweetNum; l++){
                var tweet = tweets[l].text;
                var dateInitial = tweets[l].user.created_at.slice(0,10);
                var dateFinal =  tweets[l].user.created_at.slice(-4);
                var dateCreated = dateInitial + " " + dateFinal;
                tweetLogArr.push(`Tweet #${l+1}: ${tweet}`);
                tweetLogArr.push(`Date created: ${dateCreated}`);
                tweetLogArr.push("............................................................................");
            }
            tweetLogArr.push(`===========================================================================`);
            tweetLogArr.push(`===========================================================================`);
            //   console.log(tweets);
            tweetLog = tweetLogArr.join('\n');
            console.log(tweetLog);
            outputLog(tweetLogArr);
        }
      });
}

// gives user the information based on the song that the user typed
function spotifyThis(){
    //  if user types in command "spotify-this-song" withiout specifying a song as the next argument
    if(input === undefined){
        songName = "The Sign Ace of Base";
        totalInput = command;
        spotify.search({ type: 'track', query: songName }, function(error, data){
            if (error) {
            return console.log('Error occurred: ' + error);
            }
            var songObj = data.tracks.items[0];
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

// function runs only when there is a song name specified by the user
function songSearch(sName, number){
    spotify.search({ type: 'track', query: sName }, function(error, data){
        if (error) {
        return console.log('Error occurred: ' + error);
        }
        var songObj = data.tracks.items[number];
        
        // in pretty-print format
        // the null specifies that there will not be a replacer function. The 2 represents 2 indents in order to make it more presentable
        console.log(JSON.stringify(data, null, 2));

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
                    var songTrack = `"${song}" by ${artist};`;
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

// shows user their playlist they created through using the spotify-this-song command
function songPlaylist(){
    fs.readFile("playlist.txt", "utf8", function(error, data) {
        // data is type: string and contains all the content of playlist.txt
        // error object will be undefined if no error, but will contain an error if there is an error
        
        // If the code experiences any errors it will log the error to the console.
        if (error) {
            return console.log(error);
        }
        else if(data == ""){
            var playArray = [`===========================================================================`,
            `Your Playlist is empty. Please use the spotify-this-song command and search for a song you would like to add to your playlist.`,
            `===========================================================================`];
            var playLog = playArray.join('\n');
            console.log(playLog);
            outputLog(playArray);
        }
        else{
            //split method creates an array from the string where each element in the array is created by splitting the string at ";"
            var dataArr = data.split(";");
            // console.log(dataArr);

            var playArray = [`===========================================================================`,
            `===========================================================================`,
            `Your Playlist:`,
            `............................................................................`,
            ];
        
            // We will then display the content of the array as a playlist on each line.
            for (k =0; k < dataArr.length-1; k++){
                playArray.push(`#${parseInt(k)+1}: ${dataArr[k]}`);
                playArray.push(`............................................................................`);
            }
            playArray.push(`===========================================================================`);
            playArray.push(`===========================================================================`);

            var playLog = playArray.join('\n');
            console.log(playLog);
            outputLog(playArray);
        }
    });
        
}

// searches the movie name given by the user if specified else searches and outputs information for a default movie
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


            if (!random){
                movieArray =[];
    
                inquirer.prompt([
                    // Here we ask the user to confirm.
                    {
                        type: "confirm",
                        message: "Would you like to add this movie to your Watchlist?",
                        name: "correctMovie",
                        default: true,
                    },
                ]).then(function(inquirerResponse) {
                    console.log(`===========================================================================`);
                    if(inquirerResponse.correctMovie){
                        var movieTicket = `"${title}" (${year}) IMDB Rating: ${ratingIMDB};`;
                        fs.appendFile("watchlist.txt", movieTicket, function(err) {
                            // append or add text to the end of the file
                            // if playlist.txt does not exist then will create that file
                            
                            // If an error was experienced
                            if (err) {
                                console.log(err);
                
                            }
                        
                            // If no error is experienced, we'll log the phrase below to our node console.
                            else {
                                console.log(`Awesome! The movie, "${title}" was added to your Watchlist. To view your Watchlist use the command: 'watchlist'.`);
                                console.log(`===========================================================================`);
        
                            }  
                        });
                    }
                }); 
            }
        }
        else{
            console.log(error);
            console.log("Please try again.")
        }
    });
}

// shows user their watchlist they created through using the movie-this command
function movieWatchlist() {
    fs.readFile("watchlist.txt", "utf8", function(error, data) {
        // data is type: string and contains all the content of playlist.txt
        // error object will be undefined if no error, but will contain an error if there is an error
        
        // If the code experiences any errors it will log the error to the console.
        if (error) {
            return console.log(error);
        }
        else if(data == ""){
            var watchArray = [`===========================================================================`,
            `Your Watchlist is empty. Please use the movie-this command and search for a movie you would like to add to your watchlist.`,
            `===========================================================================`];
            var watchLog = watchArray.join('\n');
            console.log(watchLog);
            outputLog(watchArray);
        }
        else{
            //split method creates an array from the string where each element in the array is created by splitting the string at ";"
            var dataArr = data.split(";");
            // console.log(dataArr);

            var watchArray = [`===========================================================================`,
            `===========================================================================`,
            `Your Watchlist:`,
            `............................................................................`,
            ];
        
            // We will then display the content of the array as a playlist on each line.
            for (k =0; k < dataArr.length-1; k++){
                watchArray.push(`#${parseInt(k)+1}: ${dataArr[k]}`);
                watchArray.push(`............................................................................`);
            }
            watchArray.push(`===========================================================================`);
            watchArray.push(`===========================================================================`);

            var watchLog = watchArray.join('\n');
            console.log(watchLog);
            outputLog(watchArray);
        }
    });
        
}

// reads the file random.txt and calls the specific function associated with the command on that file
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

// displays all the possible commands and their outputs
function commands(){
    var commandLogArray = [
        `===============================================================================================================`,
        `Here are the list of possible commands and their output:`,
        `...............................................................................................................`,
        `Command__________________________________________Output________________________________________________________`,
        `...............................................................................................................`,
        `"my-tweets"______________________________________last 20 tweets and when they were created`,
        `...............................................................................................................`,
        `"spotify-this-song" <song name here>_____________information about the song such as artist, album, preview link`,
        `...............................................................................................................`,
        `"playlist"_______________________________________playlist of songs created from "spotify-this-song" command`,
        `...............................................................................................................`,
        `"movie-this" <movie name here>___________________information about the movie such as year, rating, plot, actors`,
        `...............................................................................................................`,
        `"watchlist"_______________________________________watchlist of movie created from "movie-this" command`,
        `...............................................................................................................`,
        `"do-what-it-says"________________________________random command is executed`,
        `...............................................................................................................`,
        `===============================================================================================================`];
    var commandLog = commandLogArray.join('\n');
    console.log(commandLog);
    outputLog(commandLogArray);
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

// to do: need to link