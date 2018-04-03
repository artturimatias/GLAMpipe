
/*
pre_run.js must provide an *array* of upload objects (item specific URL, file title, full file path, out link and options)
*/

var file = context.doc[context.node.settings.in_file];
var title = context.doc[context.node.settings.in_file_title];
var uuid = context.doc[context.node.settings.in_uuid];
var filepath = context.node.settings.file_path;
var bundlename = context.node.settings.bundlename;
var bundlename_static = context.node.settings.bundlename_static;

var out_link = context.doc[context.node.params.out_link];

if(typeof uuid == "string" && context.validator.isUUID(uuid)) {

	var output = [];

	if(!filepath)
		filepath = "";

	// input can be array or string
	// we must pair filepaths and file titles
	if(Array.isArray(file) && Array.isArray(title)) {
		file.forEach(function(f, i) {
			var upload = createUpload(filepath, f, title[i], i);
			checkOutLink(upload, out_link, file, i);
			setBundleName(upload, bundlename, bundlename_static, i);
			if(upload)
				output.push(upload);
		})
	// file and title are strings
	} else if(typeof file === "string" && typeof title === "string") {
		var upload = createUpload(filepath, file, title);
		checkOutLink(upload, out_link, file);
		setBundleName(upload, bundlename, bundlename_static, null);
		if(upload)
			output.push(upload);
	// otherwise there 
	} else {
		out.console.log("ERROR: file path and file name must be arrays or strings!")
		context.skip = true;
	}



	// options object for POST request
	var url = context.node.params.required_url + "/items/" + uuid + "/bitstreams";

	output.forEach(function(upload) {
		var bundle = "";
		if(upload.bundlename) {
			bundle = "&bundleName=" + upload.bundlename; 
		}
		upload.options = {
			url: url + "?name=" + upload.title + bundle,
			jar:true,		// cookie jar on so that authentication works
			headers: {
				"accept": "application/json",
				"content-type": "multipart/form-data"
			}
		}
	})

	//out.console.log(output)
	out.pre_value = output;

} else {
	out.console.log("ERROR: missing UUID!");
	context.skip = true;
}


function checkOutLink(upload, out_link, file, index) {
	out.console.log("dddddddddddddddd")
	var link = null;
	out.console.log("out_link")
	out.console.log(out_link)
	// if file is string, then possible out_link is first row in "out_link" array
	if(typeof file === "string" && Array.isArray(out_link)) {
		link = out_link[0];
	}
	
	// if file is array, then possible out_link is nth row
	if(Array.isArray(file) && Array.isArray(out_link) && out_link[index]) {
		link = out_link[index];
		out.console.log("match")
		out.console.log(link)
	}

	// if there is an url in out_link, then we do not run again
	if(link && typeof link == "string" && link.match(/^http/)) {
		upload.link = link;
	}
}

function createUpload(filepath, file, title) {
	
	var link = "";
	
	var upload = {};
	if(!file || !title)
		return null;
		
	upload.file = filepath + file; // full file path
	upload.title = title;

	return upload;
}

function setBundleName(upload, bundlename, bundlename_static, index) {
	// set static bundlename if dynamic is not defined
	if(bundlename_static) {
		upload.bundlename = bundlename_static;
	}
	// static bundlename is overridden by dynamic value
	if(bundlename) {
		var bundle = context.doc[bundlename];
		if(index != null) {
			if(bundle && Array.isArray(bundle) && bundle[index]) {
				upload.bundlename = bundle[index];
			}
			
		} else if(bundle && typeof bundle === "string") {
			upload.bundlename = bundle;
		}
	}

}
