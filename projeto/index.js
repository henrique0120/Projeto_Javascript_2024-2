import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";

const { Pool } = pg;
const app = express();
const port = 3000;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',  
  database: 'projeto',
  password: '123',
  port: 5432
});

const pgSession = connectPgSimple(session);

app.use(session({
  store: new pgSession({
      pool: pool, 
      tableName: 'sessions' 
  }),
  secret: 'projeto', 
  resave: false, 
  saveUninitialized: false, 
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } 
}));


const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "projeto",
    password: "123",
    port: 5432,
  });
db.connect();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());

app.get("/", async (req, res) => {

  //const dataAtual = new Date();
  //const diaAtual = dataAtual.getDate();
  //const mesAtual = dataAtual.getMonth() + 1; 
  //const anoAtual = dataAtual.getFullYear();
  //let data = anoAtual + "/" + mesAtual + "/" + diaAtual;
  //console.log(data);
  const checkResult = await db.query("SELECT * FROM products WHERE date = CURRENT_DATE + INTERVAL '15 days';");

  if (checkResult.rows.length === 1) {
    console.log(checkResult.rows[0].name);
  } else {
    for (let i = 0; i < checkResult.rows.length; i++) {
    console.log(checkResult.rows[i].name);
    }
  } 

    let sla = "We'll never share your email with anyone else.";
    res.render("login.ejs", {text: sla});
});

app.get("/login", (req, res) => {
    let sla = "We'll never share your email with anyone else.";
    res.render("login.ejs", {text: sla});
});

app.get("/register", (req, res) => {
  let filialText = "";
  res.render("register.ejs", {textFilial: filialText});
});

app.get("/cadProduct", (req, res) => {
  let alert = "";
  res.render("cadProduct.ejs", {alert: alert});
});

app.get("/constProduct", (req, res) => {
  res.render("constProduct.ejs");
});

app.post("/cadProduct", async (req, res) => {
  const prodLote = req.body.prodLote;
  const prodName = req.body.prodName;
  const prodDate = req.body.prodDate;
  //const prodFilial = req.body.prodFilial;
  const select = req.body.select;
  const filial = req.session.filial;

  console.log(filial)

  if (!prodLote || !prodName || !prodDate || !select) {
    return res.render("cadProduct.ejs", { alert: "Por favor, preencha todos os campos!" });
  }

  try {
    const checkResult = await db.query("SELECT * FROM products WHERE lote = $1", [
      prodLote,
    ]);

    

    if (checkResult.rows.length > 0) {
      let type = "Lote já existente, cadastre outro ou consulte!";
      res.render("cadProduct.ejs", {alert: type });
      //res.send("Email already exists. Try logging in.");
    //} //if (parseInt(prodFilial) != filial){
      //let type = "Tentativa de cadastro na filial errada";
      //res.render("cadProduct.ejs", {alert: type });
    } else {
      const result = await db.query(
        "INSERT INTO products (lote, product_filial, name, date, category) VALUES ($1, $2, $3, $4, $5)",
        [prodLote, filial, prodName, prodDate, select]
      );
      console.log(result);
      let check = "Seu produto foi cadastrado!";
      res.render("cadProduct.ejs", {alert: check});
    }

  } catch (err) {
    console.log(err);
  }
  
});
 
app.post("/register", async (req, res) => {
    const email = req.body.username;
    const password = req.body.password;
    const filial = req.body.filial;
    
    try {
      const checkEmail = await db.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);

      const checkFilial = await db.query("SELECT * FROM users WHERE filial = $1", [
        filial,
      ]);
      
      if (checkEmail.rows.length > 0) {
        let type = "Email already exists. Try logging in.";
        res.render("login.ejs", {text: type });
        //res.send("Email already exists. Try logging in.");
      } else if (checkFilial.rows.length > 0){
        let type = "Filial já cadastrada!";
        res.render("register.ejs", {textFilial: type});
      } else {
        const result = await db.query(
          "INSERT INTO users (filial, email, password) VALUES ($1, $2, $3)",
          [parseInt(filial), email, password]
        );
        console.log(result);
        let login = "Cadastro realizado com sucesso!"
        res.render("login.ejs", {text: login});
      }
    } catch (err) {
      console.log(err);
    }
    
});

  app.post("/login", async (req, res) => {
    const { username: email, password, filial } = req.body;
    req.session.filial = filial;
  
    if (!email || !password || !filial) {
      return res.render("login.ejs", { text: "Por favor, preencha todos os campos!" });
    }
  
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
  
      if (result.rows.length === 0) {
        return res.render("login.ejs", { text: "Usuário não encontrado!" });
      }
  
      const user = result.rows[0];
  
      if (password !== user.password) {
        return res.render("login.ejs", { text: "Senha incorreta!" });
      }
  
      if (parseInt(filial) !== user.filial) {
        return res.render("login.ejs", { text: "Filial não corresponde ao usuário informado!" });
      }
  
      res.render("index.ejs");
      
    } catch (err) {
      console.error(err);
      res.render("login.ejs", { text: "Ocorreu um erro, tente novamente mais tarde." });
    }
  });
  
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
