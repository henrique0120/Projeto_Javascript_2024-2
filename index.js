import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import passport from "passport";
import { Strategy } from "passport-local";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import bcryptjs from "bcryptjs";
import flash from "connect-flash";

const { Pool } = pg;
const app = express();
const port = 3000;
const saltRounds = 10;

const pool = new Pool({
  connectionString: 'postgres://postgres:DYOUzXYpMsuiEiWoeqNYcwfKiomrGdmS@autorack.proxy.rlwy.net:45179/railway',
  ssl: {
    rejectUnauthorized: false, // Necessário para conexão segura em Railway
  },
});

export default pool;

//const pool = new Pool({
// user: 'postgres',
// host: 'postgresql://postgres:DYOUzXYpMsuiEiWoeqNYcwfKiomrGdmS@autorack.proxy.rlwy.net:45179/railway',
//database: 'railway',
// password: 'DYOUzXYpMsuiEiWoeqNYcwfKiomrGdmS',
//port: 5432
//});

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


//const db = new pg.Client({
// user: "postgres",
// host: "localhost",
//database: "projeto",
//password: "123",
// port: 5432,
//});
//db.connect();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

app.set('view engine', 'ejs');

app.get("/", async (req, res) => {
  let sla = "";
  res.render("login.ejs", { text: sla });
});

app.get('/login', (req, res) => {
  res.render('login.ejs');
});

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.get("/register", (req, res) => {
  let text = "";
  res.render("register.ejs", { text: text });
});

app.get("/principal", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("index.ejs");
  } else {
    res.redirect("/login");
  }
});

app.get("/cadProduct", (req, res) => {
  let alert = "";
  res.render("cadProduct.ejs", { alert: alert });
});

app.get("/constProduct", async (req, res) => {
  let text = '';
  try {
    const currentFilial = req.session.passport.user.filial;
    const result = await db.query('SELECT * FROM products where product_filial = $1', [currentFilial]);
    const dados = result.rows;
    res.render('constProduct.ejs', { dados, text },);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao consultar o banco de dados');
  }
});

app.get("/deleteProduct", async (req, res) => {
  let text = '';
  try {
    const currentFilial = req.session.passport.user.filial;
    const result = await db.query('SELECT * FROM products where product_filial = $1', [currentFilial]);
    const dados = result.rows;
    res.render('deleteProduct.ejs', { dados, text },);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao consultar o banco de dados');
  }
});

app.post("/deleteProduct", async (req, res) => {
  const categoria = req.body.categoria;
  const consulta = req.body.consulta;
  const lote = req.body.delLote;
  const currentFilial = req.session.passport.user.filial;

  const tabela = await db.query('SELECT * FROM products WHERE product_filial = $1', [currentFilial]);

  try {
    if (categoria === '' || consulta === '') {
      const dados = tabela.rows;
      let text = 'Selecione uma categoria ou um método de consulta!';
      res.render('deleteProduct.ejs', { dados, text });
    }

    if (categoria === "Alimentos" && consulta === "Desconto") {
      if (!lote) {
        let text = "";
        await db.query("DELETE FROM products WHERE date <= CURRENT_DATE + INTERVAL '3 months' AND category = $1 AND product_filial = $2", ["Alimentos", currentFilial]);
        const updatedData = await db.query('SELECT * FROM products WHERE product_filial = $1', [currentFilial]);
        const dados = updatedData.rows;
        res.render('deleteProduct.ejs', { dados, text });
      } else {
        let text = "";
        await db.query("DELETE FROM products WHERE date >= CURRENT_DATE + INTERVAL '3 months' AND category = $1 AND product_filial = $2 AND lote = $3", ["Alimentos", currentFilial, lote]);
        const updatedData = await db.query('SELECT * FROM products WHERE product_filial = $1', [currentFilial]);
        const dados = updatedData.rows;
        res.render('deleteProduct.ejs', { dados, text });
      }
    }
    else {
      switch (consulta) {
        case "Retirada":
          if (!lote) {
            let text = "";
            await db.query("DELETE FROM products WHERE date <= CURRENT_DATE + INTERVAL '1 months' AND date > CURRENT_DATE AND category = $1 AND product_filial = $2", [categoria, currentFilial]);
            const updatedData = await db.query('SELECT * FROM products WHERE product_filial = $1', [currentFilial]);
            const dados = updatedData.rows;
            res.render('deleteProduct.ejs', { dados, text });
          } else {
            let text = "";
            await db.query("DELETE FROM products WHERE date <= CURRENT_DATE + INTERVAL '1 months' AND date > CURRENT_DATE AND category = $1 AND product_filial = $2 AND lote = $3", [categoria, currentFilial, lote]);
            const updatedData = await db.query('SELECT * FROM products WHERE product_filial = $1', [currentFilial]);
            const dados = updatedData.rows;
            res.render('deleteProduct.ejs', { dados, text });
          }
          break;

        case "Desconto":
          if (!lote) {
            let text = "";
            await db.query("DELETE FROM products WHERE date <= CURRENT_DATE + INTERVAL '4 months' AND date > CURRENT_DATE + INTERVAL '1 months' AND category = $1 AND product_filial = $2", [categoria, currentFilial]);
            const updatedData = await db.query('SELECT * FROM products WHERE product_filial = $1', [currentFilial]);
            const dados = updatedData.rows;
            res.render('deleteProduct.ejs', { dados, text });
          }
          else {
            let text = "";
            await db.query("DELETE FROM products WHERE date <= CURRENT_DATE + INTERVAL '4 months' AND date > CURRENT_DATE + INTERVAL '1 months' AND category = $1 AND product_filial = $2 AND lote = $3", [categoria, currentFilial, lote]);
            const updatedData = await db.query('SELECT * FROM products WHERE product_filial = $1', [currentFilial]);
            const dados = updatedData.rows;
            res.render('deleteProduct.ejs', { dados, text });
          }
          break;

        case "Vencidos":
          if (!lote) {
            let text = "";
            await db.query("DELETE FROM products WHERE date < CURRENT_DATE AND category = $1 AND product_filial = $2", [categoria, currentFilial]);
            const updatedData = await db.query('SELECT * FROM products WHERE product_filial = $1', [currentFilial]);
            const dados = updatedData.rows;
            res.render('deleteProduct.ejs', { dados, text });
          }
          else {
            let text = "";
            await db.query("DELETE FROM products WHERE date < CURRENT_DATE AND category = $1 AND product_filial = $2 AND lote = $3", [categoria, currentFilial, lote]);
            const updatedData = await db.query('SELECT * FROM products WHERE product_filial = $1', [currentFilial]);
            const dados = updatedData.rows;
            res.render('deleteProduct.ejs', { dados, text });
          }
          break;

      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao consultar o banco de dados');
  }
});

app.post("/constProduct", async (req, res) => {
  const categoria = req.body.categoria;
  const consulta = req.body.consulta;
  const currentFilial = req.session.passport.user.filial;

  const tabela = await db.query('SELECT * FROM products WHERE product_filial = $1', [currentFilial]);
  const retirada = await db.query("SELECT * FROM products WHERE date <= CURRENT_DATE + INTERVAL '1 months' AND date > CURRENT_DATE AND category = $1 AND product_filial = $2", [categoria, currentFilial]);
  const desconto = await db.query("SELECT * FROM products WHERE date <= CURRENT_DATE + INTERVAL '4 months' AND date > CURRENT_DATE + INTERVAL '1 months' AND category = $1 AND product_filial = $2", [categoria, currentFilial]);
  const alimentos = await db.query("SELECT * FROM products WHERE date <= CURRENT_DATE + INTERVAL '3 months' AND category = $1 AND product_filial = $2", ["Alimentos", currentFilial]);
  const vencidos = await db.query("SELECT * FROM products WHERE date < CURRENT_DATE AND category = $1 AND product_filial = $2", [categoria, currentFilial]);

  try {
    if (categoria === '' || consulta === '') {
      const dados = tabela.rows;
      let text = 'Selecione uma categoria ou um método de consulta!';
      res.render('constProduct.ejs', { dados, text });
    }

    if (categoria === "Alimentos" && consulta === "Desconto") {
      let text = "";
      const dados = alimentos.rows;
      res.render('constProduct.ejs', { dados, text });
    }

    else {
      if (consulta === "Retirada") {
        let text = "";
        const dados = retirada.rows;
        res.render('constProduct.ejs', { dados, text });
      }

      if (consulta === "Desconto") {
        let text = "";
        const dados = desconto.rows;
        res.render('constProduct.ejs', { dados, text });
      }

      if (consulta === "Vencidos") {
        let text = "";
        const dados = vencidos.rows;
        res.render('constProduct.ejs', { dados, text });
      }
    }

  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao consultar o banco de dados');
  }
});


app.post("/cadProduct", async (req, res) => {
  const prodLote = req.body.prodLote;
  const prodName = req.body.prodName;
  const prodDate = req.body.prodDate;
  //const prodFilial = req.body.prodFilial;
  const select = req.body.select;
  const filial = req.session.passport.user.filial;

  if (!prodLote || !prodName || !prodDate || !select) {
    return res.render("cadProduct.ejs", { alert: "Por favor, preencha todos os campos!" });
  }

  try {
    const checkResult = await db.query("SELECT * FROM products WHERE lote = $1", [
      prodLote,
    ]);

    if (checkResult.rows.length > 0) {
      let type = "Lote já existente, cadastre outro ou consulte!";
      res.render("cadProduct.ejs", { alert: type });
      //res.send("Email already exists. Try logging in.");
      //} //if (parseInt(prodFilial) != filial){
      //let type = "Tentativa de cadastro na filial errada";
      //res.render("cadProduct.ejs", {alert: type });
    } else {
      const result = await db.query(
        "INSERT INTO products (lote, product_filial, name, date, category) VALUES ($1, $2, $3, $4, $5)",
        [prodLote, filial, prodName, prodDate, select]
      );
      let check = "Seu produto foi cadastrado!";
      res.render("cadProduct.ejs", { alert: check });
    }

  } catch (err) {
    console.log(err);
  }

});

app.post('/register', async (req, res) => {
  const { username: email, password, filial } = req.body;


  if (!email || !password || !filial) {
    req.flash('error_msg', 'Por favor, preencha todos os campos!');
    return res.redirect('/register');
  }

  try {

    const { rows: emailRows } = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (emailRows.length > 0) {
      req.flash('error_msg', 'Email já cadastrado, tente logar!');
      return res.redirect('/login');
    }


    const { rows: filialRows } = await db.query("SELECT * FROM users WHERE filial = $1", [filial]);
    if (filialRows.length > 0) {
      req.flash('error_msg', 'Filial já cadastrada!');
      return res.redirect('/register');
    }


    const hash = await bcryptjs.hash(password, saltRounds);
    await db.query(
      "INSERT INTO users (filial, email, password) VALUES ($1, $2, $3)",
      [parseInt(filial), email, hash]
    );


    req.flash('success_msg', 'Cadastro realizado com sucesso!');
    res.redirect('/login');

  } catch (err) {
    console.error("Erro durante o registro:", err);
    req.flash('error_msg', 'Ocorreu um erro, tente novamente mais tarde.');
    res.redirect('/register');
  }
});



app.post('/login', (req, res, next) => {

  const { username: email, password } = req.body;


  if (!email || !password) {
    req.flash('error_msg', 'Por favor, preencha todos os campos!');
    return res.redirect('/login');
  }

  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error("Erro durante autenticação:", err);
      req.flash('error_msg', 'Ocorreu um erro ao tentar autenticar.');
      return res.redirect('/login');
    }
    if (!user) {
      req.flash('error_msg', info.message || 'Falha na autenticação.');
      return res.redirect('/login');
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error("Erro ao fazer login:", err);
        req.flash('error_msg', 'Erro ao tentar fazer login.');
        return res.redirect('/login');
      }
      req.flash('success_msg', 'Login realizado com sucesso!');
      res.redirect('/principal'); // Redirecionar para a página desejada após o login
    });
  })(req, res, next);
});


passport.use(new Strategy(async function verify(username, password, cb) {
  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [username]);

    if (result.rows.length === 0) {
      return cb(null, false, { message: "Usuário não encontrado!" });
    }

    const user = result.rows[0];
    const storedHashedPassword = user.password;

    const validPassword = await bcryptjs.compare(password, storedHashedPassword);

    if (!validPassword) {
      return cb(null, false, { message: "Senha incorreta!" });
    }

    return cb(null, user);

  } catch (err) {
    console.error("Erro durante autenticação:", err);
    return cb(err);
  }
}));

passport.serializeUser((user, cb) => {
  cb(null, user);
});
passport.deserializeUser((user, cb) => {
  cb(null, user);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
