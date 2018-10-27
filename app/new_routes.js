const path			= require('path');
var collection 	= require('./new_collection.js');

module.exports = function(express, GP) {

	var multer 		= require("multer");
	var path 		= require('path');
	var p			= path.join(GP.dataPath, 'tmp');  
	var upload 		= multer({ dest: p });
	express.set('superSecret', global.config.secret); // secret variable


	express.all("*", function (req, res, next) {

		console.log(req.method + req.url);
		next();
	});

	// main page
	express.get(global.config.uiPath, function (req, res) {
		res.sendFile(path.join(__dirname, 'views', 'index.html'));
	});

	// project page
	express.get(global.config.uiPath + 'project/:id', function (req, res) {
		res.sendFile(path.join(__dirname, '../views', 'project.html'));
	});
	
	express.get('/api/v1/config', function (req, res) {
		res.json({
			url:global.config.url,
			authentication:global.config.authentication,
			version:global.config.version,
			uiPath:global.config.uiPath,
			public:global.config.public,
			nodedevmode:global.config.nodeDevMode
			//dataPath:global.config.dataPath
		});
	});


	express.get('/api/v1/status', function (req, res) {
		res.json({"status":"ok"});
	});


/* ***********************************************************************
 * 							PROJECTS
 * ***********************************************************************
*/

	express.get('/api/v1/projects', async function (req, res) {
		const projects = await GP.getProjects();
		res.json(projects);
	});

	express.get('/api/v1/projects/:id', async function (req, res) {
		const project = await GP.getProject(req.params.id);
		res.json(project);
	});

	express.post('/api/v1/projects', async function (req, res) {
		var project = await GP.createProject({'project_title': req.body.title, 'collection_title': 'My Collection'});
		res.json(project);
	});

	express.delete('/api/v1/projects/:id', async function (req, res) {
		const project = await GP.deleteProject(req.params.id);
		res.json(project);
	});

/* ***********************************************************************
 * 							NODES
 * ***********************************************************************
*/

	express.get('/api/v1/repository/nodes', async function (req, res) {
		const nodes = await GP.repository();
		res.json(nodes);
	});



/* ***********************************************************************
 * 							DATA
 * ***********************************************************************
*/

	express.get('/api/v1/collections/:collection/docs', async function (req, res) {
		var docs = await collection.getDocs(req.params.collection, req.query);
		res.json({"data": docs});
	});

	express.get('/api/v1/collections/:collection/fields', async function (req, res) {
		const schema = await GP.getSchema(req.params.collection);
		if(schema) res.json(schema); else res.json({}); 
	});

	express.get('/api/v1/collections/:collection/count', async function (req, res) {
		const count = await GP.getDocCount(req.params.collection);
		res.json({"count": count});
	});

	express.get('/api/v1/collections/:collection/facet', async function (req, res) {
		const facet = await collection.facet(req);
		res.json(facet);
	});

}
