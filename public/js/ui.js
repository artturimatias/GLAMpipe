
$( document ).ready(function() {
	

    var gp = new glamPipe();
    
    gp.getStatus("#node-progress");
    
    gp.getLoginStatus("#login", function(desktop) {
        if(desktop) {
            $("#user-box").hide();
            gp.getProjects("#projectList");
        } else {
            $("#project-box").hide();
            if(gp.user)
				gp.getProjectsByUser("#projectList", gp.user);
            else
				gp.getProjects("#projectList");
            gp.getUsers("#userList");
        }
    });

	$(document).on("click", "#login-pop", function(e) {
		$("#login").empty();
		$("#login").append("<div id='login-popup'>username: <input id='username'/>password:<input id='password' type='password'/><div class='button' id='login-submit'>Login</div> <a id='login-cancel' href='#'>Cancel</a> </div>");
		$("#username").focus();
		e.preventDefault();
	});

	// login button
	$(document).on("click", "#login-submit", function(e) {
		login(gp);
		e.preventDefault();
	});

	// login with enter
	$(document).on("keyup", "#login-popup input", function(e) {
		 var key = e.which;
		 if(key == 13)  {
			login(gp);  
		}
	});

	$(document).on("click", "#login-cancel", function(e) {
		$("#login").empty();
		$("#login").append("<div class='button' id='login-pop'>Login</div> or <a href='/signup'>Signup</a>");
		e.preventDefault();
	});


	$(document).on("click", "#logout", function(e) {
		localStorage.removeItem("token");
		$("#login").empty().append("<a class='button' id='login-pop' href=''>Login</a> or <a href='/signup'>Signup</a>");
		gp.getProjects("#projectList");
		e.preventDefault();
	});

    $("#user-box").on("click", "a", function (e) {
        var user = $(e.target).parents("a").data("id");
		gp.getProjectsByUser("#projectList", user);
        e.preventDefault();
	});


	$("#create_project").on("click", function () {
		addProject(gp);
	});

	$(".create_project #title").on("keyup", function (e) {
		 var key = e.which;
		 if(key == 13)  {
			addProject(gp);  
		}
	});

	// copy project
	$(document).on('click', ".copy", function(e) {
		gp.copyProject(e);
		e.stopPropagation();
		e.preventDefault();
	})

	// remove project
	$(document).on('click', "table .delete", function(e) {
		gp.removeProject(e);
		e.stopPropagation();
		e.preventDefault();
	})

	// add project owner
	$(document).on('change', "#add_owner", function(e) {
		var a = $(this).val();
		gp.addOwner($(this).data("id"), $(this).val(), function() {
			$("#owners").append("<li>" + a + "</li>");
			//gp.renderUsers(project._id, "#users");
		});
	})

	// removeproject owner
	$(document).on('click', ".remove_owner", function(e) {
		var x = $(this);
		gp.removeOwner($(this).data("id"), $(this).data("owner"), function() {
			x.parent().parent().remove();
		});
	})

	// open project settings
	$(document).on('click', ".settings", function(e) {
		var d = $(e.target);
		var project = gp.getProject(d.data("id"));
		var settings = gp.renderProjectSettings(project);
		popUp(settings, "Project Settings");
		gp.renderUsers(project._id, "#users");
	})

});


function login(gp) {
	var user = $("#username").val()
	var pass = $("#password").val()
	if(user == "" || pass == "")
		alert("Give username and password")
	else 
		gp.login(user, pass)
}

function addProject(gp) {
	if ($(".create_project #title").val().trim() == "")
		alert("Please give a title for the project!");
	else {
		var title = $(".create_project #title").val().trim();
		gp.addProject(title);
	}
}



function popUp(div, title) {
		$(div).dialog({
			title:title,
			modal:true,
			resizable: false,
			width:500,
			dialogClass: "no-close",
			buttons: {
				"Done": function() {
				  $( this ).empty();
				  $( this ).dialog( "close" );
				  location.reload();
				}
			}
		});	
}
