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
  currentTime() {
  	return moment().utc().unix();
  }
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

  			console.log(results);

  			var arr = Session.get("photos");
  			var resultsData = results.data;

  			

  			results.data = arr.concat(resultsData);

  			results.data.sort(compare);


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

Template.photo.helpers({
	formattedDate: function(date) {
		console.log(typeof date);
		console.log(date);
		return moment.unix(date).format("MM/DD/YYYY HH:mm");
	}
});

function compare(a,b) {
  if (a.created_time > b.created_time)
    return -1;
  if (a.created_time < b.created_time)
    return 1;
  return 0;
}

