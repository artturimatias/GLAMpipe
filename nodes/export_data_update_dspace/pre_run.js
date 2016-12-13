
// outputs an array of metadata objects

var update_value = context.doc[context.node.settings.update_field];
var language_value = context.doc[context.node.settings.language_field];
var original_field = context.node.params.original_field; // field to be updated
var metadata = [];


// if new value field is not set, then raise error
if(context.node.settings.update_field == null || context.node.settings.update_field == "") {
	out.error = "You did not set field for new value!";
// if original value and new value are the same, then we do not update
} else if(context.node.settings.original_value) {
	var original_value = context.doc[original_value];
	if(update_value === original_value) {
		out.value = null;
	} 	
} else {
// create new metadata object
	createNewVal();
}

out.value = metadata;
                                                   // UUID of item
out.url =  context.node.params.url + "/items/" + context.doc.uuid + "/metadata";



// FUNCTIONS
// input can be an array or primitive value
function createNewVal () {
	if(update_value && Array.isArray(update_value)) {
		
		for (var i = 0; i < update_value.length; i++) {
			var lang = getLanguageValue(language_value, i);
			var meta = {"key": original_field, "value":update_value[i], "language": lang};
			metadata.push(meta);		
		}
		
	} else {
		var lang = getLanguageValue(language_value);
		var meta = {"key": original_field, "value":update_value, "language": lang};
		metadata.push(meta);
	} 
}

function getLanguageValue (language, index) {
	// if index is given (i.e. input is array), we try to get correspondent index from language
	if(typeof index !== "undefined" && language && Array.isArray(language)) {
		if(language[index])
			return language[index];
		else 
			return ""; // if that fails, then we return empty string
			
	// if there is no index, then return language value
	} else {
		if(language)
			return language;
		else
			return "";
	} 
}




