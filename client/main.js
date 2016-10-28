import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';

import './main.html';

Photos = new Mongo.Collection('photos');
Links = new Mongo.Collection("links");


var END_DATE = moment().unix();
var START_DATE = END_DATE - (2 * 24 * 60 * 60);

Session.setDefault("tag", "");
Session.setDefault('searching', false);
Session.setDefault("refreshed", true);

//to disable certain inputs when collection is loaded
Session.setDefault("loadedCollection", "");
Session.setDefault("collectionUniqueID", null);

Template.generate.onCreated(function() {
  //this.args = new ReactiveVar();
});

// Tracker.autorun(function() {
//   if (Session.get('tag')) {
    
//   }
// });

Template.collections.helpers({
  links() {
    return Links.find({});
  }
});

Template.collections.events({
  'click .collection-link': function(event, template) {
    Session.set("loadedCollection", "disabled");
    Session.set("tag", $(event.target).attr('key'));

    var clickedLinkEntry = Links.findOne({unique_id: $(event.target).attr('unique-id')});
    Session.set("collectionUniqueID", $(event.target).attr('unique-id'));
  }
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
  }
});

Template.generate.events({
  'input #search': function(event, template) {
    // Session.set("tag", $("#search").val());

    // console.log(Session.get("tag"));


  },
  'click .load': function(event, template) {



    if($("#search").val() != "") {

      Session.set("collectionUniqueID", null);

      Session.set("loadedCollection", "");

      var tag = template.$("#search").val();

      if(tag != Session.get("tag")) {
        Session.set("tag", tag);
      }

      var searchHandle = Meteor.subscribe('photosSearch', Session.get('tag'), START_DATE, END_DATE, Session.get("refreshed"));
      Session.set('searching', ! searchHandle.ready());
      Session.set("refreshed", false);
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

