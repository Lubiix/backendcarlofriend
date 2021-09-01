const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const uid2 = require("uid2");
const UserModel = require("../models/users");
const QuartierModel = require("../models/quartiers");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

//POST SIGNUP PARTICULIER
router.post("/signup-particulier", async function (req, res, next) {
  console.time("TIME SIGNUP PARTICULIER");
  console.log("req.body PARTICULIERS", req.body);
  console.log("centres d'interet", req.body.centresDinteret);
  console.log("quartiers fav", req.body.quartiersFavoris);
  console.time("TIME SIGNUP PARTICULIER USERMODEL BDD");
  const findIfUserExists = await UserModel.findOne({ email: req.body.email });
  console.timeEnd("TIME SIGNUP PARTICULIER USERMODEL BDD");
  console.log("findIfUserExists", findIfUserExists);
  if (findIfUserExists) {
    //ON VÉRIFIE QUE SI L'EMAIL EST DÉJÀ UTILISÉ, ON NE CRÉE PAS UN DEUXIÈME COMPTE DANS LA BASE DE DONNÉES
    res.json({
      errorMessage: "Cet email a déjà été utilisé pour créer un compte.",
    }); //ON NE TRAVAILLE QU'AVEC L'EMAIL CAR DEUX PERSONNES PEUVENT AVOIR LE MÊME NOM/PRÉNOM
    return;
  }
  const cost = 18;
  const hash = bcrypt.hashSync(req.body.password, cost);
  console.time("TIME SIGNUP PARTICULIER QUARTIERMODEL BDD");
  const quartierActivity = await QuartierModel.findOne({
    name: req.body.quartierActivity,
  });
  console.timeEnd("TIME SIGNUP PARTICULIER QUARTIERMODEL BDD");
  const quartierId = quartierActivity._id;
  console.time("TIME SIGNUP PARTICULIER USERMODEL SAVE BDD");
  const newUser = new UserModel({
    status: "Particulier",
    prenom: req.body.prenom,
    dateDeNaissance: req.body.dateDeNaissance,
    nom: req.body.nom,
    nameSearch: `${req.body.prenom} ${req.body.nom}`,
    civilite: req.body.civilite,
    email: req.body.email,
    centresDinteret: req.body.centresDinteret,
    quartiersFavoris: req.body.quartiersFavoris,
    quartierActivity: quartierId,
    token: uid2(32),
    password: hash,
  });
  console.time("TIME SIGNUP PARTICULIER USERMODEL SAVE BDD");
  const newUserSaved = await newUser.save();
  console.timeEnd("TIME SIGNUP PARTICULIER USERMODEL SAVE BDD");
  console.timeEnd("TIME SIGNUP PARTICULIER");
  res.json({ result: true, token: newUserSaved.token });
});

// POST SIGNUP COMMERCANT
router.post("/signup-commercant", async function (req, res, next) {
  console.time("TIME SIGNUP COMMERCANT");
  console.log("req.body COMMERCANTS", req.body);
  console.time("TIME SIGNUP COMMERCANT USERMODEL FINDONE");
  const findIfUserExists = await UserModel.findOne({ email: req.body.email });
  console.timeEnd("TIME SIGNUP COMMERCANT USERMODEL FINDONE");
  console.log("findIfUserExists", findIfUserExists);
  if (findIfUserExists) {
    //ON VÉRIFIE QUE SI L'EMAIL EST DÉJÀ UTILISÉ, ON NE CRÉE PAS UN DEUXIÈME COMPTE DANS LA BASE DE DONNÉES
    res.json({
      errorMessage: "Cet email a déjà été utilisé pour créer un compte.",
    }); //ON NE TRAVAILLE QU'AVEC L'EMAIL CAR DEUX PERSONNES PEUVENT AVOIR LE MÊME NOM/PRÉNOM
    return;
  }
  const cost = 18;
  const hash = bcrypt.hashSync(req.body.password, cost);
  console.time("TIME SIGNUP COMMERCANT QUARTIERMODEL FINDONE");
  const quartierActivity = await QuartierModel.findOne({
    name: req.body.quartierActivity,
  });
  console.timeEnd("TIME SIGNUP COMMERCANT QUARTIERMODEL FINDONE");
  const quartierId = quartierActivity._id;
  const newUser = new UserModel({
    status: "Commercant",
    nomEnseigne: req.body.nomEnseigne,
    numRCI: req.body.numRCI,
    adresse: req.body.adresse,
    email: req.body.email,
    domainesActivity: req.body.domainesActivity,
    quartierActivity: quartierId,
    token: uid2(32),
    password: hash,
  });
  console.time("TIME SIGNUP COMMERCANT USERMODEL SAVE");
  const newUserSaved = await newUser.save();
  console.timeEnd("TIME SIGNUP COMMERCANT USERMODEL SAVE");
  console.timeEnd("TIME SIGNUP COMMERCANT");
  res.json({ result: true, token: newUserSaved.token });
});

// POST LOGIN
router.post("/login", async function (req, res, next) {
  console.time("TIME LOGIN");
  console.log(">>req.body", req.body);
  const result = false;

  if (req.body.email == "" || req.body.password == "") {
    res.json({ result: false });
  }
  console.time("TIME LOGIN USERMODEL BDD");
  const user = await UserModel.findOne({
    email: req.body.email,
  });
  console.timeEnd("TIME LOGIN USERMODEL BDD");
  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      res.json({ result: true, token: user.token });
      return;
    }
  }
  console.timeEnd("TIME LOGIN");
  res.json({ result });
});

//POST SEARCH UTILISATEUR
router.post("/recherche-utilisateur", async function (req, res, next) {
  console.time("TIME RECHERCHE UTILISATEUR");
  console.log("POST SEARCH UTILISATEUR BODY: ", req.body);
  const regexSearch = new RegExp(req.body.search, "i");
  console.time("TIME RECHERCHE UTILISATEUR QUARTIER MODEL FINDONE");
  const quartierActivity = await QuartierModel.findOne({
    name: req.body.quartierSearch,
  });
  console.timeEnd("TIME RECHERCHE UTILISATEUR QUARTIER MODEL FINDONE");
  const quartierId = quartierActivity._id;
  console.time("TIME RECHERCHE UTILISATEUR USERMODEL FINDONE");
  const findUsers = await UserModel.find({
    nameSearch: regexSearch,
    quartierActivity: quartierId,
    status: req.body.typeUtilisateurSearch,
  });
  console.timeEnd("TIME RECHERCHE UTILISATEUR USERMODEL FINDONE");
  console.log("findUsers", findUsers);
  const userTableau = [];
  for (let i = 0; i < findUsers.length; i++) {
    const user = findUsers[i];
    userTableau.push({
      nom: user.nom,
      nomEnseigne: user.nomEnseigne,
      prenom: user.prenom,
      description: user.description,
      profilePicture: user.profilePicture,
      status: user.status,
    });
  }
  console.timeEnd("TIME RECHERCHE UTILISATEUR");
  res.json({ userTableau });
});

module.exports = router;
