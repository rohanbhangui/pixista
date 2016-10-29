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



Template.collections.helpers({
  links() {
    return Links.find({});
  }
});

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
  currentTime() {
    return moment().utc().unix();
  },
  photos: function() {
    return Photos.find({
      tags: Session.get("tag"),
      collectionUniqueID: Session.get("collectionUniqueID")
    });
  },
  searching: function() {
    return Session.get("searching");
  },
  checkloadedCollection() {
    return Session.get("loadedCollection");
  },
  currentTag() {

    if(Template.instance().tagName.get() == undefined) {
      return "";
    }
    else {
      return Template.instance().tagName.get();
    }
  },
  hidden() {
    console.log($(".photos-container").find("img").length);
    if($(".photos-container").find("img").length != 0) {
      Session.set("disabledLoadMore", "hidden");
    }

    return Session.get("disabledLoadMore");
  }
});

Template.generate.events({
  'click .collection-link': function(event, template) {

    Session.set("loadedCollection", "disabled");
    Session.set("tag", $(event.target).attr('key'));

    template.tagName.set("#" + Session.get("tag"));

    var clickedLinkEntry = Links.findOne({unique_id: $(event.target).attr('unique-id')});
    Session.set("collectionUniqueID", $(event.target).attr('unique-id'));
  },
  'input #tagName': function(event, template) {
    template.tagName.set("#" + $("#tagName").val());
    // console.log(Session.get("tag"));
  },
  'submit .photos-search': function(event, template) {
    event.preventDefault();

    var tag = template.$("#tagName").val();


    if(tag != "") {

      Session.set("disabledLoadMore", "");

      Session.set("collectionUniqueID", null);

      Session.set("loadedCollection", "");

      if(tag != Session.get("tag")) {
        Session.set("tag", tag);
      }

      console.log($("#startDate").val() + "," + $("#endDate").val());

      START_DATE = moment($("#startDate").val()).unix();
      END_DATE = moment($("#endDate").val()).unix();

      console.log(START_DATE + "," + END_DATE);

      var searchHandle = Meteor.subscribe('photosSearch', Session.get('tag'), START_DATE, END_DATE, Session.get("refreshed"));
      Session.set('searching', ! searchHandle.ready());
      Session.set("refreshed", false);
    }
    else {
      alert("Invalid submission");
    }
  },
  'click .load-more': function(event, template) {
    var searchHandle = Meteor.subscribe('photosSearch', Session.get('tag'), START_DATE, END_DATE, Session.get("refreshed"));
    Session.set('searching', ! searchHandle.ready());
    Session.set("refreshed", false);

  },
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

Template.photo.helpers({
  formattedDate: function(date) {
    console.log(typeof date);
    console.log(date);
    return moment.unix(date).format("MM/DD/YYYY HH:mm");
  }
});

