import { Meteor } from 'meteor/meteor';

Photos = new Mongo.Collection('photos');
Links = new Mongo.Collection("links");

var url = "";


Meteor.startup(() => {
});

//takes in a string that is a tag
Meteor.publish("photosSearch", function(tag, startDate, endDate, refreshed) {

  const ACCESS_TOKEN = "272855367.b6f7db4.27aee70b486a4fd7b1b5546c1da0453d";


  //if url has not been set inside server yet, set it
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
        
        /*NOTE: this code has been comment out because it is not needed necessarily

        through my research (undocumented) I was able to find that instagram returns images that might not have been captioned with the particular tag but have been commented on by the photo owner with the tag

        the below code is to demonstrate the ability to check for through the comments should the situation arise where a secondary check is needed 
        
        */ 


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

      //set the next rul for the next set of images
      url = parsedResponse.pagination.next_url;

      //tell the subscribe function on the client that the server is ready to send the images that are ready
      self.ready();

    }
    catch (error) {
      console.log("this is the " + counter + " error: ");
      console.log(error);
    }
  }
});

Meteor.methods({

  //for the write to DB functionality
  "writeToDB": function(tag, array, startDate, endDate) {

    var itemsInserted = 0;

    var collectionUniqueID = Random.id();


    //checking each item if in the DB
    array.forEach(function(photoObj) {
      console.log("matched photos:" + Photos.find({id: photoObj.id}).fetch().length);

      //if not in the DB create a collection id parameter, add it to the photo object and insert into DB
      var dbEntry = Photos.find({id: photoObj.id}).fetch();
      console.log(dbEntry);
      if(dbEntry.length == 0){
        photoObj["collectionUniqueID"] = [];
        //photoObj["collectionUniqueID"].push(collectionUniqueID);
        Photos.insert(photoObj);
        itemsInserted++;
      }

      //adds the collection ID for later retrieval
      if(Photos.find({id: photoObj.id, collectionUniqueID: collectionUniqueID}).fetch().length == 0) {
        Photos.update(
          {id: photoObj.id},
          {$push: {collectionUniqueID: collectionUniqueID}}
        );
      }
      
      
    });

    //checks for collection and updates the collections Lists to reflect the newly added list
    if(itemsInserted != 0) {

      var entry = Links.findOne({name: tag, startDate: startDate, endDate: endDate, unique_id: collectionUniqueID})
      if(!entry){
        Links.insert({name: tag, startDate: startDate, endDate: endDate, unique_id: collectionUniqueID });
      }
    }

    //reset base url on save 
    url = "";

    //return the collectionUniqueID in order for the template helper on the client side to sort and render the photos
    return collectionUniqueID;
  }
});

