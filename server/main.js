import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
  // code to run on server at startup
});

Meteor.methods({
	getPhotos: function(tag, request, startDate, endDate) {

		if(request == "") {
			request = "http://api.instagram.com/v1/tags/" + tag + "/media/recent?access_token=272855367.b6f7db4.27aee70b486a4fd7b1b5546c1da0453d";
		}

		var response = HTTP.get(request, {});

		var results = JSON.parse(response.content);

		var response = results;

		var arr = [];
		var url = "";

		while(arr.length <= 20) {

			var photos = response.data;
			url = response.pagination.next_url;

			for(var i = 0; i < photos.length; i++) {
				var photo = photos[i];

				console.log("-------------------------");
				console.log("ended- time: " + endDate);
				console.log("creatd time: " + photo.created_time);
				console.log("start- time: " + startDate);


				//console.log("isBetween: " + moment(photo.created_time).isBetween(startDate, endDate));


				// check in between dates
				if(photo.created_time >= startDate && photo.created_time <= endDate) {
					console.log("entered");
					arr.push(photo);
				}
			}

			console.log("length of arr: " + arr.length);

			response = JSON.parse(HTTP.get(url, {}).content);
		}

		results.data = arr;

		results.pagination = {};
		results.pagination.next_url = url;

		return results;

	}
});

//takes in a JSON parsed object, start date, endDate and URL
// function collectPhotos(results, startDate, endDate) {
// 	var returnPhotos = discardPhotos(results, startDate, endDate);

// 	if(returnPhotos == 20) {
// 		return {data: returnPhotos}
// 	}
// }


// function discardPhotos(photos, startDate, endDate) {
// 	var arr = [];

// 	for(var i = 0; i < photos.length; i++) {
// 		var photo = photos[i];

// 		console.log("-------------------------");
// 		console.log("ended- time: " + endDate);
// 		console.log("creatd time: " + photo.created_time);
// 		console.log("start- time: " + startDate);


// 		// check in between dates
// 		if(moment(photo.created_time).isBetween(startDate, endDate)) {
// 			console.log("entered");
// 			arr.push(photo);
// 		}
// 	}

// 	if(arr == 20) {
// 		return arr;
// 	}
// }
