const {MongoClient} = require("mongodb")
const uri = "mongodb+srv://ehog:skibidisigmarizz69@boxsandcluster.uumcy.mongodb.net/?retryWrites=true&w=majority&appName=boxsandcluster";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri/*, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
}*/);
async function getAllData() {
	try {
	  await client.connect();
	  const db = client.db('boxsand');
	  const collection = db.collection('boxsandposts');
  
	  // Find the first document in the collection
	  const things = await collection.find({}).toArray();
	  console.log(things);
	} finally {
	  // Close the database connection when finished or an error occurs
	  await client.close();
	}
  }
  getAllData().catch(console.error);