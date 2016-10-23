import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';

import './main.html';

Session.setDefault("photos", []);
Session.setDefault("nextURL", "");
var tag = "";

Template.generate.onCreated(function() {
  //this.photos = new ReactiveVar([]);
});

Template.generate.helpers({
  photos() {
    //return Template.instance().photos.get();
    return Session.get("photos");
  },
});

Template.generate.events({
	'input #search': function(event, template) {
		// Session.set("tag", $("#search").val());

		// console.log(Session.get("tag"));

		tag = $("#search").val();
		console.log(tag);
	},
  'click button': function(event, instance) {

  	console.log($("#search").val());

  	if(tag != "" && tag != null) {
  		tag = $("#search").val();
  		var url = Session.get("nextURL");
  		var startDate = 1476748800;
  		var endDate = 1477007999;
  		Meteor.call('getPhotos', tag, url, startDate, endDate, function(error, results) {

  			var arr = Session.get("photos");
  			var resultsData = results.data;

  			console.log(resultsData);

  			results.data = arr.concat(resultsData);


  			Session.set("photos", results.data);
  			Session.set("nextURL", results.pagination.next_url);
  			console.log(Session.get("nextURL"));
  		});
  	}
  	else {

  		alert("input tag invalid");
  		
  	}
  }
});
