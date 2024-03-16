const express = require('express');
const cors=require("cors");
const axios = require('axios');
const path = require('path');
const bodyParser = require('body-parser');
var geohash = require('ngeohash');
var SpotifyWebApi = require('spotify-web-api-node');


// create express app
const app = express();
app.use(cors());
app.options('*', cors());

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'dist/assignment8')));

// app.use(bodyParser.json());

const PORT = process.env.PORT || 8080;
app.listen(PORT, function() {
    console.log('listening on port: ' + PORT);
});

const ticketmaster_api ='8maVqAM3Ghg6MNcjyW4Y2UN0Ir7etQu7';

const get_ticketmaster_search_url = 'https://app.ticketmaster.com/discovery/v2/events.json?';

const get_ticketmaster_event_details_url='https://app.ticketmaster.com/discovery/v2/events/';

const get_ticketmaster_venue_url='https://app.ticketmaster.com/discovery/v2/venues.json?';

const get_autocomplete_url='https://app.ticketmaster.com/discovery/v2/suggest?';

const maps_address_to_lat_long_url = 'https://maps.googleapis.com/maps/api/geocode/json?address=';

const google_maps_api_key ='AIzaSyC84z2PtuNZaUCmot2DFXS_g73ntQUpGCg';
function get_headers(){
    return {
        'Authorization': 'Bearer 8maVqAM3Ghg6MNcjyW4Y2UN0Ir7etQu7'
    }
}



app.get('/maps/:address', async function(req, res) {
    try{
        let url = maps_address_to_lat_long_url + req.params.address + '&key=' + google_maps_api_key;  
        let response = await axios.get(url);
        let data = await response.data;
        console.log(data);
        let lat = data.results[0].geometry.location.lat;
        let lng = data.results[0].geometry.location.lng;
        res.json({lat: lat, lng: lng});
    }
    catch(err){
        console.log(err);
        res.json({errors:"gmap error"});
    }


});

app.get('/autocomplete/:term', async function(req, res) {
    try{
        let url = get_autocomplete_url + 'apikey=' + ticketmaster_api + '&keyword=' + req.params.term;
        console.log(url);
        var response = await axios.get(url, {headers: get_headers()});
        var data = await response.data;

        var usefuldata =[];

        for(var i = 0; i < data._embedded.attractions.length; i++){
            usefuldata.push(data._embedded.attractions[i].name);
        }
        console.log(usefuldata);
        res.json({terms: usefuldata});
    }
    catch(err){
        console.log(err);
        res.json({errors:"autocomplete error"});
    }
});


app.get('/events', async function(req, res) {
    try{
        
        let term = req.query.term;
        let latitute1 = parseFloat(req.query.latitute);
        let longitude1 = parseFloat(req.query.longitude);
        let radius = req.query.radius;
        if (radius == null || radius == "") {
            radius = 10;
        }
        let limit ="20";
        let category = req.query.category;
        console.log(req.query);
        let encoded = geohash.encode(latitute1, longitude1, 7);
        let url = get_ticketmaster_search_url + 'apikey=' + ticketmaster_api + '&keyword=' + term + '&segmentId=' + category + '&radius=' + radius + '&unit=miles&geoPoint=' + encoded + '&limit=' + limit;
        console.log(url);
        var response = await axios.get(url, {headers: get_headers()});
        var data = await response.data;
        console.log(data);
        var events=[];
        for (var i = 0; i < data._embedded.events.length; i++) {

            // if(data._embedded.events[i].hasOwnProperty('dates') && data._embedded.events[i].dates.hasOwnProperty('start') && data._embedded.events[i].dates.start.hasOwnProperty('localDate') && data._embedded.events[i].dates.start.hasOwnProperty('localTime')){
            var eventTi= data.hasOwnProperty("_embedded")&& data._embedded.hasOwnProperty("events") && data._embedded.events[i].hasOwnProperty("dates") && data._embedded.events[i].dates.hasOwnProperty("start") && data._embedded.events[i].dates.start.hasOwnProperty("localTime") ? data._embedded.events[i].dates.start.localTime: "";
            var eventDa= data.hasOwnProperty("_embedded")&& data._embedded.hasOwnProperty("events") && data._embedded.events[i].hasOwnProperty("dates") && data._embedded.events[i].dates.hasOwnProperty("start") && data._embedded.events[i].dates.start.hasOwnProperty("localDate") ? data._embedded.events[i].dates.start.localDate: "";
            var eventnameee= data.hasOwnProperty("_embedded")&& data._embedded.hasOwnProperty("events") && data._embedded.events[i].hasOwnProperty("name") ? data._embedded.events[i].name: "";
            var eventimage= data.hasOwnProperty("_embedded")&& data._embedded.hasOwnProperty("events") && data._embedded.events[i].hasOwnProperty("images") && data._embedded.events[i].images[0].hasOwnProperty("url") ? data._embedded.events[i].images[0].url: "";
            var eventvenueeee= data.hasOwnProperty("_embedded")&& data._embedded.hasOwnProperty("events") && data._embedded.events[i].hasOwnProperty("_embedded") && data._embedded.events[i]._embedded.hasOwnProperty("venues") && data._embedded.events[i]._embedded.venues[0].hasOwnProperty("name") ? data._embedded.events[i]._embedded.venues[0].name: "";
            var eventsegments= data.hasOwnProperty("_embedded")&& data._embedded.hasOwnProperty("events") && data._embedded.events[i].hasOwnProperty("classifications") && data._embedded.events[i].classifications[0].hasOwnProperty("segment") && data._embedded.events[i].classifications[0].segment.hasOwnProperty("name") ? data._embedded.events[i].classifications[0].segment.name: "";
            var event ={
                id: data._embedded.events[i].id,
                localdate: eventDa,
                localtime: eventTi,
                name: eventnameee,
                image: eventimage,
                segment: eventsegments,
                venue : eventvenueeee,
            };
            console.log(data._embedded.events[i].name);
            events.push(event);
        // }
        // else{
        //     continue;
        // }
        }

        events.sort(function(a, b) {
            return (new Date(a.localdate + " " + a.localtime)) - (new Date(b.localdate + " " + b.localtime));
        });
        res.json({eventsdata: events});
    
    }
    catch(err){
        console.log(err);
        res.json({err:"search error"});
    }

});

app.get('/eventdetails/:id', async function(req, res) {
    let eventdata;
    try{
        
        let url = get_ticketmaster_event_details_url + req.params.id + '.json?apikey=' + ticketmaster_api;
        var response = await axios.get(url, {headers: get_headers()});
        var data = await response.data;
        console.log(data);
        var name ="";

        var date =""; // checked
        var artists=[];// checked
        var string_atrist="";// checked
        var venue= "";// checked
        var genres =[];// checked
        var string_genres="";// checked
        var priceRange="";// checked
        var buy_ticket_at="";// checked
        var seatmap="";// checked
        var ticket_status="";// checked
        var twitter_string="";// checked
        var idd=req.params.id;// checked
        var url1 ="";// checked
        var event_coordinates=[];// checked

        if(data.hasOwnProperty('name')){
            name = data.name;
        }
        if(data.hasOwnProperty('_embedded') && data._embedded.hasOwnProperty('venues') && data._embedded.venues[0].hasOwnProperty('location') && data._embedded.venues[0].location.hasOwnProperty('latitude') && data._embedded.venues[0].location.hasOwnProperty('longitude')){
            event_coordinates.push(data._embedded.venues[0].location.latitude);
            event_coordinates.push(data._embedded.venues[0].location.longitude);
        }
        console.log("--------------Cordinates by Id-----------------");
        console.log(event_coordinates);
        // if(data.hasOwnProperty('location') && data.location.hasOwnProperty('latitude') && data.location.hasOwnProperty('longitude')){
        //     event_coordinates.push(data.location.latitude);
        //     event_coordinates.push(data.location.longitude);
        // }

        var maps_Cor={};
        if(event_coordinates.length != 0){
            maps_Cor ={center : {lat: event_coordinates[0], lng: event_coordinates[1]}};
        }

        // check if the data has local date 

        if(data.hasOwnProperty('dates') && data.dates.hasOwnProperty('start') && data.dates.start.hasOwnProperty('localDate')){
            date = data.dates.start.localDate;
        }

        // if(data.dates.start.localDate != null){
        //     date = data.dates.start.localDate;
        // }
        // check if the data has _embedded.attractions and store the name of the artists in artists array
        if(data.hasOwnProperty('_embedded') && data._embedded.hasOwnProperty('attractions'))
        {
            if(data._embedded.attractions != null){
            for (var i = 0; i < data._embedded.attractions.length; i++) {
                artists.push(data._embedded.attractions[i].name);
                }
            }
        }
        
        string_atrist = artists.join(" | ");
        console.log(artists);
        var music_related_artists = [];
        if(data.hasOwnProperty('_embedded') && data._embedded.hasOwnProperty('attractions'))
        {
            for (var i = 0; i < data._embedded.attractions.length; i++) {
                if(data._embedded.attractions[i].hasOwnProperty('classifications') && data._embedded.attractions[i].classifications[0].hasOwnProperty('segment') && data._embedded.attractions[i].classifications[0].segment.name == "Music"){
                    music_related_artists.push(data._embedded.attractions[i].name);
                }
            }
        }

        // check if the data has venue name

        if(data.hasOwnProperty('_embedded') && data._embedded.hasOwnProperty('venues') && data._embedded.venues[0].hasOwnProperty('name')){
            venue = data._embedded.venues[0].name;
        }

        // if(data._embedded.venues[0].name != null){
        //     venue = data._embedded.venues[0].name;
        // }
        // store the genres in the order of segment, genre, subgenre, type, subType

        if(data.hasOwnProperty('classifications') && data.classifications[0].hasOwnProperty('segment') && data.classifications[0].segment.hasOwnProperty('name') && data.classifications[0].segment.name != null && data.classifications[0].segment.name != "Undefined"){
            genres.push(data.classifications[0].segment.name);
        }
        if(data.hasOwnProperty('classifications') && data.classifications[0].hasOwnProperty('genre') && data.classifications[0].genre.hasOwnProperty('name') && data.classifications[0].genre.name != null && data.classifications[0].genre.name != "Undefined"){
            genres.push(data.classifications[0].genre.name);
        }
        if(data.hasOwnProperty('classifications') && data.classifications[0].hasOwnProperty('subGenre') && data.classifications[0].subGenre.hasOwnProperty('name') && data.classifications[0].subGenre.name != null && data.classifications[0].subGenre.name != "Undefined"){
            genres.push(data.classifications[0].subGenre.name);
        }
        if(data.hasOwnProperty('classifications') && data.classifications[0].hasOwnProperty('type') && data.classifications[0].type.hasOwnProperty('name') && data.classifications[0].type.name != null && data.classifications[0].type.name != "Undefined"){
            genres.push(data.classifications[0].type.name);
        }
        if(data.hasOwnProperty('classifications') && data.classifications[0].hasOwnProperty('subType') && data.classifications[0].subType.hasOwnProperty('name') && data.classifications[0].subType.name != null && data.classifications[0].subType.name != "Undefined"){
            genres.push(data.classifications[0].subType.name);
        }
        // console.log("----------------");
        // console.log(data.classifications[0]);
        // console.log("----------------");



        // if(data.classifications[0].segment.name != null && data.classifications[0].segment.name != "Undefined"){
        //     genres.push(data.classifications[0].segment.name);
        // }
        // if(data.classifications[0].genre.name != null && data.classifications[0].genre.name != "Undefined"){
        //     genres.push(data.classifications[0].genre.name);
        // }
        // if(data.classifications[0].subGenre.name != null && data.classifications[0].subGenre.name != "Undefined"){
        //     genres.push(data.classifications[0].subGenre.name);
        // }
        // if(data.classifications[0].type.name != null && data.classifications[0].type.name != "Undefined"){
        //     genres.push(data.classifications[0].type.name);
        // }
        // if(data.classifications[0].subType.name != null && data.classifications[0].subType.name != "Undefined"){
        //     genres.push(data.classifications[0].subType.name);
        // }
        string_genres = genres.join(" | ");

        // check if the data has priceRanges

        if(data.hasOwnProperty('priceRanges') && data.priceRanges[0].hasOwnProperty('min') && data.priceRanges[0].hasOwnProperty('max')){
            priceRange = data.priceRanges[0].min + " - " + data.priceRanges[0].max;
        }

        // if(data.priceRanges != null){
        //     priceRange = data.priceRanges[0].min + " - " + data.priceRanges[0].max;
        // }

        // check if the data has url

        if(data.hasOwnProperty('url') && data.url != null){
            buy_ticket_at = data.url;
            url1 = data.url;
        }

        // if(data.url != null){
        //     buy_ticket_at = data.url;
        // }

        // check if the data has seatmap   
        
        if(data.hasOwnProperty('seatmap') && data.seatmap.hasOwnProperty('staticUrl') && data.seatmap.staticUrl != null){
            seatmap = data.seatmap.staticUrl;
        }

        // if(data.seatmap != null){
        //     seatmap = data.seatmap.staticUrl;
        // }

        // check if the data has dates.status.code

        if(data.hasOwnProperty('dates') && data.dates.hasOwnProperty('status') && data.dates.status.hasOwnProperty('code') && data.dates.status.code != null){
            ticket_status = data.dates.status.code;
        }

        // if(data.dates.status.code != null){
        //     ticket_status = data.dates.status.code;
        // }
        // add a newline in the end of the string
        twitter_string = "Check " + data.name +" on Ticketmaster.%0A"+ data.url;
        console.log(twitter_string);
        // var result=[];
        // try{
            
        //     for (var i = 0; i < music_related_artists.length; i++) {
        //         var data = await get_artist(music_related_artists[i]);
        //         console.log(data);
        //         if(data == [])
        //         {
        //             continue;
        //         }
        //         else{
        //             result.push(data);
        //         }
        //     }
        // }
        // catch(err){
        //     console.log(err);
        // }
        // var dnd=false;
        // console.log(result.length);
        // if (result.length == 1 && result[0].length == 0){
        //     result = null;
        //     dnd = true;
        //     console.log("dnd");
        // }
        // console.log(result);
        // if(result.length ==0){
        //     dnd = true;
        //     console.log("dnd");
        // }
        // venue = "";
        // call the delay function 
        console.log("before delay");
        await delay();
        console.log("after delay");
        var eventvenuess = await get_venue(venue.length==0?null:venue);
        console.log("below is our new venue data");
        console.log(eventvenuess);
        console.log(music_related_artists.length);
        eventdata = {
            id: idd,
            name: name,
            main_url:url1,
            date: date,
            artists: string_atrist,
            venue: venue,
            genres: string_genres,
            priceRange: priceRange,
            buy_ticket_at: buy_ticket_at,
            seatmap: seatmap,
            ticket_status: ticket_status,
            twitter_string: twitter_string,
            data_maps: maps_Cor,
            event_coordinates: event_coordinates,
            music_related_artists: music_related_artists,
            eventvenuess: eventvenuess
        };



        // eventdata = {
        //     id: idd,
        //     name: name,
        //     main_url:url1,
        //     date: date,
        //     artists: string_atrist,
        //     venue: venue,
        //     genres: string_genres,
        //     priceRange: priceRange,
        //     buy_ticket_at: buy_ticket_at,
        //     seatmap: seatmap,
        //     ticket_status: ticket_status,
        //     twitter_string: twitter_string,
        //     data_maps: maps_Cor,
        //     event_coordinates: event_coordinates,
        //     dnd: dnd,
        //     spotify: result
        // };




        // var result=[];
        // var dummy =['Pitbull','Pink']
        // for (var i = 0; i < dummy.length; i++) {
        //     var data = await get_artist(dummy[i]);
        //     if(data == [])
        //     {
        //         continue;
        //     }
        //     else{
        //         result.push(data);
        //     }
        // }
        res.json({eventdata: eventdata});
    }
    catch(err){
        console.log(err);
        res.json({errors:err});
    }

});

async function delay() {
    return new Promise(resolve => setTimeout(resolve, 500));
}

async function get_venue(venue_name){
    let eventvenuedata;
    try{
        let url = get_ticketmaster_venue_url + 'apikey=' + ticketmaster_api + '&keyword=' + venue_name;
        var response = await axios.get(url, {headers: get_headers()});
        var data = await response.data;
        console.log('------------venue data------------');
        console.log(data);
        var name = "";
        var address = "";
        var city = "";
        var state = "";
        var phonenumber = "";
        var openhours = "";
        var generalrule = "";
        var childrule = "";
        var resultant_phone_number = "";
        var event_coordinates=[];

        if(data.hasOwnProperty('_embedded') && data._embedded.hasOwnProperty('venues') && data._embedded.venues[0].hasOwnProperty('location') && data._embedded.venues[0].location.hasOwnProperty('latitude') && data._embedded.venues[0].location.latitude != null){
            event_coordinates.push(data._embedded.venues[0].location.latitude);
            event_coordinates.push(data._embedded.venues[0].location.longitude);
        }
        console.log("--------------Cordinates by venue-----------------");
        console.log(event_coordinates);
            
        

        //check if the data has name
        if(data.hasOwnProperty('_embedded') && data._embedded.hasOwnProperty('venues') && data._embedded.venues[0].hasOwnProperty('name') && data._embedded.venues[0].name != null){
            name = data._embedded.venues[0].name;
        }

        
        var address_string ="";

        if(data.hasOwnProperty('_embedded') && data._embedded.hasOwnProperty('venues') && data._embedded.venues[0].hasOwnProperty('address') && data._embedded.venues[0].address.hasOwnProperty('line1')){
            address = data._embedded.venues[0].address.line1;
            address_string = address_string + address;
        }
        if(data.hasOwnProperty('_embedded') && data._embedded.hasOwnProperty('venues') && data._embedded.venues[0].hasOwnProperty('city') && data._embedded.venues[0].city.hasOwnProperty('name')){
            city = data._embedded.venues[0].city.name;
            address_string = address_string + ", " + city;
        }
        if(data.hasOwnProperty('_embedded') && data._embedded.hasOwnProperty('venues') && data._embedded.venues[0].hasOwnProperty('state') && data._embedded.venues[0].state.hasOwnProperty('name')){
            state = data._embedded.venues[0].state.name;
            address_string = address_string + ", " + state;
        }

        //check if the data has box office info
        if(data.hasOwnProperty('_embedded') && data._embedded.hasOwnProperty('venues') && data._embedded.venues[0].hasOwnProperty('boxOfficeInfo')){
            
            if(data.hasOwnProperty('_embedded') && data._embedded.hasOwnProperty('venues') && data._embedded.venues[0].hasOwnProperty('boxOfficeInfo') && data._embedded.venues[0].boxOfficeInfo.hasOwnProperty('openHoursDetail')){
                openhours = data._embedded.venues[0].boxOfficeInfo.openHoursDetail;
            }
            if(data.hasOwnProperty('_embedded') && data._embedded.hasOwnProperty('venues') && data._embedded.venues[0].hasOwnProperty('boxOfficeInfo') && data._embedded.venues[0].boxOfficeInfo.hasOwnProperty('phoneNumberDetail')){

                resultant_phone_number = data._embedded.venues[0].boxOfficeInfo.phoneNumberDetail;
                
    
            }
            else{
                resultant_phone_number = "";
            }
            
        }
        

        if(data.hasOwnProperty('_embedded') && data._embedded.hasOwnProperty('venues') && data._embedded.venues[0].hasOwnProperty('generalInfo') && data._embedded.venues[0].generalInfo.hasOwnProperty('generalRule')){
            generalrule = data._embedded.venues[0].generalInfo.generalRule;
        }
        if(data.hasOwnProperty('_embedded') && data._embedded.hasOwnProperty('venues') && data._embedded.venues[0].hasOwnProperty('generalInfo') && data._embedded.venues[0].generalInfo.hasOwnProperty('childRule')){
            childrule = data._embedded.venues[0].generalInfo.childRule;
        }

        // var address_string = address + ", " + city + ", " + state;

        var eventvenuess={
            name: name,
            address: address_string,
            phonenumber: resultant_phone_number,
            openhours: openhours,
            generalrule: generalrule,
            childrule: childrule,
            event_coordinates: event_coordinates
        };
        return eventvenuess;
        // res.json({eventvenuess: eventvenuess});
    }
    catch(err){
        console.log(err);
        var errors = err;
        return {errors:errors};
        // res.json({errors:err});
    }
}

app.get('/eventvenue/:venuename', async function(req, res) {

    let eventvenuedata;
    try{
        let url = get_ticketmaster_venue_url + 'apikey=' + ticketmaster_api + '&keyword=' + req.params.venuename;
        var response = await axios.get(url, {headers: get_headers()});
        var data = await response.data;
        console.log('------------venue data------------');
        console.log(data);
        var name = "";
        var address = "";
        var city = "";
        var state = "";
        var phonenumber = "";
        var openhours = "";
        var generalrule = "";
        var childrule = "";
        var resultant_phone_number = "";
        var event_coordinates=[];

        if(data.hasOwnProperty('_embedded') && data._embedded.hasOwnProperty('venues') && data._embedded.venues[0].hasOwnProperty('location') && data._embedded.venues[0].location.hasOwnProperty('latitude') && data._embedded.venues[0].location.latitude != null){
            event_coordinates.push(data._embedded.venues[0].location.latitude);
            event_coordinates.push(data._embedded.venues[0].location.longitude);
        }
        console.log("--------------Cordinates by venue-----------------");
        console.log(event_coordinates);
            
        

        //check if the data has name
        if(data.hasOwnProperty('_embedded') && data._embedded.hasOwnProperty('venues') && data._embedded.venues[0].hasOwnProperty('name') && data._embedded.venues[0].name != null){
            name = data._embedded.venues[0].name;
        }

        // if(data._embedded.venues[0].name != null){
        //     name = data._embedded.venues[0].name;
        // }
        var address_string ="";

        if(data.hasOwnProperty('_embedded') && data._embedded.hasOwnProperty('venues') && data._embedded.venues[0].hasOwnProperty('address') && data._embedded.venues[0].address.hasOwnProperty('line1')){
            address = data._embedded.venues[0].address.line1;
            address_string = address_string + address;
        }
        if(data.hasOwnProperty('_embedded') && data._embedded.hasOwnProperty('venues') && data._embedded.venues[0].hasOwnProperty('city') && data._embedded.venues[0].city.hasOwnProperty('name')){
            city = data._embedded.venues[0].city.name;
            address_string = address_string + ", " + city;
        }
        if(data.hasOwnProperty('_embedded') && data._embedded.hasOwnProperty('venues') && data._embedded.venues[0].hasOwnProperty('state') && data._embedded.venues[0].state.hasOwnProperty('name')){
            state = data._embedded.venues[0].state.name;
            address_string = address_string + ", " + state;
        }

        //check if the data has box office info
        if(data.hasOwnProperty('_embedded') && data._embedded.hasOwnProperty('venues') && data._embedded.venues[0].hasOwnProperty('boxOfficeInfo')){
            // check if the data has open hours
            if(data.hasOwnProperty('_embedded') && data._embedded.hasOwnProperty('venues') && data._embedded.venues[0].hasOwnProperty('boxOfficeInfo') && data._embedded.venues[0].boxOfficeInfo.hasOwnProperty('openHoursDetail')){
                openhours = data._embedded.venues[0].boxOfficeInfo.openHoursDetail;
            }
            if(data.hasOwnProperty('_embedded') && data._embedded.hasOwnProperty('venues') && data._embedded.venues[0].hasOwnProperty('boxOfficeInfo') && data._embedded.venues[0].boxOfficeInfo.hasOwnProperty('phoneNumberDetail')){

                // extract the phone number from phone number detail
                resultant_phone_number = data._embedded.venues[0].boxOfficeInfo.phoneNumberDetail;
                // var phone = data._embedded.venues[0].boxOfficeInfo.phoneNumberDetail;
                // var phone_number = phone.match(/\d/g);
                // phone_number = phone_number.join("");
                // if (phone_number.length == 10) {
                // var phonenumber = phone_number;
                // phonenumber = phone_number.substring(0);
                // const formattedPhoneNum = phonenumber.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    
                // console.log(formattedPhoneNum);
                // resultant_phone_number = formattedPhoneNum;
                // } else {
                // phonenumber = phone_number.substring(2);
                // const formattedPhoneNum = phonenumber.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    
                // console.log(formattedPhoneNum);
                // resultant_phone_number = formattedPhoneNum;
                // }
    
            }
            else{
                resultant_phone_number = "";
            }
            
        }
        

        // if(data._embedded.venues[0].boxOfficeInfo.phoneNumberDetail != null){

        //     // extract the phone number from phone number detail
        //     var phone = data._embedded.venues[0].boxOfficeInfo.phoneNumberDetail;
        //     var phone_number = phone.match(/\d/g);
        //     phone_number = phone_number.join("");
        //     if (phone_number.length == 10) {
        //     var phonenumber = phone_number;
        //     phonenumber = phone_number.substring(0);
        //     const formattedPhoneNum = phonenumber.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");

        //     console.log(formattedPhoneNum);
        //     resultant_phone_number = formattedPhoneNum;
        //     } else {
        //     phonenumber = phone_number.substring(2);
        //     const formattedPhoneNum = phonenumber.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");

        //     console.log(formattedPhoneNum);
        //     resultant_phone_number = formattedPhoneNum;
        //     }

        // }
        // if(data._embedded.venues[0].boxOfficeInfo.openHoursDetail != null){
        //     openhours = data._embedded.venues[0].boxOfficeInfo.openHoursDetail;
        // }
        if(data.hasOwnProperty('_embedded') && data._embedded.hasOwnProperty('venues') && data._embedded.venues[0].hasOwnProperty('generalInfo') && data._embedded.venues[0].generalInfo.hasOwnProperty('generalRule')){
            generalrule = data._embedded.venues[0].generalInfo.generalRule;
        }
        if(data.hasOwnProperty('_embedded') && data._embedded.hasOwnProperty('venues') && data._embedded.venues[0].hasOwnProperty('generalInfo') && data._embedded.venues[0].generalInfo.hasOwnProperty('childRule')){
            childrule = data._embedded.venues[0].generalInfo.childRule;
        }

        // var address_string = address + ", " + city + ", " + state;

        var eventvenuess={
            name: name,
            address: address_string,
            phonenumber: resultant_phone_number,
            openhours: openhours,
            generalrule: generalrule,
            childrule: childrule,
            event_coordinates: event_coordinates
        };

        res.json({eventvenuess: eventvenuess});
    }
    catch(err){
        console.log(err);
        res.json({errors:err});
    }
});

app.get('/spotify/:arname',function(req,res)
        {
            try{
              
            var selected_artist=[];
            var spotifyApi = new SpotifyWebApi({
            clientId: '83e642d043be4ceeb5a44622361354b6',
            clientSecret: '82d7951e27434fff9f007afdf90d72f8',
            // redirectUri: 'http://www.example.com/callback'
            });
            spotifyApi.clientCredentialsGrant()
            .then(function(data) {
            // Save the access token so that it's used in future calls
            spotifyApi.setAccessToken(data.body['access_token']);
            spotifyApi.searchArtists(req.params.arname)
            .then(function(data) {
                console.log(data.body);
                console.log("the data is below");
                console.log(data);
                if(data.body.artists.items.length == 0){
                    selected_artist.push("No Artist Found");
                    res.send(selected_artist);
                }
                else{
                console.log("the id is :"+data.body.artists.items[0].id);
                let artists;
                artists = data.body;
                var id = artists.artists.items[0].id;
                var img1="";
                var img2="";
                var img3="";
                var followers = artists.artists.items[0].followers.total;
                followers = followers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                var artist = {
                    id: id,
                    name: req.params.arname,
                    followers: followers,
                    popularity: artists.artists.items[0].popularity,
                    spotifylink: artists.artists.items[0].external_urls.spotify,
                    image: artists.artists.items[0].images,
                  };
                spotifyApi.getArtistAlbums(id, { limit : 3 })
                .then(function(data) {
                    console.log('--------------------------------------------------------------------');
                    console.log(data);
                    console.log('--------------------------------------------------------------------');
                    //get the length of data.body.items
                    if(data.hasOwnProperty('body') && data.body.hasOwnProperty('items') && data.body.items.length >=3)
                    {
                        if((data.hasOwnProperty('body') && data.body.hasOwnProperty('items') && data.body.items[0].hasOwnProperty('images') && data.body.items[0].images[0].hasOwnProperty('url')) &&  data.body.items[0].images[0].url != null){
                            img1 = data.body.items[0].images[0].url;
                        }
                        else{
                            img1="";
                        }
                        if((data.hasOwnProperty('body') && data.body.hasOwnProperty('items') && data.body.items[1].hasOwnProperty('images') && data.body.items[1].images[0].hasOwnProperty('url')) && data.body.items[1].images[0].url != null){
                            img2 = data.body.items[1].images[0].url;
                        }
                        else{
                            img2="";
                        }
                        if((data.hasOwnProperty('body') && data.body.hasOwnProperty('items') && data.body.items[2].hasOwnProperty('images') && data.body.items[2].images[0].hasOwnProperty('url')) && data.body.items[2].images[0].url != null){
                            img3 = data.body.items[2].images[0].url;
                        }
                        else{
                            img3="";
                        }
                    }
                    else if(data.hasOwnProperty('body') && data.body.hasOwnProperty('items') && data.body.items.length ==2){
                        if((data.hasOwnProperty('body') && data.body.hasOwnProperty('items') && data.body.items[0].hasOwnProperty('images') && data.body.items[0].images[0].hasOwnProperty('url')) &&  data.body.items[0].images[0].url != null){
                            img1 = data.body.items[0].images[0].url;
                        }
                        else{
                            img1="";
                        }
                        if((data.hasOwnProperty('body') && data.body.hasOwnProperty('items') && data.body.items[1].hasOwnProperty('images') && data.body.items[1].images[0].hasOwnProperty('url')) && data.body.items[1].images[0].url != null){
                            img2 = data.body.items[1].images[0].url;
                        }
                        else{
                            img2="";
                        }
                        img3="";
                    }
                    else if(data.hasOwnProperty('body') && data.body.hasOwnProperty('items') && data.body.items.length ==1){
                        if((data.hasOwnProperty('body') && data.body.hasOwnProperty('items') && data.body.items[0].hasOwnProperty('images') && data.body.items[0].images[0].hasOwnProperty('url')) &&  data.body.items[0].images[0].url != null){
                            img1 = data.body.items[0].images[0].url;
                        }
                        else{
                            img1="";
                        }
                        img2="";
                        img3="";
                    }
                    else{
                        img1="";
                        img2="";
                        img3="";
                    }
                    // if((data.hasOwnProperty('body') && data.body.hasOwnProperty('items') && data.body.items[0].hasOwnProperty('images') && data.body.items[0].images[0].hasOwnProperty('url')) &&  data.body.items[0].images[0].url != null){
                    //     img1 = data.body.items[0].images[0].url;
                    // }
                    // else{
                    //     img1="";
                    // }
                    // if((data.hasOwnProperty('body') && data.body.hasOwnProperty('items') && data.body.items[1].hasOwnProperty('images') && data.body.items[1].images[0].hasOwnProperty('url')) && data.body.items[1].images[0].url != null){
                    //     img2 = data.body.items[1].images[0].url;
                    // }
                    // else{
                    //     img2="";
                    // }
                    // if((data.hasOwnProperty('body') && data.body.hasOwnProperty('items') && data.body.items[2].hasOwnProperty('images') && data.body.items[2].images[0].hasOwnProperty('url')) && data.body.items[2].images[0].url != null){
                    //     img3 = data.body.items[2].images[0].url;
                    // }
                    // else{
                    //     img3="";
                    // }
                    //add img1 img2 img3 to artist object
                    artist.img1 = img1;
                    artist.img2 = img2;
                    artist.img3 = img3;
                    selected_artist.push(artist);
                    res.send(selected_artist);
                    
                }, function(err) {
                    console.error(err);
                    res.send(selected_artist);
                });
            }
            }, function(err) {
                console.error(err);
                res.send(selected_artist);
            });
            }, function(err) {
            console.log('Something went wrong when retrieving an access token', err.message);
            res.send(selected_artist);
            });
        }
        catch(err){
            console.log(err);
            res.send(selected_artist);
        }
        
    })


// app.get('/callback1', async function(req, res) {
//     try{
//         var result=[];
//         var dummy =['P!NK'];
//         for (var i = 0; i < dummy.length; i++) {
//             var data = await get_artist(dummy[i]);
//             console.log(data);
//             if(data == [])
//             {
//                 continue;
//             }
//             else{
//                 result.push(data);
//             }
//         }

//         res.json({result});
//     }
//     catch(err){
//         console.log(err);
//         res.json({errors:"search error"});
//     }


// });

// async function get_spotify_album(spotifyApi,id){
//     const data1 = await spotifyApi.getArtistAlbums(id, { limit : 3 });
//     return data1;
// }
// function to get the artist from spotify 
// console.log(get_artist('Pitbull'));

// async function get_fast(artist){
//     var selected_artist=[];
//     let artists;
//     var spotifyApi = new SpotifyWebApi({
//         clientId: '83e642d043be4ceeb5a44622361354b6',
//         clientSecret: '82d7951e27434fff9f007afdf90d72f8',
//         // redirectUri: 'http://www.example.com/callback'
//         });
//         const data22 = await spotifyApi.clientCredentialsGrant();
//         spotifyApi.setAccessToken(data22.body['access_token']);
//         const data = await spotifyApi.searchArtists(artist);
//         artists = data.body;
//         var id = artists.artists.items[0].id;
//                 var img1="";
//                 var img2="";
//                 var img3="";
//                 var album = await get_spotify_album(spotifyApi,id);
                    
//                     //check it the album contains images or not
//                     if(album.body.items[0].images[0].url != null){
//                         img1 = album.body.items[0].images[0].url;
//                     }
//                     else{
//                         img1="";
//                     }
//                     if(album.body.items[1].images[0].url != null){
//                         img2 = album.body.items[1].images[0].url;
//                     }
//                     else{
//                         img2="";
//                     }
//                     if(album.body.items[2].images[0].url != null){
//                         img3 = album.body.items[2].images[0].url;
//                     }
//                     else{
//                         img3="";
//                     }
//                 // console.log(album.body.items[0].images[0].url);
//                 // console.log(album.body.items[1].images[0].url);
//                 // console.log(album.body.items[2].images[0].url);
//                 var followers = artists.artists.items[0].followers.total;
//                 // convert the followers into the format of xxx,xxx,xxx
//                 followers = followers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

//                 var artist = {
//                   id: id,
//                   name: artists.artists.items[0].name,
//                   followers: followers,
//                   popularity: artists.artists.items[0].popularity,
//                   spotifylink: artists.artists.items[0].external_urls.spotify,
//                   image: artists.artists.items[0].images,
//                   img1:img1,
//                   img2:img2,
//                   img3:img3
//                 };
                
//                 selected_artist.push(artist);
//                 return selected_artist;
// }

async function get_artist(artist_name){
    console.log(artist_name);
    console.log("started");
    let artists;
    var selected_artist=[];
    try{
        var spotifyApi = new SpotifyWebApi({
        clientId: '83e642d043be4ceeb5a44622361354b6',
        clientSecret: '82d7951e27434fff9f007afdf90d72f8',
        // redirectUri: 'http://www.example.com/callback'
        });
        try {
            const data22 = await spotifyApi.clientCredentialsGrant();
            spotifyApi.setAccessToken(data22.body['access_token']);
            const data = await spotifyApi.searchArtists(artist_name);
            artists = data.body;
            
            for (var i = 0; i < artists.artists.items.length; i++) {
            //   if (artists.artists.items[i].name == artist_name) {
                var id = artists.artists.items[i].id;
                var img1="";
                var img2="";
                var img3="";
                var album = await get_spotify_album(spotifyApi,id);
                    
                    //check it the album contains images or not
                    if(album.body.items[0].images[0].url != null){
                        img1 = album.body.items[0].images[0].url;
                    }
                    else{
                        img1="";
                    }
                    if(album.body.items[1].images[0].url != null){
                        img2 = album.body.items[1].images[0].url;
                    }
                    else{
                        img2="";
                    }
                    if(album.body.items[2].images[0].url != null){
                        img3 = album.body.items[2].images[0].url;
                    }
                    else{
                        img3="";
                    }
                // console.log(album.body.items[0].images[0].url);
                // console.log(album.body.items[1].images[0].url);
                // console.log(album.body.items[2].images[0].url);
                var followers = artists.artists.items[i].followers.total;
                // convert the followers into the format of xxx,xxx,xxx
                followers = followers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

                var artist = {
                  id: id,
                  name: artist_name,
                  followers: followers,
                  popularity: artists.artists.items[i].popularity,
                  spotifylink: artists.artists.items[i].external_urls.spotify,
                  image: artists.artists.items[i].images,
                  img1:img1,
                  img2:img2,
                  img3:img3
                };
                
                selected_artist.push(artist);
                break;
            //   }
            }
            console.log("1st try");
            return selected_artist;
          } catch (err) {
            if (err.statusCode === 401) {
              try {
                const data = await spotifyApi.clientCredentialsGrant();
                spotifyApi.setAccessToken(data.body['access_token']);
                const data2 = await spotifyApi.searchArtists(artist_name);
                artists = data2.body;
                
                
                for (var i = 0; i < artists.artists.items.length; i++) {
                  console.log(artists.artists.items[i].name);
                //   if (artists.artists.items[i].name == artist_name) {

                    var id = artists.artists.items[i].id;
                    var img1="";
                    var img2="";
                    var img3="";
                    var album = await get_spotify_album(spotifyApi,id);
                    //check it the album contains images or not
                    if(album.body.items[0].images[0].url != null){
                        img1 = album.body.items[0].images[0].url;
                    }
                    else{
                        img1="";
                    }
                    if(album.body.items[1].images[0].url != null){
                        img2 = album.body.items[1].images[0].url;
                    }
                    else{
                        img2="";
                    }
                    if(album.body.items[2].images[0].url != null){
                        img3 = album.body.items[2].images[0].url;
                    }
                    else{
                        img3="";
                    }
                    // console.log(album.body.items[0].images[0].url);
                    // console.log(album.body.items[1].images[0].url);
                    // console.log(album.body.items[2].images[0].url);
                    var followers = artists.artists.items[i].followers.total;
                    // convert the followers into the format of xxx,xxx,xxx
                    followers = followers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    var artist = {
                      id: id,
                      name: artists.artists.items[i].name,
                      followers: followers,
                      popularity: artists.artists.items[i].popularity,
                      spotifylink: artists.artists.items[i].external_urls.spotify,
                      image: artists.artists.items[i].images,
                        img1:img1,
                        img2:img2,
                        img3:img3
                    };
                    selected_artist.push(artist);
                    break;
                //   }
                }
                return selected_artist;
              } catch (err) {
                console.log('Error searching artists', err);
              }
            } else {
              console.log('Error searching artists', err);
            }
          }
        // await spotifyApi.searchArtists(artist_name)
        //     .then(async function(data) {
        //         // If the function returns success, return the data directly
        //         console.log('Search artists in first fun', data.body);
        //         artists = data.body;
        //         // res.json({artists});
        //     })
        //     .catch(async function(err) {
        //         // If the function returns an error
        //         if (err.statusCode === 401) {
        //         // Call the clientCredentialsGrant function to get a new access token
        //         spotifyApi.clientCredentialsGrant()
        //             .then(async function(data) {
        //             // console.log('The access token expires in ' + data.body['expires_in']);
        //             // console.log('The access token is ' + data.body['access_token']);

        //             // Set the access token to the new token you received from clientCredentialsGrant
        //             spotifyApi.setAccessToken(data.body['access_token']);

        //             // Call the searchArtists function again with the new access token
        //             spotifyApi.searchArtists(artist_name)
        //                 .then(async function(data) {
        //                 // console.log('Search artists by Pitbull', data.body);
        //                 artists = data.body;
        //                 // console.log('-----------');
        //                 // console.log(artists);
        //                 // console.log(artists.artists.items[0].name);
        //                 // console.log(artists.artists.items[0]);

        //                 // iterates through the artists and append those artists.artists.items[i] to the selected_artist array whose artists.artists.items[i].name is equal to the artist_name
        //                 for (var i = 0; i < artists.artists.items.length; i++) {
        //                     console.log('inside for');
        //                     if(artists.artists.items[i].name == artist_name)
        //                     {   
        //                         console.log('inside if');
        //                         var artist = {
        //                             name: artists.artists.items[i].name,
        //                             followers: artists.artists.items[i].followers.total,
        //                             popularity: artists.artists.items[i].popularity,
        //                             spotifylink: artists.artists.items[i].external_urls.spotify,
        //                             image: artists.artists.items[i].images
        //                         };
        //                         selected_artist.push(artist);
        //                         console.log(selected_artist);
        //                     }
        //                 }
        //                 return selected_artist;
        //                 // res.json({artists});
        //                 })
        //                 .catch(async function(err) {
        //                 console.log('Error searching artists', err);
        //                 });
        //             })
        //             .catch(async function(err) {
        //             console.log('Error getting access token', err);
        //             });
        //         } else {
        //         console.log('Error searching artists', err);
        //         }
        //     });

        // spotifyApi.clientCredentialsGrant().then(
        //     function(data) {
        //       console.log('The access token expires in ' + data.body['expires_in']);
        //       console.log('The access token is ' + data.body['access_token']);
          
        //       // Save the access token so that it's used in future calls
        //       spotifyApi.setAccessToken(data.body['access_token']);
        //     },
        //     function(err) {
        //       console.log('Something went wrong when retrieving an access token', err);
        //     }
        //   );
        // spotifyApi.searchArtists('Love')
        //     .then(function(data) {
        //         console.log('Search artists by "Love"', data.body);
        //     }, function(err) {
        //         console.error(err);
        //     });
    }
    catch(err){
        console.log(err);
        return [];
    }

}

// app.get('/callback', function(req, res) {

//     let artists;
//     try{
//         var spotifyApi = new SpotifyWebApi({
//         clientId: '83e642d043be4ceeb5a44622361354b6',
//         clientSecret: '82d7951e27434fff9f007afdf90d72f8',
//         // redirectUri: 'http://www.example.com/callback'
//         });

//         spotifyApi.searchArtists('Pitbull')
//             .then(function(data) {
//                 // If the function returns success, return the data directly
//                 console.log('Search artists by Pitbull', data.body);
//                 artists = data.body;
//                 res.json({artists});
//             })
//             .catch(function(err) {
//                 // If the function returns an error
//                 if (err.statusCode === 401) {
//                 // Call the clientCredentialsGrant function to get a new access token
//                 spotifyApi.clientCredentialsGrant()
//                     .then(function(data) {
//                     console.log('The access token expires in ' + data.body['expires_in']);
//                     console.log('The access token is ' + data.body['access_token']);

//                     // Set the access token to the new token you received from clientCredentialsGrant
//                     spotifyApi.setAccessToken(data.body['access_token']);

//                     // Call the searchArtists function again with the new access token
//                     spotifyApi.searchArtists('Pitbull')
//                         .then(function(data) {
//                         // console.log('Search artists by Pitbull', data.body);
//                         artists = data.body;
//                         console.log('-----------');
//                         console.log(artists);
//                         console.log(artists.artists.items[0].name);
//                         console.log(artists.artists.items[0]);
//                         res.json({artists});
//                         })
//                         .catch(function(err) {
//                         console.log('Error searching artists', err);
//                         });
//                     })
//                     .catch(function(err) {
//                     console.log('Error getting access token', err);
//                     });
//                 } else {
//                 console.log('Error searching artists', err);
//                 }
//             });

//         // spotifyApi.clientCredentialsGrant().then(
//         //     function(data) {
//         //       console.log('The access token expires in ' + data.body['expires_in']);
//         //       console.log('The access token is ' + data.body['access_token']);
          
//         //       // Save the access token so that it's used in future calls
//         //       spotifyApi.setAccessToken(data.body['access_token']);
//         //     },
//         //     function(err) {
//         //       console.log('Something went wrong when retrieving an access token', err);
//         //     }
//         //   );
//         // spotifyApi.searchArtists('Love')
//         //     .then(function(data) {
//         //         console.log('Search artists by "Love"', data.body);
//         //     }, function(err) {
//         //         console.error(err);
//         //     });
//     }
//     catch(err){
//         console.log(err);
//         res.json({errors:"search error"});
//     }

// });
app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname, 'dist/assignment8/index.html'));
});
