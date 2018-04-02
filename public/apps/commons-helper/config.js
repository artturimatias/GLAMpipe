
var config = {
	nodes: {
		csv:{
			nodeid: "source_file_csv",
			params: {
				file: "",
				filename: ""
			},
			settings: {
				separator: ",",
				encoding: "utf8",
				columns: "true"
			}
		},
		
		map: {
			nodeid: "export_mapping_create_commons_metadata",
			params: {
				template: "0",
				out_field: "wikitext"
			},
			settings: {
				title_dynamic: "title",
				description_dynamic: "description",
				institution_dynamic: "institution"
			}
		},
		
		download: {
			nodeid: "process_file_download",
			params: {
				in_field: "path",
				out_field: "path_downloaded",
				out_ext: "path_ext",
				path_mime: "path_mime"
			},
			settings: {
				
			}
		},
		
		checksum: {
			nodeid: "process_file_calculate_checksum",
			params: {
				in_field: "path_downloaded",
				out_field: "checksum"
			},
			settings: {
				
			}
		},

		check_if_commons: {
			nodeid: "process_lookup_web_check_commons",
			params: {
				in_field: "checksum",
				server: "beta",
				out_field: "in_commons_beta"
			},
			settings: {
				
			}
		},
		
		commons_upload: {
			nodeid: "export_web_commons_file",
			params: {
				in_field: "checksum",
				in_title: "title",
				in_wikitext: "wikitext",
				in_checksum_result: "in_commons_beta",
				in_location: "path_downloaded",
				location_ext: "path_ext",
				server: "beta",
				out_field: "commons_beta_url"
			},
			settings: {
				
			}
		}
	}
}
