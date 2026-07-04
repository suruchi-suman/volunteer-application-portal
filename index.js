import express from "express";
import pg from "pg";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import session from "express-session"; 
import passport from "passport";   
import {Strategy} from "passport-local";
import env from "dotenv";
import cors from "cors";

const app = express();
app.set("view engine", "ejs"); 
const port = process.env.PORT || 5000;
const saltRounds = 10;
env.config();

// Fix __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PostgreSQL
// PostgreSQL
const db = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.use(cors({
  origin: "https://reallyrealeducation.org", //  GitHub Pages URL
  credentials: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,

  cookie: {
    maxAge: 1000 * 60 * 60,
    secure: true,
    sameSite: "none",
  }
}));

app.use(passport.initialize());


app.use(passport.session());





const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF allowed"), false);
        }
    }
});

// Routes when integrating into RRE's website
/*app.get("/apply", (req, res) => {
    res.render("volunteer.ejs");
});*/ 

app.get("/", (req, res) => {
    res.render("volunteer.ejs");
});

app.get("/admin/login", (req,res) => {
    res.render("login.ejs");
});

app.get("/admin/applicants", async (req, res) => {
  // Log the current user stored in the request by Passport (useful for debugging)
  console.log(req.user);

  if (req.isAuthenticated()) {
    try {
      const result = await db.query(
        "SELECT id, first_name, last_name, email, mobile, volunteer_type, contribution, github, linkedin, (resume IS NOT NULL) AS resume FROM users ORDER BY id DESC"
      );
      res.render("dashboard.ejs", { applicants: result.rows });
    } catch (err) {
      console.error(err);
      res.status(500).send("Error loading applicants");
    }
  } else {
    res.redirect("/admin/login");
  }
});

app.get("/resume/:id", async (req, res) => {

    if(req.isAuthenticated()){
          try {

                const result = await db.query("SELECT resume FROM users WHERE id = $1",[req.params.id]);

                if (result.rows.length === 0 || !result.rows[0].resume) {
                    return res.status(404).send("Resume not found");
                }

                const resumeBuffer = result.rows[0].resume;

                res.setHeader("Content-Type", "application/pdf");
                res.setHeader("Content-Disposition", "inline; filename=resume.pdf");

                res.send(resumeBuffer);

          } catch (err) {
                console.error(err);
                res.status(500).send("Error retrieving resume");
          }
    } else {
        res.redirect("/admin/login");
    }
    
});

app.post("/admin/login", passport.authenticate("local", {
  successRedirect: "/admin/applicants",  
  failureRedirect: "/admin/login"     
}));


app.post("/submit", upload.single("resume"), async (req, res) => {
    try {
        const {
            fName,
            lName,
            email,
            telephone,
            volunteerType,
            contribution,
            github,
            linkedin,
            portfolio
        } = req.body;

        // File path
        const resumeBuffer = req.file ? req.file.buffer : null;

        // Validation
        if (!fName || !email || !telephone || !volunteerType || !contribution) {
            return res.status(400).send("Missing required fields");
        }

        if (volunteerType === "technical" && (!github || !linkedin || !req.file)) {
            return res.status(400).send("Technical role requires all fields");
        }

        await db.query(
            `INSERT INTO users 
            (first_name, last_name, email, mobile, volunteer_type, contribution, resume, github, linkedin, portfolio) 
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
            [
                fName,
                lName,
                email,
                telephone,
                volunteerType,
                contribution,
                resumeBuffer,
                github || null,
                linkedin || null,
                portfolio || null
            ]
        );
        console.log(req.body); // ← add this temporarily
        console.log(req.file);

        res.render("submit.ejs");

    } catch (err) {
        console.error(err);
        res.status(500).send("❌ Error submitting application");
    }
});


passport.use(new Strategy(async function verify(username, password, cb) {

  try {
    const admin_email = process.env.ADMIN_EMAIL
    const admin_password = process.env.ADMIN_PASSWORD_HASH

    if (username !== admin_email) {
      return cb(null, false); // fail early if email doesn't match
    }
    const match = await bcrypt.compare(password, admin_password);

    if (match) {
      const user = { username: admin_email, password: admin_password }; // construct user object
      return cb(null, user);
    } else {
      return cb(null, false);
    }

  } catch (err) {
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
    console.log(`Server running on port ${port}`);
});