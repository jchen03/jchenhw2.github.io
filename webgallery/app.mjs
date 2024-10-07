import { createServer } from "http";
import express from "express";
import Datastore from "nedb";
import multer from "multer";



const PORT = 3000;

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("static"));

const upload = multer({ dest: 'uploads/' });

app.use(function (req, res, next) {
  console.log("HTTP request", req.method, req.url, req.body);
  next();
});

app.post("/", function (req, res, next) {
  res.json(req.body);
  next();
});

const comments = new Datastore({ filename: "db/comments.db", autoload: true });
const images = new Datastore({ filename: "db/images.db", autoload: true });
images.persistence.compactDatafile();
comments.persistence.compactDatafile();

const Image = (function () {
  let id = 0;
  return function item(req) {
    this._id = id++;
    this.title = req.body.title;
    this.author = req.body.author;
    this.filename = req.file.filename;
    this.originalname = req.file.originalname;
    this.mimetype = req.file.mimetype;
    this.size = req.file.size;
    this.path = req.file.path;
    this.createdAt = new Date();
  };
})();

const Comment = (function () {
  let id = 0;
  return function item(comment, imageId) {
    this._id = id++;
    this.imageId = imageId;
    this.content = comment.content;
    this.author = comment.author;
    this.createdAt = new Date();
  };
})();

app.post("/api/images", upload.single('picture'), function (req, res, next){
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  const image = new Image(req);
  images.insert(image, function (err, newImage) {
    if (err) {
      return next(err);
    }
    return res.json(newImage);
  });
});

app.get("/api/images", function (req, res, next){
  images.find({}, function(err, docs) {
    if (err) {
      return next(err);
    }
    return res.json(docs);
  });
});

app.delete("/api/images/:id", function (req, res, next){
  const id = parseInt(req.params.id);
  images.findOne({ _id: id }, function (err, image) {
    if(err){
      return next(err);
    }
    if(!image){
      return res.status(404).end("Image not found");
    }
    images.remove({ _id: id }, {}, function (err, imageRemoved){
      if(err){
        return next(err);
      }
      return res.json(image);
    });
  });
});

app.get('/api/images/:id/picture', function (req, res, next) {
  images.findOne({ _id: parseInt(req.params.id) }, function (err, profile) {
    if (err) {
      return next(err);
    }
    if (!profile) {
      return res.status(404).end("Image not found");
    }
    res.setHeader('Content-Type', profile.mimetype);
    res.sendFile(profile.path, { root: '.' });
  });  
});

app.post("/api/images/:imageId/comments", function (req, res, next){
  const imageId = parseInt(req.params.imageId);
  const comment = new Comment(req.body, imageId);
  comments.insert(comment, function (err, newComment) {
    if (err) {
      return next(err);
    }
    return res.json(newComment);
  });
});

app.get("/api/images/:imageId/comments", function (req, res, next){
  const imageId = parseInt(req.params.imageId);
  comments.find({ imageId:imageId }).sort({createdAt:-1}).limit(10).exec(function(err, data) { 
    if (err) {
      return next(err);
    }
    return res.json(data);
  });
});

app.delete("/api/images/:imageId/comments/:id", function (req, res, next){

  comments.remove({ _id: parseInt(req.params.id) }, function (err, comment){
    if(err){
      return next(err);
    }
    return res.json(comment);
  });
});

export const server = createServer(app).listen(PORT, function (err) {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost:%s", PORT);
});