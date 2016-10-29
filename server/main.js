import { Meteor } from 'meteor/meteor';

Photos = new Mongo.Collection('photos');
Links = new Mongo.Collection("links");

var url = "";


Meteor.startup(() => {
  //url = "";
});

//takes in a string that is a tag
Meteor.publish("photosSearch", function(tag, startDate, endDate, refreshed) {

  const ACCESS_TOKEN = "272855367.b6f7db4.27aee70b486a4fd7b1b5546c1da0453d";

  console.log("starting url: " + url);
  if (url == "" || refreshed || url.indexOf(tag) == -1) {
      // the variable is defined
      url = "http://api.instagram.com/v1/tags/" + tag + "/media/recent?access_token=" + ACCESS_TOKEN;
  }

  
  var self = this;

  var counter = 0;

  while(counter <= 5) {

    console.log("current url: " + url);

    try {

      var response = HTTP.get(url, {});
      var parsedResponse = JSON.parse(response.content);
      
      parsedResponse.data.forEach( function(item) {
        // console.log(item);

        //check if comment from poster contains tag
        // if(item.caption.text.indexOf("#" + tag) == -1) {
        //   var urlComments = "http://api.instagram.com/v1/" + parsedResponse.id + "/media/comments?access_token=" + ACCESS_TOKEN;
        //   var responseComments = HTTP.get(urlComments, {});
        //   var parsedResponseComments = JSON.parse(responseComments.content);

        //   var commentFound = false;

        //   parsedResponse.data.forEach( function(comment) {
        //     if(comment.from.username == item.caption.from.username && .indexOf("#" + tag) !== -1 && !commentFound) {
        //       self.added('photos', Random.id(), item);
        //       commentFound = true;
        //     }
        //   });
        // }

        //if the tag exists within the certain dates
        if(item.created_time >= startDate && item.created_time <= endDate) {
          self.added('photos', Random.id(), item);
          counter++;
        }
      });

      url = parsedResponse.pagination.next_url;

      self.ready();

    }
    catch (error) {
      console.log("this is the " + counter + " error: ");
      console.log(error);
    }
  }
});

Meteor.methods({
  "writeToDB": function(tag, array, startDate, endDate) {

    var itemsInserted = 0;

    var collectionUniqueID = Random.id();

    array.forEach(function(photoObj) {
      console.log("matched photos:" + Photos.find({id: photoObj.id}).fetch().length);

      var dbEntry = Photos.find({id: photoObj.id}).fetch();
      console.log(dbEntry);
      if(dbEntry.length == 0){
        photoObj["collectionUniqueID"] = [];
        //photoObj["collectionUniqueID"].push(collectionUniqueID);
        Photos.insert(photoObj);
        itemsInserted++;
      }

      //to eliminate duplicate ID adds
      if(Photos.find({id: photoObj.id, collectionUniqueID: collectionUniqueID}).fetch().length == 0) {
        Photos.update(
          {id: photoObj.id},
          {$push: {collectionUniqueID: collectionUniqueID}}
        );
      }
      
      
    });

    if(itemsInserted != 0) {

      var entry = Links.findOne({name: tag, startDate: startDate, endDate: endDate, unique_id: collectionUniqueID})
      if(!entry){
        Links.insert({name: tag, startDate: startDate, endDate: endDate, unique_id: collectionUniqueID });
      }
    }

    //reset base url on save 
    url = "";

    return collectionUniqueID;
  }
});

