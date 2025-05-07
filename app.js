const express = require('express')
const bcrypt = require('bcrypt')

//const serverless = require("serverless-http")
//const router = express.Router()
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const app = express()
const { MongoClient } = require('mongodb');
const { get } = require('mongodb/lib/utils')
const fs = require('fs').promises
const dotenv = require('dotenv')
dotenv.config()
const uri = process.env.PASSWORD;
let lastadded = 0
const client = new MongoClient(uri);
const addDataAt = 654
const cafter = 1762
async function initMongo(){
	try{
		await client.connect()
		console.log("Connected to MongoDB")
	} catch (e) {
		console.error(e)
	}
}
initMongo().catch(console.error)
async function putFileData(blob, id){
	const db = client.db('boxsand')
	const coll = db.collection('files')
	const file = await coll.findOne({id: id})
	if (file.data){
		const updated = await coll.updateOne({id: id}, {$set: {data: blob}})
	} else {
		const inserted = await coll.insertOne({
			id: id,
			data: blob
		})
	}
}
async function getFileData(id){
	const db = client.db('boxsand')
	const coll = db.collection('files')
	const file = await coll.findOne({id: id})
	if (file.data){
		return file.data
	} else {
		return null
	}
}
async function addData(data, cname, file, filename, res, token){
	const db = client.db('boxsand');
	const collection = db.collection('boxsandposts');
	const match = await collection.findOne({title: cname})
	if (match){
		res.send("Post with this name already exists. Please choose a different name.")
		return
	}
	if (token){
		getToken(async(user) => {
			const inserted = await collection.insertOne({
				title: cname,
				data: data,
				hasFile: file !== "NOFILE",
				file: file,
				filename: filename,
				user:user.username
			})
		}, token)
	} else {
		const inserted = await collection.insertOne({
			title: cname,
			data: data,
			hasFile: file !== "NOFILE",
			file: file,
			filename: filename,
			user: "somebody unidentified"
		})
	}
	res.render("public/posted.html")
}
async function reqFeat(data, title, token){
	getToken(async(user)=>{
		const db = client.db('boxsand');
		const collection = db.collection('requests');
		const inserted = await collection.insertOne({
			title: title,
			data: data,
			added: new Date().getTime(),
			updated: false,
			user: user.username
		})
	}, token)
}
async function getAllData(user) {
		const db = client.db('boxsand');
		const collection = db.collection('boxsandposts');
		const requestscoll = db.collection("requests")
	
		// Find the first document in the collection
		const things = await collection.find({}).toArray();
		const requests = await requestscoll.find({}).toArray()
		let data = ``
		let rdata = ``
		let pnum = 0
		things.forEach(thing => {
			data += `
				<div class="post" id="post#${pnum}">
					<h3>${thing.title}</h3>
						<p>By ${thing.user}</p><br>
					<p>${thing.data}</p>
					${
						thing.hasFile ? 
							`<br><a download="${thing.filename}.psave" href="data:text/base64,${thing.file}">Download ${thing.filename}</a>
							`:``
					}
				</div>
			`
			pnum++
		});
		let rn = 0
		requests.forEach(req =>{
			rdata += `
				<h2>${req.title}</h2>
				<p>${req.data}</p><br>
				${
					req.updated ? `<span style="color:green">Updated</span><br>`:rn===0?``:`<span style="color:red">Update pending</span><br>`
				}
			`
			if (!req.updated && req.added>lastadded){
				lastadded = req.added
			}
			rn++
		})
		app.get("/", (req, res)=>{
			res.render("main.html", {
				posts: data,
				reqs: rdata,
				username: user,
				token: ""
			});
			console.log("yey")
		})
}
async function getAllData2(res, token) {
	if (token){
		getToken(async(user)=>{
			const db = client.db('boxsand');
			const collection = db.collection('boxsandposts');
			const requestscoll = db.collection("requests")
		
			// Find the first document in the collection
			const things = await collection.find({}).toArray();
			const requests = await requestscoll.find({}).toArray()
			let data = ``
			let rdata = ``
			let pnum = 0
			things.forEach(thing => {
				data += `
					<div class="post" id="post#${pnum}">
						<h3>${thing.title}</h3>
							<p>By ${thing.user}</p><br>
						<p>${thing.data}</p>
						${
							thing.hasFile ? 
								`<br><a download="${thing.filename}.psave" href="data:text/base64,${thing.file}">Download ${thing.filename}</a>
								`:``
						}
					</div>
				`
				pnum++
			});
			let rn = 0
			requests.forEach(req =>{
				rdata += `
					<h2>${req.title}</h2>
					<p>${req.data}</p><br>
					${
						req.updated ? `<span style="color:green">Updated</span><br>`:rn===0?``:`<span style="color:red">Update pending</span><br>`
					}
				`
				if (!req.updated && req.added>lastadded){
					lastadded = req.added
				}
				rn++
			})
			
			res.render("main.html", {
				posts: data,
				reqs: rdata,
				//lastreq: lastadded,
				username: user.username,
				token: token
			})
		})
	} else {
		const db = client.db('boxsand');
		const collection = db.collection('boxsandposts');
		const requestscoll = db.collection("requests")
	
		// Find the first document in the collection
		const things = await collection.find({}).toArray();
		const requests = await requestscoll.find({}).toArray()
		let data = ``
		let rdata = ``
		things.forEach(thing => {
			data += `
				<div class="post">
					<h3>${thing.title}</h3>
					<p>${thing.data}</p>
					${
						thing.hasFile ? 
							`<br><a download="${thing.filename}.psave" href="data:text/base64,${thing.file}">Download ${thing.filename}</a>
							`:``
					}
				</div>
			`
		});
		let rn = 0
		requests.forEach(req =>{
			rdata += `
				<h2>${req.title}</h2>
				<p>${req.data}</p><br>
				${
					req.updated ? `<span style="color:green">Updated</span><br>`:rn===0?``:`<span style="color:red">Update pending</span><br>`
				}
			`
			if (!req.updated && req.added>lastadded){
				lastadded = req.added
			}
			rn++
		})
		
		res.render("main.html", {
			posts: data,
			reqs: rdata,
			//lastreq: lastadded,
			username: "nobody",
			token:""
		})
	
	}
}

async function closeMongo(){await client.close()}
function getToken(next,token){
	jwt.verify(token, process.env.SECRET, (err, user) => {
		if (err) throw err
		next(user,token)
	})
}
getAllData("nobody").catch(console.error);
let data = "hi"
let files = []
let reqdata = ``
app.use(express.static(__dirname+ '\\'))
app.use(bodyParser.urlencoded({extend:true}));
console.log(bodyParser.urlencoded({extend:true}))
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);
app.engine('html', require('ejs').renderFile);
app.post('/posted.html', (req, res) => {
    const data = req.body.data; // Assuming your form has an input with name="data"
	const name = req.body.name
	const filedta = req.body.fileh || "NOFILE"
	const filename = req.body.filename
	addData(data, name, filedta, filename, res, req.body.token)
});
//signup
app.post('/gyat2.html', (req, res) => {
	const db = client.db('boxsand');
	const coll = db.collection('accounts')
	coll.findOne({username: req.body.username}).then(async(err, user)=>{
		if (err) throw err
		if (user){
			res.send("Username already exists")
		} else {
			const salt = await bcrypt.genSalt(10)
			const hash = await bcrypt.hash(req.body.password, salt)
			const newuser = await coll.insertOne({
				username: req.body.username,
				password:hash,
				status: 0, // 0  for average person, 1 for long time user, 5 for dev
				banned: false
			})
			getAllData2(res, req.body.token).catch(console.error)
		}
	})
})
app.post('/delete', (req, res) => {
	console.log("deleting")
	const token = req.body.token
	getToken(async(user)=>{
		const db = client.db('boxsand')
		const accounts = db.collection('accounts')
		const account = await accounts.findOne({username: user.username})
		if (account){
			const coll = db.collection('boxsandposts')
			const posts = await coll.find({}).toArray()
			if (posts[parseInt(req.body.postn)].user===user.username || account.status===5){
				const deleted = await coll.deleteOne({title: posts[parseInt(req.body.postn)].title})
				res.render("public/delete.html", {
					title: "Deleted!.",
					message: `Your post has been deleted.`,
				})
			} else {
				res.render("public/delete.html", {
					title: "You do not have the right to delete this post.",
					message: `If you are not logged in, please log in to delete your post.
					If this is not your post, you cannot delete it.`,
				})
			}
		} else {
			res.render("public/delete.html", {
				title: "You are not logged in.",
				message: `Please log in to delete your post, if this is yours.`,
			})
		}
	},token)
})
app.post('/', async(req,res)=>{
	
	getAllData2(res,req.body.token).catch(console.error)
})
app.get('/request', (req, res)=>{
	res.sendFile(__dirname + '/public/newreq.html')
})
app.post('/req.html', (req, res) => {
	const title = req.body.title
	const text = req.body.text
	reqFeat(text, title, req.body.token)
	getAllData2(res, req.body.token).catch(console.error)
})
//login
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Pass to next layer of middleware
    next();
});
app.get('/post:id', async (req, res)=>{
	const db = client.db('boxsand')
	const coll = db.collection('boxsandposts')
	const posts = await coll.find({}).toArray()
	const post = posts[parseFloat(req.params.id.toString().substring(1))]
	res.json(post)
})
app.post("/gyat.html", async(req, res) => {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
	const db = client.db('boxsand');
	const coll = db.collection('accounts')
	const user = await coll.findOne({username: req.body.username})
	if (!user){
		getAllData2(res, req.body.token).catch(console.error)
	} else {
		if (user.banned){
			res.send("Did you know you are banned?<br>Reason: "+user.banned)
			return
		}
		const match = await bcrypt.compare(req.body.password, user.password)
		console.log(match)
		if (match){
			token = jwt.sign(
				{username: user.username, status: user.status}, process.env.SECRET, {
					expiresIn: '1800s',
				}
			)
			console.log("yes")
			if (req.body.name !== undefined){
				console.log("adding")
				const data = req.body.data; // Assuming your form has an input with name="data"
				const name = req.body.name
				const filedta = req.body.fileh || "NOFILE"
				const filename = req.body.filename
				addData(data, name, filedta, filename, res)
				return
			}
			getAllData2(res, req.body.token).catch(console.error)
		} else {
			getAllData2(res, req.body.token).catch(console.error)
		}
	}
})
app.post('/endsession.html', (req, res)=>{
	res.send("Session ended.")
})
app.post('/ban', (req, res)=>{
	getToken(async(usser)=>{
		console.log(usser)
		if (usser.status===5){
			const db = client.db('boxsand')
			const accounts = db.collection('accounts')
			accounts.findOne({username: req.body.username}).then(async(err, user)=>{

				if (err) throw err
				if (user){
					let userdoc = user
					//userdoc.banned = req.body.reason
					//const updated = accounts.updateOne({username: req.body.username}, {$set: userdoc}, {upsert: false})
					//res.send("User deleted.")
				} else {
					res.send("User not found.")
				}
			})
		} else {
			res.send("narr")
		}
	}, req.body.token)
})
app.get('/login', (req, res)=>{
	res.render("login.html")
})
app.get('/signup', (req, res)=>{
	res.render("signup.html")
})
app.get('/banuser', async (req, res)=>{
	const file = await fs.readFile("./banuser.html")
	res.send(file.toString())
})
app.get('/editpost:postn', (req, res)=>{
	res.sendFile(__dirname+"/editpost.html")
})
app.get('/getdata:postid', async (req, res)=>{
	const db = client.db('boxsand')
	const coll = db.collection('boxsandposts')
	const posts = await coll.find({}).toArray()
	const post = posts[parseInt(req.params.postid)]
	res.send(JSON.stringify(post))
})
const port = 3000//process.env.PORT||3000
app.get('/rules', async(req, res)=>{
	const rules = await fs.readFile("./rules.html")

	res.send(rules.toString())
})
app.post('/setblob:id', async(req, res)=>{
	const id = req.params.id
	await putFileData(req.body.data, id)
})
app.get('/getblob:id', async(req, res)=>{
	const id = req.params.id
	const blob = await getFileData(id)
	if (blob){
		res.send(blob)
	} else {
		res.send("NOFILE")
	}
})

app.listen(port, (err)=>{
	if (err) throw err
	console.log("Connected!")
})
/*
router.get("/", (req, res) => {
    getAllData2(res).catch(console.error)
});
app.use("/.netlify/functions/app", router);
module.exports.handler = serverless(app);*/