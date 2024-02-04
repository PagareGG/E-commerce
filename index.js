const expess = require('express');
const cors = require('cors')
require("./db/config");
const User = require('./db/User');
const Products = require('./db/Products');
const app = expess();
app.use(expess.json());
app.use(cors());
const Jwt = require('jsonwebtoken');
const jwtKey = "ecom";
const bodyParser = require('body-parser');
let jsonParser = bodyParser.json();
let crypto = require('crypto');
let key = "password";
let algo = 'aes256';

app.post("/register", async (req, res) => {
    let cipher = crypto.createCipher(algo, key);
    req.body.password = cipher.update(req.body.password, 'utf8', 'hex')
        + cipher.final('hex');
    let user = new User(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password;
    res.send(result);
})
app.post("/login", jsonParser, async (req, res) => {
    if (req.body.password && req.body.email) {

        User.findOne({ email: req.body.email }).then((user) => {
            let decipher = crypto.createDecipher(algo, key);
            let decrypted = decipher.update(user.password, 'hex', 'utf8')
                + decipher.final('utf8');
            if (user && decrypted == req.body.password) {
                Jwt.sign({ user }, jwtKey, { expiresIn: '30s' }, (err, token) => {
                    if (err) {
                        res.send("Something went wrong...")
                    }
                    res.send({ user, auth: token });
                })
            } else {
                res.status(500).json("Invalid Credintials")
            }
        })
    }
    else {
        res.send({ result: "No user found.." });
    }
})

app.post("/add-product", async (req, res) => {
    let resultArray = [];
    const request = req.body;
    request.forEach(async function (element) {
        const products = new Products(element);
        let result = await products.save();
        resultArray.push(result);
    });
    const count = request.length
    res.send({ Result: `${count} Products Added` });
})

app.get("/get-all-products", verifyToken, async (req, res) => {
    let product = await Products.find();
    if (product.length > 0) {
        res.send(product);
    } else {
        res.send({ result: "No Product Found..." });
    }
})
app.delete("/delete-product-by-id/:id", async (req, res) => {
    let result = await Products.deleteOne({ _id: req.params.id });
    res.send({ Response: "Deleted Product", result });
})
app.delete("/delete", async (req, res) => {
    let result = await User.deleteMany();
    res.send(result);
})
// app.delete("/delete", async (req, res) => {
//     let result = await Products.deleteMany();
//     res.send(result);
// })

app.get("/get-product-by-id/:id", async (req, res) => {
    let product = await Products.findOne({ _id: req.params.id });
    if (product) {
        res.send(product);
    } else {
        res.send({ result: "No Product Found..." });
    }
})
app.put("/update-product-by-id/:id", async (req, res) => {
    let product = await Products.updateOne({ _id: req.params.id }, {
        $set: req.body
    });
    res.send(product);
})

app.get("/search/:key", verifyToken, async (req, res) => {
    let product = await Products.find({
        "$or": [
            {
                title: { $regex: req.params.key }
            },
            {
                manufacturer: { $regex: req.params.key }
            },
            {
                description: { $regex: req.params.key }
            },
            {
                category: { $regex: req.params.key }
            }
        ]
    });
    res.send(product);
})

function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        req.token = bearer[1]
        if (!req.token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        Jwt.verify(req.token, jwtKey, (err, authData) => {
            if (err) {
                res.json({ result: err })
            }
            else {
                next();
            }
        })
    } else {
        res.send({ "result": "Token not provided" })
    }
}
app
app.listen(5000);