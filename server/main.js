import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  // code to run on server at startup
});


Meteor.methods({
  getPhotos: function(tag, request, startDate, endDate) {

    let VALID_BUFFER_NUM = 30;

    //if the incoming request is the first request being made for that tag, set the url
    if(request == "") {
      request = "http://api.instagram.com/v1/tags/" + tag + "/media/recent?access_token=272855367.b6f7db4.27aee70b486a4fd7b1b5546c1da0453d";
    }


    //http request
    var response = HTTP.get(request, {});

    //JSON parse of HTTP get
    var parsedResults = JSON.parse(response.content);

    //storing the array of items that are valid photos within the date range
    var validPhotos = [];

    //url for next 
    var url = "";

    console.log(url);
    

    while(validPhotos.length <= VALID_BUFFER_NUM) {

      //set the photos
      var photos = parsedResults.data;

      //set the next url to use in the next iteration
      url = parsedResults.pagination.next_url;


      console.log("-------------------------");
      console.log("photos 00 created time: " + photos[0].created_time);
      console.log("          endDate time: " + endDate);
      console.log("photos 19 created time: " + photos[19].created_time);
      console.log("isBetween: " + moment(endDate).isBetween(photos[0].created_time, photos[19].created_time));

      //endDate <= photos[0].created_time && endDate >= photos[19].created_time


      //loop through the 20 photo items in each request
      // for(var i = 0; i < photos.length; i++) {
      //   var photo = photos[i];

      //   console.log("-------------------------");
      //   console.log("ended- time: " + endDate);
      //   console.log("creatd time: " + photo.created_time);
      //   console.log("start- time: " + startDate);


      //   //console.log("isBetween: " + moment(photo.created_time).isBetween(startDate, endDate));


      //   // check in between dates
      //   if(photo.created_time >= startDate && photo.created_time <= endDate) {
      //     console.log("entered");
      //     validPhotos.push(photo);

      //     if(validPhotos.length == 20) break;
      //   }
      // }

      var breakEx = {};

      try {
        photos.forEach(function(photo) {

          console.log("-------------------------");
          console.log("ended- time: " + endDate);
          console.log("creatd time: " + photo.created_time);
          console.log("start- time: " + startDate);


          //console.log("isBetween: " + moment(photo.created_time).isBetween(startDate, endDate));


          // check in between dates
          if(photo.created_time >= startDate && photo.created_time <= endDate) {
            console.log("entered");
            validPhotos.push(photo);

            if(validPhotos.length == 20) {
              throw breakEx;
            }
          }
        });
      }
      catch(e) {

      }

      console.log("length of validPhotos: " + validPhotos.length);

      response = HTTP.get(url, {});
      parsedResults = JSON.parse(response.content);

    }

    return {
      data: validPhotos,
      pagination: { next_url: url }
    };

  }
});


// function check(arr, date, url) {
//  console.log()
//  if(arr[0].created_time >= date && arr[19].created_time <= date) {
//    return url;
//  }
//  else {
//    var results = JSON.parse(HTTP.get(url, {}).content);

//    check(results.data, date, results.pagination.next_url);
//  }
// }
//takes in a JSON parsed object, start date, endDate and URL
// function collectPhotos(results, startDate, endDate) {
//  var returnPhotos = discardPhotos(results, startDate, endDate);

//  if(returnPhotos == 20) {
//    return {data: returnPhotos}
//  }
// }


// function discardPhotos(photos, startDate, endDate) {
//  var arr = [];

//  for(var i = 0; i < photos.length; i++) {
//    var photo = photos[i];

//    console.log("-------------------------");
//    console.log("ended- time: " + endDate);
//    console.log("creatd time: " + photo.created_time);
//    console.log("start- time: " + startDate);


//    // check in between dates
//    if(moment(photo.created_time).isBetween(startDate, endDate)) {
//      console.log("entered");
//      arr.push(photo);
//    }
//  }

//  if(arr == 20) {
//    return arr;
//  }
// }
