import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';

import './main.html';

Photos = new Mongo.Collection('photos');


var END_DATE = moment().unix();
var START_DATE = END_DATE - (2 * 24 * 60 * 60);

Session.setDefault("tag", "");
Session.setDefault('searching', false);
Session.setDefault("refreshed", true);

Template.generate.onCreated(function() {
  //this.photos = new ReactiveVar([]);
});

// Tracker.autorun(function() {
//   if (Session.get('tag')) {
    
//   }
// });

Template.generate.helpers({
  currentTime() {
    return moment().utc().unix();
  },
  photos: function() {

    
    //return Photos.find({created_time: {$gte: START_DATE, $lte: END_DATE}});
    return Photos.find();
  },
  searching: function() {
    return Session.get("searching");
  }
});

Template.generate.events({
  'input #search': function(event, template) {
    // Session.set("tag", $("#search").val());

    // console.log(Session.get("tag"));


  },
  'click .load': function(event, template) {



    var tag = template.$("#search").val();

    if(tag) {
      Session.set("tag", tag);


    }

    var searchHandle = Meteor.subscribe('photosSearch', Session.get('tag'), START_DATE, END_DATE, Session.get("refreshed"));
    Session.set('searching', ! searchHandle.ready());
    Session.set("refreshed", false);



    Session.set("refreshed", false);
  },
  'click .load-more': function(event, template) {
    var searchHandle = Meteor.subscribe('photosSearch', Session.get('tag'), START_DATE, END_DATE, Session.get("refreshed"));
    Session.set('searching', ! searchHandle.ready());
    Session.set("refreshed", false);

  }
});

Template.photo.helpers({
  formattedDate: function(date) {
    console.log(typeof date);
    console.log(date);
    return moment.unix(date).format("MM/DD/YYYY HH:mm");
  }
});

