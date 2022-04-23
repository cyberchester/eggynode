const express = require("express")
const basicAuth = require("express-basic-auth")
const { ObjectId } = require("mongodb")
const mongo = require("mongodb").MongoClient
const url = `mongodb+srv://cyberchester:ayenandar@cluster0.awkk3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`


//initialize variable
let db, series, episodes

//initialize Express
const app = express()
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))



//connect Mongodb
mongo.connect(
    url, 
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, (err, client) => {
        if(err){
            console.error(err)
            return
        }
        
        db = client.db("eggy")
        series = db.collection("series")
        episodes = db.collection("episodes")
    })



//Add Series Route
app.post("/addseries", basicAuth({
	users : {'test' : 'pass'},
	unauthorizedResponse : 'not authorized'
}), (req, res) => {

    const total_episodes = req.body.total_episodes
    const latest_episode = req.body.latest_episode
    const mydramalist_ratings = req.body.mydramalist_ratings
    const likes = req.body.likes
    const views = req.body.views
    const title = req.body.title
    const aired = req.body.aired
    const overview = req.body.overview
    const poster = req.body.poster
    const average_duration = req.body.average_duration
    const share = req.body.share
    const post_status = req.body.post_status
    const draft = req.body.draft

    series.insertOne({
        total_episodes: total_episodes,
        latest_episode: latest_episode,
        mydramalist_ratings: mydramalist_ratings,
        likes: likes,
        views: views,
        title: title,
        aired: aired,
        overview: overview,
        poster: poster,
        average_duration: average_duration,
        share: share,
        post_status: post_status,
        draft: draft,
        created_at: new Date(),
        updated_at: new Date()
    }, (err , result)=>{
        if(err){
            console.error(err)
            res.status(500).json({err: err})
            return
        }
        console.log(result)
        res.status(200).json({ok : true})
    })
    
});

//Add Episode Route
app.post("/addepisode", basicAuth({
	users : {'test' : 'pass'},
	unauthorizedResponse : 'not authorized'
}), (req, res) => {
    const series_server_id = req.body.series_server_id
    const episode_num = req.body.episode_num
    const thumbnail = req.body.thumbnail

    const stream_urls = req.body.stream_urls
    const download_urls = req.body.download_urls


    episodes.insertOne({
        series_server_id: series_server_id,
        episode_num: episode_num,
        thumbnail: thumbnail,
        stream_urls: stream_urls,
        download_urls: download_urls
  
    }, (err, result)=>{
        if(err){
            console.error(err)
            res.status(500).json({err: err})
            return
        }
        console.log(result)
        res.status(200).json({ok : true})
    })
})

//Get Trending Series Limit 10
app.get("/get_trending_series", (req, res)=> {
    series.find({created_at : {$gte: new Date((new Date() - 30 * 24 * 60 * 60 * 1000))}}).sort({views: -1}).limit(10).toArray((err, items)=>{
        if(err){
			console.error(err)
			res.status(500).json({err: err})
			return
		}
        res.status(200).json(items)
    })
    
})

//Get Ongoing Series
app.get("/get_ongoing_series", (req, res)=> {
    series.find({post_status: "ongoing"}).sort({updated_at: -1}).limit(10).toArray((err, items)=>{
        if(err){
			console.error(err)
			res.status(500).json({err: err})
			return
		}
        res.status(200).json(items)
    })
    
})


//Get Complete Series
app.get("/get_complete_series", (req, res)=> {
    series.find({post_status: "complete"}).sort({updated_at: -1}).limit(10).toArray((err, items)=>{
        if(err){
			console.error(err)
			res.status(500).json({err: err})
			return
		}
        res.status(200).json(items)
    })
    
})


//Get All Series
app.post("/get_series", (req, res)=>{

    const arg = req.body.arg
    const paging = req.body.paging || 0
    const offset = paging * 20
    const order = req.body.order || -1


    console.log(req.body)


    series.find({post_status: arg}).sort({updated_at: order}).skip(offset).limit(20).toArray((err, items)=>{
        if(err){
			console.error(err)
			res.status(500).json({err: err})
			return
		}



        res.status(200).json(items)
    })
})

//Search Series
app.post("/search_series", (req, res)=>{

    const search = req.body.search


    series.find({title: /search/}).toArray((err, items)=>{
        if(err){
            console.error(err)
            res.status(500).json({err: err})
            return
        }

        res.status(200).json(items)
    })
})



//update Likes

app.post("/update_like", (req, res)=> {
	const series_id = req.body.series_server_id
	series.find({_id: ObjectId(series_id)}).toArray((err, items)=>{
		if(err){
            console.error(err)
			res.status(500).json({err: err})
			return
        }

        var oldLikes = items[0].likes
        var newLikes = parseInt(oldLikes) + 1

        series.updateOne({_id: ObjectId(series_id)}, {$set: {"likes": newLikes}}, function(err, res){
        	if(err){
	            console.error(err)
				res.status(500).json({err: err})
				return
	        }
        })

        series.find({_id: ObjectId(series_id)}).toArray((err, items)=>{
        	if(err){
            console.error(err)
			res.status(500).json({err: err})
			return
        	}

        	res.status(200).json(items)
        })
		
	})
})

//Get Single Series
app.post("/get_single_series", (req, res)=> {
    const series_id = req.body.series_server_id


    series.find({_id: ObjectId(series_id)}).toArray((err, items)=>{
        if(err){
            console.error(err)
			res.status(500).json({err: err})
			return
        }

        var oldviews = items[0].views
        var newviews = parseInt(oldviews) + 1

        series.updateOne({_id: ObjectId(series_id)}, {$set: {"views": newviews}}, function(err, res){
        	if(err){
	            console.error(err)
				res.status(500).json({err: err})
				return
	        }
        })

        res.status(200).json(items)
    })
})


//Get Episodes of Series
app.post("/get_episodes", (req, res)=>{
    const series_id = req.body.series_server_id
    episodes.find({series_server_id: series_id}).toArray((err, items)=>{
        if(err){
            console.error(err)
			res.status(500).json({err: err})
			return
        }

        res.status(200).json(items)
    })
})





app.listen(process.env.PORT || 4000, () => console.log("server ready"))



// {
// "total_episodes":12,
// "latest_episode": 12,
// "mydramalist_ratings":9.1,
// "likes":1,
// "views":1,
// "title":"Hospital PlayList",
// "aired":"May 12 2020",
// "overview":"The stories of people going through their days that are seemingly ordinary but actually special, at the hospital, a place known as the microcosm of life, where someone is being born and someone's life meets their ending. The five doctors are long-time friends of 20 years who started their undergrad in 1999 in the same medical school and now are colleagues in the same hospital and have a band together.",
// "poster": "https://i.mydramalist.com/RXXL6_4f.jpg",
// "average_duration": 90,
// "share":"https://wwww.google.com",
// "post_status":"complete",
// "draft":false
// }


// {
//     "series_server_id":"62619cdababd5e3ebf89a13c",
//     "episode_num": 1,
//     "thumbnail": "https://i.mydramalist.com/Zx8kW_3f.jpg",
//     "premium" : false,
//     "stream_urls" : [
//         {
//             "url": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
//             "desc":"a"
//         },
//         {
//             "url": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
//             "desc":"b"
//         },
//         {
//             "url": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
//             "desc":"c"
//         }
        
       
//     ],
//     "download_urls" :[
//         {
//             "url": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
//             "desc":"a"
//         },{
//             "url": "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
//             "desc":"b"
//         }
//     ]
    
// }