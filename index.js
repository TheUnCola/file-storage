var fs = require( 'fs' );
var path = require( 'path' );
var moment = require('moment');

fs.readdir( "./Process", function( err, files ) {
	if( err ) {
		console.error( "Could not list the directory.", err );
		process.exit( 1 );
	}

	files.forEach( function( file, index ) {
		let newFileName = "", newFileLocation = "", newFilePath = "", date, fileLocate;
		if(path.extname(file) == ".pdf" || path.extname(file) == ".jpg") {
			if(file.indexOf("_201") > -1) {
				newFileName = substrUpTo(file,"_201") + ".pdf";
			} else {
				newFileName = file;
			}
			console.log(newFileName);

			let fileSortArr = require('./locations.json');

			fileLocate = getNewFileLocation(file,fileSortArr);
			if(fileLocate) {
				newFileLocation = fileLocate;
			}

			date = checkDate(newFileName);
			if(date) {
				if(newFileLocation != "") newFileLocation += date.year + "/";
				if(date.fileDateUpdate) {
					newFileName = date.fileDateUpdate;
				}
			}

			if(newFileLocation != "") {

				console.log(newFileLocation);
				newFilePath = checkDirectory(newFileName, newFileLocation);

				moveNewFile("./Process/" + file, newFilePath, true);
			} else {
				//Rename and Leave in Process Folder
				newFileLocation = "./Process/";

				console.log(newFileLocation);
				newFilePath = checkDirectory(newFileName, newFileLocation);
				if(newFilePath) {
					moveNewFile("./Process/" + file, newFilePath, false);
				}
			}

			console.log(" ");
		}
	});
});

let getNewFileLocation = function(file,fileSortArr) {
	let fsPath = false;
	fileSortArr.forEach(function(fsObj) {
		if(doesStringExist(file,fsObj.has) && ((fsObj.not && !doesStringExist(file,fsObj.not)) || !fsObj.not)) fsPath = fsObj.path;
	});
	return fsPath;
}

let checkDate = function(newFileName) {
	let matchDate = newFileName.match(" [0-9]{1,2}\-[0-9]{1,2}\-([0-9]{4}|[0-9]{2})\.pdf");
	if(matchDate) {
		return {
			"fileDateUpdate": substrUpTo(newFileName,matchDate[0].trim()) + moment(substrUpTo(matchDate[0],'.pdf').trim(), 'MM-DD-YYYY').format('MM-DD-YYYY') + ".pdf",
			"year": moment(substrUpTo(matchDate[0],'.pdf').trim(), 'MM-DD-YYYY').year()
		}
	}
	let matchYear = newFileName.match(" 20[0-9][0-9]\.pdf");
	if(matchYear) {
		return {
			"fileDateUpdate": false,
			"year": substrUpTo(matchYear[0],'.pdf').trim()
		}
	}
	return false;
}

let checkDirectory = function(newFileName, newFileLocation) {
	if(!fs.existsSync(newFileLocation)) {
		console.log("Directory Path Does NOT Exist");
		fs.mkdirSync(newFileLocation);
		return newFileLocation + newFileName; // Don't need to check in directory for match because the directory never existed before
	} else if(!fs.existsSync(newFileLocation + newFileName)) {
		console.log("No File Exists Here With That Name");
		return newFileLocation + newFileName;
	} else if(newFileLocation == "./Process/") {
		console.log("Can't Rename Unmovable File Since The Name Already Exists Here");
		return false;
	} else {
		console.log("A File With That Name Already Exists Here");
		let filePlaced = false, x = 2;
		while(!filePlaced) {
			if(!fs.existsSync(newFileLocation + substrUpTo(newFileName,".pdf") + "_" + x + ".pdf")) {
				console.log("Found A Placement \"" + substrUpTo(newFileName,".pdf") + "_" + x + ".pdf\"");
				filePlaced = true;
				return newFileLocation + substrUpTo(newFileName,".pdf") + "_" + x + ".pdf";
			}
			x++;
		}
	}
}

let moveNewFile = function(oldFilePath, newFilePath, foundNewLocation) {
	fs.renameSync(oldFilePath, newFilePath);
	if(foundNewLocation) console.log("File Moved");
	else console.log("File Renamed In Process Directory");
}

let substrUpTo = function(string, upTo) {
	return string.substr(0,string.indexOf(upTo));
}

let doesStringExist = function(string, substr) {
		return (string.indexOf(substr) > -1);
}
