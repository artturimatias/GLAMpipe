

var glamPipe = function () {
	var self = this;
	this.currentProject = "";
	this.currentCollectionSet = 0;
	this.currentNodes = {}; // active node per collection
	this.currentlyOpenNode = null; // currently open node

	this.pickedCollectionId = "";
	this.baseAPI = g_apipath;
	this.uiPath = g_uipath;
	this.desktop = true;
	this.config = {};

	this.projectPipeDiv = "#project-pipe";
	this.collectionSwitchDiv = "#collection-switch";
	this.collectionListDiv = "#collection-list-container";
	this.pageTitleDiv = "#page-title";
	this.nodeHolderDiv = "pipe .nodeset";

	this.collections = [];
	this.nodes = [];

	this.nodeRepository = new nodeRepository(self);

	// MAIN PAGE (projects)
	this.getProjectTitles = function (div) {

		$.getJSON(self.baseAPI + "/projects/titles", function(data) {
			$(div).empty();
			data.sort(compare);

			for(var i = 0; i< data.length; i++) {
				var listOption = "<div data-id=" + data[i]._id + " class='del wikiglyph wikiglyph-cross icon boxicon' aria-hidden='true'></div>";
				listOption += "<a href='" + self.uiPath + "projects/" + data[i]._id + "'>\n";
				listOption += "<div class='listoption'>\n";
				listOption += "<p class='listtitle'>" + data[i].title + "</p>\n";
				//listOption += "<p class='listtext'>" + data[i].description + "</p>\n";
				listOption += "</div></a>\n";
				$(div).append(listOption);
			}
		})
	}

	this.getProjects= function (div) {

		$(".settingstitle").text("All projects");
		$.getJSON(self.baseAPI + "/projects", function(data) {
			self.projects = data;
			$(div).empty();
			//data.sort(compare);
			html = "<table><thead><tr><th>title</th><th>imports from</th><th>collections</th><th>owners</th><th>exports to</th><th>action</th></tr></thead>";

			for(var i = 0; i< data.length; i++) {
				html += self.genProjectRow(data[i]);

			}
			$(div).append("</tr>" + html + "</table>");
		})
	}


	this.renderUsers = function(data_id, div) {
		var html = "";
		$.getJSON(self.baseAPI + "/users", function(data) {
			if(Array.isArray(data)) {
				html += "<select id='add_owner' data-id='"+data_id+"'><option>add owner</option>";
				for(var i=0; i<data.length; i++) {
					html += "<option>" + data[i] + "</option>"
				}
				html += "</select>";
			}
			$(div).replaceWith(html);
		})
	}

	this.renderProjectSettings = function(project) {
		var html = "<div id='project_settings'><h2>"+project.title+"</h2>";

		// owners
		html += "<h3>owners</h3>";
		if(Array.isArray(project.owner)) {
			html += "<ul id='owners'>";
			project.owner.forEach(function(owner) {
				if(owner != self.user)
					html += "<li>" + owner+ "<span> <a data-id='" + project._id + "' data-owner='"+owner+"' class='delete remove_owner' title='remove owner'>X</a></span></li>";
				else
					html += "<li>" + owner+ "</li>";
			})
			html += "</ul>";
		} else {
			html += project.owner;
		}
		html += "<div id='users'>users</div>";
		return html + "</div>";
	}

	this.getProjectsByUser = function (div, user) {

		$(".settingstitle").text("Projects by " + user);
		html = "<table><thead><th>title</th><th>imports from</th><th>collections</th><th>owners</th><th>exports to</th><th>action</th></thead>";
		$.getJSON(self.baseAPI +  "/collections/gp_projects/search?sort=_id&reverse=1&owner=" + user, function(data) {
			$(div).empty();
			self.projects = data.data;
			var projects = data.data;
			for(var i = 0; i< projects.length; i++) {

				// hide hidden (backend) projects fron other than owners
				if(!self.isOwner(projects[i].owner) && projects[i].hidden === true)
					continue;

				html += "<tr>";
				html += "</td>";

				if(projects[i].hidden === true)
					html += "<td><div><a href='projects/" + projects[i]._id + "'> "+ projects[i].title + "</a> (hidden)</div></td>";
				else
					html += "<td><div><a href='projects/" + projects[i]._id + "'> "+ projects[i].title + "</a></div></td>";

				html += "<td>";
				if(projects[i].nodes) {

					projects[i].nodes.forEach(function(node) {
						if(node.type === "source")
							html += "<div>" + node.title + "</div>";
					})
				}
				html += "</td>";

				//html += "<td><div>" + projects[i].owner + "</div></td>";

				html += "<td><div>";
				if(Array.isArray(projects[i].owner)) {

					projects[i].owner.forEach(function(owner) {
							html += "<li>" + owner+ "</li>";
					})
				} else {
					html += projects[i].owner;
				}
				html += "</div></td>";

				html += "<td>";
				if(projects[i].nodes) {

					projects[i].nodes.forEach(function(node) {
						if(node.type === "export")
							html += "<div>" + node.title + "</div>";
					})
				}
				html += "</td>";

				// actions
				html += "<td><a data-id='" + projects[i]._id + "' class='ibutton copy'>copy</a>";

				// delete link only for owners
				if(self.isOwner(projects[i].owner)) {
					html += " | <a data-id='" + projects[i]._id + "' class='delete'>delete</a>";
					html += "| <span data-id='" + projects[i]._id + "'class='wikiglyph wikiglyph-gear icon settings' title='settings'></span>";
				}
				html += "</td>";
				html += "</tr>";

			}
			$(div).append(html + "</table>");
		})
	}

	this.isOwner = function(owner) {

		if(Array.isArray(owner)) {
			if(owner.includes(self.user))
				return true
		} else {
			if(owner == self.user)
				return true;
		}
		return false;
	}

	this.genProjectRow = function(project) {
			var html = "<tr>";
			html += "<td><div><a href='projects/" + project._id + "'> "+ project.title + "</a></div></td>";

			html += "<td>";
			if(project.nodes) {
				project.nodes.forEach(function(node) {
					if(node.type === "source")
						html += "<div>" + node.title + "</div>";
				})
			}
			html += "</td><td>";

			// COLLECTIONS
			if(project.nodes) {
				project.nodes.forEach(function(node) {
					if(node.type === "collection")
						html += "<div>" + node.params.title + "</div>";
				})
			}

			html += "</td><td><div>" + project.owner + "</div></td>";

			//html += "<td><div>";
			//if(project.nodes) {

				//project.nodes.forEach(function(node) {
				//	if(node.type !== "collection")
				//		html += "<li>" + node.nodeid + "</li>";
				//})
			//}
			//html += "</div></td>";

			html += "<td>";
			if(project.nodes) {

				project.nodes.forEach(function(node) {
					if(node.type === "export")
						html += "<div>" + node.title + "</div>";
				})
			}
			html += "</td>";

			// actions
			html += "<td><a data-id='" + project._id + "' class='ibutton copy'>copy</a> | <a data-id='" + project._id + "' class='delete'>delete</a></td>";

			return html;

	}

	this.getUsers = function (div) {
		$.getJSON(self.baseAPI + "/collections/gp_projects/facet/owner?sort=_id", function(datal) {
		//$.getJSON(self.baseAPI + "/users", function(data) {
			$(div).empty();

			var data = datal.count;
			for(var i = 0; i< data.length; i++) {
				var listOption = "<div data-id=" + data[i]._id  + " class='' aria-hidden='true'></div>";
				listOption += "<a data-id='" + data[i]._id  + "' href='#'>\n";
				listOption += "<div class='listoption'>\n";
				if(data[i]._id === "")
					listOption += "<p class='listtitle'>ANONYMOUS ("+data[i].count+")</p>\n";
				else
					listOption += "<p class='listtitle'>" + data[i]._id + " ("+data[i].count+")</p>\n";
				listOption += "</div></a>\n";
				$(div).append(listOption);
			}
			console.log(data)
		})
	}

	this.getStatus = function(div) {
		var d = {
			url: self.baseAPI + "/status",
			method:"GET",
			headers: {"Accept":"application/json"},
			error: function(data, s, xhr) {
				$(div).empty().append("No connection to GLAMpipe!");
			},
			success: function(data) {
				$(div).empty().append("GLAMpipe is ready...");
			}
		}
		$.ajax(d);
	}

	this.getLoginStatus = function (div, cb) {
		$.getJSON(self.baseAPI + "/config", function(config) {
			self.config = config;
			if(config.nodedevmode)
				$("#version").empty().append("ver. " + config.version + " (devmode)");
			else
				$("#version").empty().append("ver. " + config.version);

			if(config.authentication === "local" || config.authentication === "shibboleth") {
				self.desktop = false;
				var d = {
					url: self.baseAPI + "/auth",
					method:"GET",
					headers: {"Authorization":"Bearer " + window.localStorage.getItem("token")},
					error: function(data, s, xhr) {
						if(config.authentication !== "shibboleth")
							$(div).html("<div class='button' id='login-pop'>Login</div> or <a href='/signup'>Signup</a>");
						else
							$(div).html("no shibboleth header found!");
						if(cb)
							cb(self.desktop);
					},
					success: function(data) {
						if(config.authentication === "local") {
							self.user = data.local.email;
							$(div).html("<a id='logout' href=''>Logout " + self.user + "</a>");
						} else if(config.authentication === "shibboleth") {
							if(data.shibboleth.user) {
								self.user = data.shibboleth.user;
								$(div).html("<a id='logout' href=''>Logout " + self.user + "</a>");
							} else if(data.shibboleth.visitor) {
								$(div).html("visitor: " + data.shibboleth.visitor);
							}
						}

						if(cb)
							cb(self.desktop);
					}
				}
				$.ajax(d);


			} else {
					$(div).empty();
					self.desktop = true;
					$(div).html("");

					if(cb)
						cb(self.desktop);
			}
		})
	}


	this.login = function(user, pass) {
		var d = {
			url:self.baseAPI + "/login",
			type:"POST",
			data: {
				email:user,
				password:pass
			},
			error:function() {console.log("fail"), alert("login failed!")},
			success: function(data) {
				console.log(data);
				if(data.success) {
					self.user = data.user.local.email;
					window.localStorage.setItem("token", data.token);
					$("#login-popup").remove();
					$("#login").html("<a id='logout'href=''>Logout " +data.user.local.email + "</a>");
					self.getProjectsByUser("#projectList", self.user);
				} else
					alert("Login failed!")
				}
		}
		$.ajax(d);

	}


	this.addProject = function (title) {

		var data = {"title": title};
		post(self.baseAPI + "/projects", data, function(data) {
			if(!data.error) {
				console.log('created project', data.project);
				window.location.href = self.uiPath + "projects/" + data._id;

			} else {
				alert(data.error);
			}
		})
	}

	this.addOwner = function (project_id, owner, cb) {

		var data = {"owner": owner};
		$.put(self.baseAPI + "/projects/" + project_id + "/owners", data, function(data) {
			cb();
		})
	}

	this.removeOwner = function (project_id, owner, cb) {

		var data = {"owner": owner};
		$.delete(self.baseAPI + "/projects/" + project_id + "/owners", data, function(data) {
			cb();
		})
	}

	this.getProject = function(id) {
		if(self.projects) {
			for(var i=0; i < self.projects.length; i++) {
				if(self.projects[i]._id === id)
					return self.projects[i];
			}
		}
	}

	this.copyProject = function (event) {
		console.log("starting to copy project:", $(event.target).data("id"));
		var project_id =  $(event.target).data("id");
		var project = self.getProject(project_id);

		$( "#dialog-confirm" ).empty().append("<label>Name for a new project</label><input id='copy_project_title' value='"+project.title+"'/>");
		$( "#dialog-confirm" ).dialog({
		  resizable: false,
		  height:160,
		  title:"Copy project",
		  modal: true,
		  buttons: {
			"Copy project": function() {
				var title = $("#copy_project_title").val();
				if(!title) {
					alert("You must give project title!");
					( this ).dialog( "close" );
				}


				$( this ).dialog( "close" );
				var params = {"title": title};
				post(self.baseAPI + "/copy/project/" + project_id, params, function(retData) {
					console.log('project copied');
					if(retData.error)
						alert(retData.error);
					else {
						if(self.desktop)
							self.getProjects("#projectList");
						else
							self.getProjectsByUser("#projectList", self.user);
					}
				});
			},
			Cancel: function() {
			  $( this ).dialog( "close" );
			}
		  }
		});
	}


	this.removeProject = function (event) {
		var project_id =  $(event.target).data("id");
		var project = self.getProject(project_id);

		$( "#dialog-confirm" ).empty().append("<div>Do you want to remove the project <strong>'"+project.title+"'</strong>? </div><br><div class='alert'>All data and files are lost!</div>");
		$( "#dialog-confirm" ).dialog({
		  resizable: false,
		  height:180,
		  title:"Deleting project",
		  modal: true,
		  buttons: {
			"Delete project": function() {
				$( this ).dialog( "close" );
				var params = {};
				$.delete(self.baseAPI + "/projects/" + project_id, params, function(retData) {
					console.log('project deleted');
					if(retData.error)
						alert(retData.error);
					else {
						if(self.desktop)
							self.getProjects("#projectList");
						else
							self.getProjectsByUser("#projectList", self.user);
					}
				});
			},
			Cancel: function() {
			  $( this ).dialog( "close" );
			}
		  }
		});
	}

	// PROJECT


	// loads node repository
	this.loadNodes = function() {
		this.nodeRepository = new nodeRepository(this);
	}

	this.loadProject = function (cb) {

		var path = window.location.pathname.split("/");
		self.currentProject = path[path.length - 1];

		self.collections = [];
		self.nodes = [];

		$.getJSON(self.baseAPI + "/projects/" + self.currentProject, function(project) {

			if(typeof project !== "undefined") {
				var nodes = project.nodes;
				
				var display = new dataTable(); // default data renderer
				self.display = display;
				self.collections = project.collections;
				var col = new GLAMPipeCollection(self, project.collections[0], display);
				self.display.render(col);
				self.currentCollection = project.collections[0]


				if(nodes) {
					for(var i = 0; i< nodes.length; i++) {
						self.nodes.push(new glamPipeNode(nodes[i], self, display));
					}
				}
				self.setPageTitle(project.title);
				self.project = project;

				self.getCollectionFromURL();
				self.setCollectionCounter();
				self.renderBreadCrumb();
				self.renderCollectionSet(cb);
				
			}
		})
	}


	this.getCollectionFromURL = function() {
		const urlParams = new URLSearchParams(window.location.search);
		var c = urlParams.get('collection'); 
		var index = 0;
		for(var col of self.collections) {
			if(col.name === c) {
				self.currentCollection = col;
				self.currentCollectionSet = index;
			}
			index++;
		}
	}

	this.setPageTitle = function (title) {
		$(self.pageTitleDiv).text(title);
	}



	// NODES

	// renders node settings and data
	this.openNode = function (e) {

		var node = self.getNode(e);
		self.currentlyOpenNode = node;
		//self.currentNodes[self.currentCollectionNode.source.collection] = node;
		if(node)
			node.open();
		else
			alert("node id not found");
	}


	this.openCurrentNode = function () {
		self.currentNodes[self.currentCollectionNode.source.collection].open();
	}

	this.runNode = function (e) {
		var node = self.getNode(e);
		if(node) {
			$("#node-messages").empty();
			$(".settings").addClass("busy");
			node.run();
		} else
			alert("node id not found");
	}

	this.stopNode = function (e) {
		var node = self.getNode(e);
		if(node) {
			$(".settings").removeClass("busy");
			node.stop();
		} else
			alert("node id not found");
	}

	this.debugInfo = function (e) {
		if(self.currentlyOpenNode)
			return self.currentlyOpenNode.renderDebug();

	}

	this.editNode = function (e) {
		if(self.currentlyOpenNode)
			return self.currentlyOpenNode.editNode();

	}


	// called by "finished" websocket message
	this.nodeRunFinished = function (data) {
		var node = self.getRegularNode(data.node_uuid);
		if(node)
			node.runFinished();
	}

	this.getNode = function (clickEvent) {
		var nodeid = $(clickEvent.target).data("id");

		if(nodeid == null)
			nodeid = $(clickEvent.target).closest(".node").data("id");

		// find from regular nodes
		for (var i = 0; i < self.nodes.length; i++) {
			if(self.nodes[i].source._id == nodeid)
				return self.nodes[i];

		}
		// find from collections
		for (var i = 0; i < self.collections.length; i++) {
			if(self.collections[i].source._id == nodeid)
				return self.collections[i];

		}
		return null;
	}

	this.getRegularNode = function (nodeid) {
		for (var i = 0; i < self.nodes.length; i++) {
			if(self.nodes[i].source._id == nodeid)
				return self.nodes[i];
		}
	}

	this.showNodeList = function (e) {
		var obj = $(e.target);
		self.nodeRepository.renderNodeList(obj.parents(".sectiontitleblock").next(".holder"), obj.data("type"))
	}




	this.createNode = async function (e) {
		var data = {params:{}};
		var obj = $(e.target);
		data.project = self.currentProject;
		var click = $(e.target);
		var node = await $.getJSON(self.baseAPI + "/collections/gp_repository/docs/" + click.data("id"));

		// check if are importing file
		if(node.type == "source" && node.subtype == "file" && node.nodeid != "source_directory_scan") {
			self.uploadFileAndCreateNode(obj, node);
			return;
		}

		// read params
		click.parents(".holder").find("input,textarea, select").not("input[type=button]").each(function(){
			if($(this).attr("type") == "checkbox") {
				if($(this).is(':checked'))
					data.params[$(this).attr("name")] = "on";
			} else {
				data.params[$(this).attr("name")] = $(this).val();
			}
		});

		var output_check = await self.outputExists(data.params);
		if(output_check) {
			alert("'" + output_check + "' output field exists! Please rename field." );
			return;
		}

		// set parent collection
		if(self.currentCollection == null) {
			alert("parent collection is missing");
		} else {
			data.collection = self.currentCollection.name;
			//console.log("currentCollection on node create:", self.currentCollectionNode.source.collection);

			post(self.baseAPI + "/nodes/" + node.nodeid, data, function(returnedData) {
				//console.log("node create:", returnedData);
				if(returnedData.error) {
					alert(returnedData.error);
					return;
				}
				var node = new glamPipeNode(returnedData, self, self.display);
				self.nodes.push(node);
				self.currentNodes[self.currentCollection.name] = node;
				self.currentlyOpenNode = node;
				self.renderCollectionSet(function() {
					node.open();
					$("data-workspace settingsblock").show();
					$("data-workspace settingscontainer submitblock").show();
				});


				//$("data-workspace settingscontainer .node-description").show();
			}).fail(function(xhr, status) {
				console.log(xhr.responseText)
				var json = null;
				try {
					json = JSON.parse(xhr.responseText)
				} catch(e) {

				}

				if(json && json.error) {
					alert(json.error);
				} else {
					alert("Error in node creation")
				}
			});
		}
	}

	this.getRunningNodes = function() {
		$.getJSON(self.baseAPI + "/register", function(result) {
			for(var key in result) {
				console.log(key)
				$("[data-id='" + key + "']").addClass("busy");
			}
		})
		//return result;
	}

	// check if any output field (starts with "out_") exists
	this.outputExists = async function(params) {
		var result = await $.getJSON(self.baseAPI + "/collections/" + self.currentCollection.name + "/fields");
		for(var param in params) {
			//console.log(param);
			if(/^out_/.test(param) && result.keys.includes(params[param])) {
				return param;
			}
		}
		return false;
	}

	this.createCollection = function (e) {
		$( "#dialog-confirm").empty().append("<label>collection name</label><input value='new collection'/>");
		$( "#dialog-confirm").dialog({
		  resizable: false,
		  height:160,
		  title:"Add collection ",
		  modal: true,
		  buttons: {
			"Add": function() {
				$( this ).dialog( "close" );
				var title = $( "#dialog-confirm input").val();
				var data = {"title":title};
				post(self.baseAPI + "/collections/?project=" + self.currentProject, data, function(returnedData) {
					console.log('created node');
					$(".holder.params").empty();
					// point currentCollectionSet to last collection
					self.currentCollectionSet = self.collections.length;
					self.loadProject();
				});
			},
			Cancel: function() {
			  $( this ).dialog( "close" );
			}
		  }
		});


	}


	this.renderDataHeader = function () {
		$("#data-header").empty().append(self.currentCollection.name);
	}

	this.renderBreadCrumb = function () {
		if(self.currentCollection)
			$("pipe .breadcrumbblock .boxtag").empty().append(self.project.title + " > " + self.currentCollection.title);
		else
			$("pipe .breadcrumbblock .boxtag").empty().append(self.project.title + " > ");
	}

	// renders node boxes sorted by types (source, process etc.)
	this.renderCollectionSet = function (cb) {
		
		if(!self.currentCollection) {
			console.log("no current collection")
			$("pipe .collection").empty().append("<a class='add-collection' title='Add new collection' href='#'> Add Collection</a>");
			return "";
		}

		$.getJSON(self.baseAPI + "/collections/" + self.currentCollection.name + "/fields", function(data) {
			//self.currentCollectionNode.fields = data.keys;

			if(self.currentCollection) {
				var collection = self.currentCollection;

				// render collection
				var col_html =   "<div><a href=''><span class='title pagetitle'>" + collection.title + "</span></a>";
				col_html += "<a class='add-collection' title='Add new collection' href='#'> Add </a>";
				col_html += "<a class='remove-collection' href='#' title='Remove this collection' data-id='"+collection.name+"'> Remove</a></div>";

				//col_html += "<div class='boxtext'>This is the description of the dataset</div>";
				$("pipe .collection").empty().append(col_html);

				var html = "";
				html += "<collectionset>"

				html += "  <div class='sectiontitleblock'>"
				html += "	<div><span class='title sectiontitle'>Read data</span> <a class='add-node' data-type='source' title='Add new import node' href='#'>Add</a></div>"
				html += "  </div><div class='holder params'></div>"

				html += self.renderNodes(collection,["source"]);


				html += "  <div class='sectiontitleblock'>"
				html += "	<div><span class='title sectiontitle'>View the data</span> <a class='add-node' data-type='view' title='Add new view node' href='addnode.html'>Add</a></div>"
				html += "  </div><div class='holder params'></div>"

				html += self.renderNodes(collection, ["view"]);

				html += "  <div class='sectiontitleblock'>"
				html += "	<div><span class='title sectiontitle'>Process the data</span> <a class='add-node' data-type='process' title='Add new processing node' href='addnode.html'>Add</a></div>"
				html += "  </div><div class='holder params'></div>"

				html += self.renderNodes(collection, ["process"]);

				html += "  <div class='sectiontitleblock'>"
				html += "	<div><span class='title sectiontitle'>Write the data</span> <a class='add-node' data-type='export' title='Add new export node' href='addnode.html'>Add</a></div>"
				html += "  </div><div class='holder params'></div>"

				html += self.renderNodes(collection, ["export"]);



			}
			html += "</collectionset>"


			$(self.nodeHolderDiv).empty();
			$(self.nodeHolderDiv).append(html);

			if(cb)
				cb(html);
		})
	}



	this.renderNodes = function (collection, types) {

		var html = "";
		for (var i = 0; i < self.nodes.length; i++) {
			var node = self.nodes[i];
			if (node.source.collection == collection.name) {
				if(types.indexOf(node.source.type) != -1) {
					html += node.renderNode();
				}
			}
		}
		return html;
	}


	// COLLECTION CHOOSER
	this.showCollections = function (e) {
		//console.log(self.collections);
		$(self.collectionListDiv).empty()
		console.log(self.collections.length);
		for (var i = 0; i < self.collections.length; i++) {
			var title = "no title";
			if(self.collections[i].title !== "")
				title = self.collections[i].title;
			$(self.collectionListDiv).append("<div class='collection-item' data-index='"+i+"'>" + title + "</div");
		}
		//$(self.collectionListDiv).append("<div class='add-collection'><a href='#'>add collection</a></div");
	}


	this.setCollectionCounter  = function () {
		$(self.collectionSwitchDiv).text((self.currentCollectionSet + 1) + " / " + self.collections.length)
	}


	this.prevCollection = function () {
		if (self.currentCollectionSet != 0) {
			self.currentCollectionSet--;
			var col = new GLAMPipeCollection(self, self.collections[self.currentCollectionSet], self.display);
			self.display.render(col)

			self.setCollectionCounter();
			self.currentCollection = self.collections[self.currentCollectionSet];
			self.pickedCollectionId = self.currentCollection.name;
			self.renderBreadCrumb();
			self.updateURL();
			self.renderCollectionSet();
			//if(self.currentNodes[self.currentCollectionNode.source.collection])
				//self.currentNodes[self.currentCollectionNode.source.collection].open();
			//else
				//self.currentCollectionNode.open();

			console.log("currentCollection = ", self.currentCollection.name);
		}
	}

	this.nextCollection = function () {

		if (self.currentCollectionSet != self.collections.length -1) {
			self.currentCollectionSet++;
			var col = new GLAMPipeCollection(self, self.collections[self.currentCollectionSet], self.display);
			self.display.render(col)

			self.setCollectionCounter();
			self.currentCollection = self.collections[self.currentCollectionSet];
			self.pickedCollectionId = self.currentCollection.name;
			self.renderBreadCrumb();
			self.updateURL();
			self.renderCollectionSet();
			//if(self.currentNodes[self.currentCollectionNode.source.collection])
				//self.currentNodes[self.currentCollectionNode.source.collection].open();
			//else
				//self.currentCollectionNode.open();

			console.log("currentCollection = ", self.currentCollection.name);
		}
	}



	this.updateURL = function() {
		const urlParams = new URLSearchParams(window.location.search);

		urlParams.set('collection', self.currentCollection.name);
		window.history.pushState('data', 'Title', location.protocol + '//' + location.host + location.pathname + '?' + urlParams);
		document.title = self.currentCollection.title

	}


	this.chooseCollection = function(index) {
		self.currentCollectionSet = parseInt(index)
		self.setCollectionCounter();
		self.currentCollection = self.collections[self.currentCollectionSet];
		self.pickedCollectionId = self.currentCollection.name;
		self.renderBreadCrumb();
		self.updateURL();
		self.renderCollectionSet();
		//if(self.currentNodes[self.currentCollectionNode.source.collection])
			//self.currentNodes[self.currentCollectionNode.source.collection].open();
		//else
			//self.currentCollectionNode.open();

		console.log("currentCollection = ", self.currentCollection.name);
	}

	this.updateDocument = function (data, cb) {
		$.put(self.baseAPI + "/collections/" + self.currentCollection.name + "/docs/" + data.doc_id + "/?manual=true", data, function( response ) {
			console.log(response);
			cb();
		})
	}

	this.deleteDocument = function(event) {
		var doc_id = $(event.target).data("id");
		//console.log(self.currentCollectionNode.source);
		$( "#dialog-confirm" ).empty().append("<div>Are you sure?</div>");
		$( "#dialog-confirm" ).dialog({
		  resizable: false,
		  height:160,
		  title:"Deleting document " + doc_id,
		  modal: true,
		  buttons: {
			"Delete document": function() {
				$( this ).dialog( "close" );
				var params = {};
				$.delete(self.baseAPI + "/collections/" + self.currentCollection.name + "/docs/" + doc_id, params, function(retData) {
					console.log('document deleted');
					if(retData.error)
						alert(retData.error);
					else {
						$(event.target).parents("tr").remove();
					}
				});
			},
			Cancel: function() {
			  $( this ).dialog( "close" );
			}
		  }
		});
	}

	this.renderDynamicCollectionFieldList = function (fieldSelect, event) {
		var obj = $(event.target);
		var collection = obj.val();
		var html = "";

		if(!collection) {
			alert("You must choose collection first!")
			return;
		}

		// fetch fields
		$.getJSON(self.baseAPI + "/collections/" + collection + "/fields", function(data) {
			if(data.error)
				alert(data.error);

			// add select
			html = "";

				for (var key of data.keys) {
					html += "<option class='pick_field' data-field='"+ obj.attr("name") +"' data-val='" + key + "'>" + key + "</option>";

				}
			html += "";

			fieldSelect.empty().append(html);
		})
	}


	this.collectionList = function (obj) {

		var html = "";
		for(var i = 0; i < self.collections.length; i++) {
			var collection = self.collections[i];
			if(collection.name != self.currentCollection.name) {
				html += '<option class="pick_collection" value="'+collection.name+'">' + collection.title + '</option>';
			}
		}
		return html;
	}


	this.pickField = function (event) {
		var obj = $(event.target);

		self.currentInput.val(obj.data("val"));
		self.currentInput.change();
		self.currentInput = null;

		$("#dynamic-fields").dialog("close");
	}


	this.pickCollection = function (event) {
		var obj = $(event.target);

		self.currentInput.val(obj.data("val"));
		self.currentInput.change();
		self.currentInput = null;

		// we pick fields from different collection than where we are adding the node
		self.pickedCollectionId = obj.data("val");

		$("#dynamic-fields").dialog("close");
	}

	this.saveNodeDescription = function(desc) {
		self.currentlyOpenNode.saveDescription(desc);
	}

	// node id comes from DOM attribute
	this.removeNode = function (event, nodeid) {
		var obj = $(event.target);
		if(typeof nodeid === "undefined")
			var node_id = obj.closest(".node").data("id");
		else
			var node_id = nodeid;

		$( "#dialog-confirm" ).empty().append("<div>Do you want to remove node?</div>");
		$( "#dialog-confirm" ).dialog({
		  resizable: false,
		  height:160,
		  title:"Deleting node",
		  modal: true,
		  buttons: {
			"Delete node": function() {
				$( this ).dialog( "close" );
				$.delete(self.baseAPI + "/nodes/" + node_id, {}, function(retData) {
					if(retData.error)
						alert(retData.error);
					else {
						self.loadProject();
					}
				});
			},
			Cancel: function() {
			  $( this ).dialog( "close" );
			}
		  }
		});
	}


	this.removeCollection = function (event, nodeid) {
		var obj = $(event.target);
		if(typeof nodeid === "undefined")
			var node_id = obj.closest(".node").data("id");
		else
			var node_id = nodeid;

		$( "#dialog-confirm" ).empty().append("<div class='bad'>Do you REALLY want to remove this collection with its nodes and data?</div>");
		$( "#dialog-confirm" ).dialog({
		  resizable: false,
		  height:160,
		  width:360,
		  title:"Deleting node",
		  modal: true,
		  buttons: {
			"Yes, delete nodes and collection": function() {
				$( this ).dialog( "close" );
				$.delete(self.baseAPI + "/collections/" + self.currentCollection.name, {}, function(retData) {
					if(retData.error)
						alert(retData.error);
					else {
						self.loadProject();
					}
				});
			},
			Cancel: function() {
			  $( this ).dialog( "close" );
			}
		  }
		});
	}


	this.uploadFileAndCreateNode = function (obj, node) {

		var params = {};

		// read params. These are send to actual node creation
		obj.parents(".holder").find("input,textarea, select").not("input[type=button],input[type=submit]").each(function(){
			params[$(this).attr("name")] = $(this).val();
		});

		// read form for file upload
		var form = $("#uploadfile")[0];
		var fd = new FormData(form);
		fd.append("project",self.currentProject);

		// upload file
		//$.ajax({
			//url: self.baseAPI + "/uploads",
			//type: "POST",
			//dataType: "json",
			//data:  fd,
			//contentType: false,
			//cache: false,
			//processData:false,
			//headers: {"Authorization": "Bearer " + localStorage.getItem("token")},
			//success: function(data)
			//{
				//if (data.error) {
					//alert(data.error);
					//$('#loading').hide();
				//} else {
					//// create actual node
					//data.params = params;
					//data.params.filename = data.filename;
					//data.params.mimetype = data.mimetype;
					//data.project = self.currentProject;
					//data.collection = self.currentCollection.name;
					//post(self.baseAPI + "/nodes/" + node.nodeid, data, function(returnedData) {
						//console.log('created upload node');
						//self.loadProject();
					//});
				//}
			//}
	   //});
		
		var data= {}
		data.params = params;
		data.params.filename = data.filename;
		data.params.mimetype = data.mimetype;
		data.project = self.currentProject;
		data.collection = self.currentCollection.name;
					
		post(self.baseAPI + "/nodes/" + node.nodeid, data, function(nodedata) {
			console.log('created upload node');
			$.ajax({
				url: self.baseAPI + "/nodes/" + nodedata.source._id + "/upload",
				type: "POST",
				dataType: "json",
				data:  fd,
				contentType: false,
				cache: false,
				processData:false,
				headers: {"Authorization": "Bearer " + localStorage.getItem("token")},
				success: function(nodedata) {self.loadProject();}
			})
			
		});

	}

}




$.delete = function(url, data, callback, type){

  if ( $.isFunction(data) ){
	type = type || callback,
		callback = data,
		data = {}
  }

  return $.ajax({
	url: url,
	type: 'DELETE',
	success: callback,
	data: data,
	contentType: type,
	headers: {"Authorization": "Bearer " + localStorage.getItem("token")}
  }).fail(function(jqXHR, textStatus, errorThrown ) {
		if(errorThrown === "Unauthorized")
			alert("You are not logged in or you are not the owner of the project!")
		else
			alert(errorThrown)
	});
}


post = function(url, data, callback, type){

  if ( $.isFunction(data) ){
	type = type || callback,
	callback = data,
	data = {}
  }

  return $.ajax({
	url: url,
	type: 'POST',
	data: data,
	success:callback,
	contentType: type,
	headers: {"Authorization": "Bearer " + localStorage.getItem("token")}, function(){alert("pat")}
  }).fail(function(jqXHR, textStatus, errorThrown ) {
		if(errorThrown === "Unauthorized")
			alert("You are not logged in or you are not the owner of the project!")
		else
			alert(errorThrown)
	});
}

$.put = function(url, data, callback, type){

  if ( $.isFunction(data) ){
	type = type || callback,
	callback = data,
	data = {}
  }

  return $.ajax({
	url: url,
	type: 'PUT',
	data: data,
	success:callback,
	contentType: type,
	headers: {"Authorization": "Bearer " + localStorage.getItem("token")}, function(){alert("pat")}
  }).fail(function(jqXHR, textStatus, errorThrown ) {
		if(errorThrown === "Unauthorized")
			alert("You are not logged in or you are not the owner of the project!")
		else
			alert(errorThrown)
	});
}


function compare(a,b) {
  if (a.last_nom < b.last_nom)
	return -1;
  else if (a.last_nom > b.last_nom)
	return 1;
  else
	return 0;
}
