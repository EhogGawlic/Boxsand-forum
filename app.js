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
const dotenv = require('dotenv')
dotenv.config()
const uri = process.env.PASSWORD;
let lastadded = 0
let token
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
async function addData(data, cname, file, filename){
	if (token){
		getToken(async(user) => {
			const db = client.db('boxsand');
			const collection = db.collection('boxsandposts');
			const inserted = await collection.insertOne({
				title: cname,
				data: data,
				hasFile: file !== "NOFILE",
				file: file,
				filename: filename,
				user
			})
		})
	} else {
		const db = client.db('boxsand');
		const collection = db.collection('boxsandposts');
		const inserted = await collection.insertOne({
			title: cname,
			data: data,
			hasFile: file !== "NOFILE",
			file: file,
			filename: filename,
			user: "somebody unidentified"
		})
	}
}
async function reqFeat(data, title){
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
	})
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
				username: user
			});
			console.log("yey")
		})
}
async function getAllData2(res) {
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
				username: user
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
		
		res.redirect('/').render("main.html", {
			posts: data,
			reqs: rdata,
			//lastreq: lastadded,
			username: "nobody"
		})
	
	}
}

async function closeMongo(){await client.close()}
function getToken(next){
	jwt.verify(token, process.env.SECRET, (err, user) => {
		if (err) throw err
		next(user.username)
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
	addData(data, name, filedta, filename)
	res.render("public/posted.html")
});
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
				status: 0 // 0  for average person, 1 for long time user, 5 for dev
			})
			getAllData2(res).catch(console.error)
		}
	})
})
app.post('/delete', (req, res) => {
	console.log("deleting")
	getToken(async(user)=>{
		const db = client.db('boxsand')
		const accounts = db.collection('accounts')
		const account = await accounts.findOne({username: user})
		if (account){
			const coll = db.collection('boxsandposts')
			const posts = await coll.find({}).toArray()
			if (posts[parseInt(req.body.postn)].user===user || account.status===5){
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
	})
})
app.post('/', async(req,res)=>{
	
	getAllData2(res).catch(console.error)
})
app.post('/req.html', (req, res) => {
	const title = req.body.title
	const text = req.body.text
	reqFeat(text, title)
	getAllData2(res).catch(console.error)
})
app.post("/gyat.html", async(req, res) => {
	const db = client.db('boxsand');
	const coll = db.collection('accounts')
	console.log("yipee")
	const user = await coll.findOne({username: req.body.username})
	if (!user){
		console.log(193)
		getAllData2(res).catch(console.error)
	} else {
		console.log("User found: ", user.username)
		const match = await bcrypt.compare(req.body.password, user.password)
		console.log(match)
		if (match){
			token = jwt.sign(
				{username: user.username}, process.env.SECRET, {
					expiresIn: '1800s',
				}
			)
			getAllData2(res).catch(console.error)
		} else {
			console.log("gyatttttt")
			getAllData2(res).catch(console.error)
		}
	}
})
app.post('/endsession.html', (req, res)=>{
	res.send("Session ended.")
})

app.get('/login', (req, res)=>{
	res.render("login.html")
})
app.get('/signup', (req, res)=>{
	res.render("signup.html")
})
app.listen(process.env.PORT, (err)=>{
	if (err) throw err
	console.log("Connected!")
})
/*
router.get("/", (req, res) => {
    getAllData2(res).catch(console.error)
});
app.use("/.netlify/functions/app", router);
module.exports.handler = serverless(app);*/