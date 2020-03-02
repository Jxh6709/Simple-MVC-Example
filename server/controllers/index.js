// pull in our models. This will automatically load the index.js from that folder
const models = require('../models');
const Cat = models.Cat.CatModel;

// default fake data so that we have something to work with until we make a real Cat
const defaultData = {
  name: 'unknown',
  bedsOwned: 0,
};

let lastAdded = new Cat(defaultData);

const hostIndex = (req, res) => {
  res.render('index', {
    currentName: lastAdded.name,
    title: 'Home Page',
    pageName: 'Home Page',
  });
};

const readAllCats = (req, res, callback) => {
  Cat.find(callback).lean();
};

const readCat = (req, res) => {
 if (!req.query.name) {
   return res.status(400).json({error: 'A name is required'});
 } 
 const name1 = req.query.name;

 const callback = (err, doc) => {
  if (err) {
    return res.status(500).json({err});
  }
  return res.json(doc);
 };
 Cat.findByName(name1,callback);
};

const hostPage1 = (req, res) => {
  const callback = (err, docs) => {
    if (err) {
      return res.status(500).json({err});
    }

    return res.render('page1', {
      title: 'All Cats',
      cats: docs
    });
  };
  readAllCats(req,res,callback);
};

const hostPage2 = (req, res) => {
  res.render('page2', {title: 'Add Cat'});
};

const hostPage3 = (req, res) => {
  res.render('page3', {title: 'Add Dog'});
};

const getName = (req, res) => {
  res.json({name: lastAdded.name});
};

const setName = (req, res) => {
  if (!req.body.firstname || !req.body.lastname || !req.body.beds) {
    return res.status(400).json({ error: 'firstname,lastname and beds are all required' });
  }
  const name = `${req.body.firstname} ${req.body.lastname}`;
  const catData = {
    name,
    bedsOwned: req.body.beds
  };

  const newCat = new Cat(catData);

  const savePromise = newCat.save();

  savePromise.then(() => {
    lastAdded = newCat;
    return res.json({name: lastAdded.name, beds: lastAdded.bedsOwned});
  });

  savePromise.catch((err) => {
    return res.status(500).json({err});
  });
};

const searchName = (req, res) => {
  if (!req.query.name) {
    return res.status(400).json({ error: 'Name is required to perform a search' });
  }

  return Cat.findByName(req.query.name, (err,doc) => {
    if (err) {
      return res.status(500).json({err});
    }
    if (!doc) {
      return res.status(404).json({error: 'No Cats Found'});
    }
    return res.json({
      name: doc.name,
      beds: doc.bedsOwned,
    });
  });
};

const updateLast = (req, res) => {
  lastAdded.bedsOwned++;

  const savePromise = lastAdded.save();

  savePromise.then(() => {
    return res.json({name: lastAdded.name, beds: lastAdded.bedsOwned});
  });

  savePromise.catch((err) => {
    return res.status(500).json({err});
  });
  
};

const notFound = (req, res) => {
  res.status(404).render('notFound', {
    page: req.url,
  });
};

module.exports = {
  index: hostIndex,
  page1: hostPage1,
  page2: hostPage2,
  page3: hostPage3,
  readCat,
  getName,
  setName,
  updateLast,
  searchName,
  notFound,
};
