import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';

import './main.html';


//client side, minimongo links to their server counterparts
Photos = new Mongo.Collection('photos');
Links = new Mongo.Collection("links");


var END_DATE = 0;
var START_DATE = 0;


//for the tag variable
Session.setDefault("tag", "");

//when the app is searching for photos
Session.setDefault('searching', false);

//to indicate that the client/server has refreshed and previous stored data can be released (ie. urls)
Session.setDefault("refreshed", true);

//to disable certain inputs when collection is loaded
Session.setDefault("loadedCollection", "");
Session.setDefault("collectionUniqueID", null);

//hiding the loadmore button if a collection is not being searched
Session.setDefault("disabledLoadMore", "hidden");

//reactive var for showing the big title overlay on top of images
Template.generate.onCreated(function() {
  this.tagName = new ReactiveVar("");
});


//return the links stored in the links collection
Template.collections.helpers({
  links() {
    return Links.find({});
  }
});


//init 2 datepickers
Template.generate.onRendered(function() {
    this.$('.datetimepicker.start-date').datetimepicker({
      format: 'MM/DD/YYYY',
      dayViewHeaderFormat: 'MMMM YYYY',
      minDate: moment("01/01/1970", "MM/DD/YYYY"),
      maxDate: moment(moment(), "MM/DD/YYYY"),
      showTodayButton: true,
      defaultDate: moment().subtract(2, 'days').format("MM/DD/YYYY")

    });

    this.$('.datetimepicker.end-date').datetimepicker({
      format: 'MM/DD/YYYY',
      dayViewHeaderFormat: 'MMMM YYYY',
      minDate: moment("01/01/1970", "MM/DD/YYYY"),
      maxDate: moment(moment(), "MM/DD/YYYY"),
      showTodayButton: true,
      defaultDate: moment().format("MM/DD/YYYY")

    });
});


Template.generate.helpers({
  //return the photos based on a collection ID and tag name
  photos: function() {
    return Photos.find({
      tags: Session.get("tag"),
      collectionUniqueID: Session.get("collectionUniqueID")
    });
  },

  //if the app is searching for photos
  searching: function() {
    return Session.get("searching");
  },

  //if a collection is loaded from the DB
  checkloadedCollection() {
    return Session.get("loadedCollection");
  },

  //show the current tag when typing
  currentTag() {

    if(Template.instance().tagName.get() == undefined) {
      return "";
    }
    else {
      return Template.instance().tagName.get();
    }
  },

  //hide the load more button if photos are not being pulled from instagram
  hidden() {
    console.log($(".photos-container").find("img").length);
    if($(".photos-container").find("img").length != 0) {
      Session.set("disabledLoadMore", "hidden");
    }

    return Session.get("disabledLoadMore");
  }
});


Template.generate.events({
  //if a collection link is clicked to load a collection from DB
  'click .collection-link': function(event, template) {

    Session.set("loadedCollection", "disabled");
    Session.set("tag", $(event.target).attr('key'));

    template.tagName.set("#" + Session.get("tag"));

    var clickedLinkEntry = Links.findOne({unique_id: $(event.target).attr('unique-id')});
    Session.set("collectionUniqueID", $(event.target).attr('unique-id'));
  },

  //get tag name
  'input #tagName': function(event, template) {
    template.tagName.set("#" + $("#tagName").val());
  },

  // when searching for photos
  'submit .photos-search': function(event, template) {
    event.preventDefault();

    var tag = template.$("#tagName").val();

    //quick check to see if tag is not set
    if(tag != "") {

      //load more button is now active
      Session.set("disabledLoadMore", "");

      Session.set("collectionUniqueID", null);

      Session.set("loadedCollection", "");

      //if the tag is not the same as last when it was set
      if(tag != Session.get("tag")) {
        Session.set("tag", tag);
      }

      //grab the end date and start date from the date pickers & convert to unix timestamps (UTC)
      START_DATE = moment($("#startDate").val()).unix();
      END_DATE = moment($("#endDate").val()).unix();

      //meteor subscribe function to subscribe a publish from the server
      var searchHandle = Meteor.subscribe('photosSearch', Session.get('tag'), START_DATE, END_DATE, Session.get("refreshed"));
      Session.set('searching', ! searchHandle.ready());
      Session.set("refreshed", false);
    }
    else {

      //if the fields are invalid
      alert("Invalid submission");
    }
  },

  //if load more button is clicked make a subscribe call and get new photos
  'click .load-more': function(event, template) {
    var searchHandle = Meteor.subscribe('photosSearch', Session.get('tag'), START_DATE, END_DATE, Session.get("refreshed"));
    Session.set('searching', ! searchHandle.ready());
    Session.set("refreshed", false);

  },

  //to save the collection to DB
  'click .save': function(event, template) {

    var photosLocalArr = Photos.find({
      tags: Session.get("tag")
    }).fetch();

    //console.log(foo);
    Meteor.call("writeToDB", Session.get("tag"), photosLocalArr, START_DATE, END_DATE, function(error, results) {
      if(error) {
        console.log("insert error: " + error);
      }
      else {
        console.log(results);

        Session.set("collectionUniqueID", results);
      }
    });
  }
});


