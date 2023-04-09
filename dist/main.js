import $17arc$mongoose from "mongoose";
import {config as $17arc$config} from "dotenv";
import $17arc$express from "express";
import $17arc$morgan from "morgan";
import $17arc$expressratelimit from "express-rate-limit";
import $17arc$helmet from "helmet";
import $17arc$hpp from "hpp";
import $17arc$expressmongosanitize from "express-mongo-sanitize";
import {fileURLToPath as $17arc$fileURLToPath} from "url";
import $17arc$path from "path";
import $17arc$cookieparser from "cookie-parser";
import $17arc$compression from "compression";
import $17arc$jsonwebtoken from "jsonwebtoken";
import {promisify as $17arc$promisify} from "util";
import $17arc$crypto from "crypto";
import $17arc$validator from "validator";
import $17arc$bcryptjs from "bcryptjs";
import $17arc$nodemailer from "nodemailer";
import $17arc$pug from "pug";
import {htmlToText as $17arc$htmlToText} from "html-to-text";
import $17arc$multer from "multer";
import $17arc$sharp from "sharp";
import $17arc$slugify from "slugify";
import $17arc$stripe from "stripe";

/* eslint-disable import/first */ 

$17arc$config({
    path: "./config.env"
});


/* eslint-disable import/no-extraneous-dependencies */ 


















const $8b44e0ee1b8898f4$var$userSchema = new (0, $17arc$mongoose).Schema({
    name: {
        type: String,
        required: [
            true,
            "Please tell us your name!"
        ]
    },
    email: {
        type: String,
        required: [
            true,
            "Please provide your email."
        ],
        unique: true,
        lowercase: true,
        validate: [
            (0, $17arc$validator).isEmail,
            "Please provide a valid email."
        ]
    },
    photo: {
        type: String,
        default: "default.jpg"
    },
    role: {
        type: String,
        enum: [
            "user",
            "guide",
            "lead-guide",
            "admin"
        ],
        default: "user"
    },
    password: {
        type: String,
        required: [
            true,
            "Please provide a password"
        ],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [
            true,
            "Please confirm your password"
        ],
        validate: {
            validator: function(el) {
                return el === this.password;
            },
            message: "Passwords are not the same!"
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});
/* This is a middleware that runs before the save() or create() method. It hashes the password and
deletes the passwordConfirm field. */ $8b44e0ee1b8898f4$var$userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    this.password = await (0, $17arc$bcryptjs).hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});
/* This is a middleware that runs before the save() or create() method. If the user has changed the password it sets the passwordChangedAt property to the current time.
If the password hasnt changed or its a newly created user, it will continue to the next middleware.*/ $8b44e0ee1b8898f4$var$userSchema.pre("save", async function(next) {
    if (!this.isModified("password") || this.isNew) return next();
    this.passwordChangedAt = Date.now() - 1000; // Ensure that the token will always be created after password change
    next();
});
$8b44e0ee1b8898f4$var$userSchema.pre(/^find/, function(next) {
    this.find({
        active: {
            $ne: false
        }
    });
    next();
});
/* This is a method that compares the candidate password with the user password. */ $8b44e0ee1b8898f4$var$userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await (0, $17arc$bcryptjs).compare(candidatePassword, userPassword);
};
/* This is a method that checks if the password was changed after the token was created. */ $8b44e0ee1b8898f4$var$userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp; // if password was changed after the token was created return false
    }
    return false;
};
/* Creating a password reset token and setting the password reset token and password reset expires. */ $8b44e0ee1b8898f4$var$userSchema.methods.createPasswordResetToken = function() {
    const resetToken = (0, $17arc$crypto).randomBytes(32).toString("hex");
    this.passwordResetToken = (0, $17arc$crypto).createHash("sha256").update(resetToken).digest("hex");
    this.passwordResetExpires = Date.now() + 600000;
    return resetToken;
};
const $8b44e0ee1b8898f4$var$User = (0, $17arc$mongoose).model("User", $8b44e0ee1b8898f4$var$userSchema);
var $8b44e0ee1b8898f4$export$2e2bcd8739ae039 = $8b44e0ee1b8898f4$var$User;


/* It's a class that extends the Error class and has a constructor that takes in a message and a status
code. */ class $df0ca311bc71284f$export$a996741116394418 extends Error {
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}


var $5b9d14016737472f$export$2e2bcd8739ae039 = (func)=>(req, res, next)=>{
        func(req, res, next).catch(next);
    };







const $45c2f3e687f920e9$var$__filename = (0, $17arc$fileURLToPath)("file:///utils/email.js");
const $45c2f3e687f920e9$var$__dirname = (0, $17arc$path).dirname($45c2f3e687f920e9$var$__filename);
class $45c2f3e687f920e9$export$2e2bcd8739ae039 {
    constructor(user, url){
        this.to = user.email;
        this.firstName = user.name.split(" ")[0];
        this.url = url;
        this.from = `Roy Abramovich <${process.env.EMAIL_FROM}>`;
    }
    newTransport() {
        if (process.env.NODE_ENV === "production") return (0, $17arc$nodemailer).createTransport({
            host: "smtp.sendgrid.net",
            port: 587,
            auth: {
                user: process.env.SENDGRID_USERNAME,
                pass: process.env.SENDGRID_PASSWORD
            }
        });
        return (0, $17arc$nodemailer).createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }
    async send(template, subject) {
        const html = (0, $17arc$pug).renderFile(`${$45c2f3e687f920e9$var$__dirname}/../views/email/${template}.pug`, {
            firstName: this.firstName,
            url: this.url,
            subject: subject
        });
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject: subject,
            html: html,
            text: (0, $17arc$htmlToText)(html)
        };
        await this.newTransport().sendMail(mailOptions);
    }
    async sendWelcome() {
        await this.send("welcome", "Welcome to the Natours family!");
    }
    async sendPasswordReset() {
        await this.send("passwordReset", "Password reset - valid for 10 minutes");
    }
}


const $6e76cd689757a637$var$signToken = (id)=>(0, $17arc$jsonwebtoken).sign({
        id: id
    }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
const $6e76cd689757a637$var$createSendToken = (user, statusCode, res)=>{
    const token = $6e76cd689757a637$var$signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 86400000),
        httpOnly: true
    };
    if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
    res.cookie("jwt", token, cookieOptions);
    res.status(statusCode).json({
        status: "success",
        token: token,
        data: {
            user: user
        }
    });
};
const $6e76cd689757a637$export$7200a869094fec36 = (0, $5b9d14016737472f$export$2e2bcd8739ae039)(async (req, res, next)=>{
    const newUser = await (0, $8b44e0ee1b8898f4$export$2e2bcd8739ae039).create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm
    });
    newUser.password = undefined;
    // `${req.protocol}://${req.get('host')}/me`;
    const url = "http://localhost:3000/me";
    await new (0, $45c2f3e687f920e9$export$2e2bcd8739ae039)(newUser, url).sendWelcome();
    $6e76cd689757a637$var$createSendToken(newUser, 201, res);
});
const $6e76cd689757a637$export$596d806903d1f59e = (0, $5b9d14016737472f$export$2e2bcd8739ae039)(async (req, res, next)=>{
    const { email: email , password: password  } = req.body;
    if (!email || !password) return next(new (0, $df0ca311bc71284f$export$a996741116394418)("Please provide email and password!", 400));
    const user = await (0, $8b44e0ee1b8898f4$export$2e2bcd8739ae039).findOne({
        email: email
    }).select("+password");
    if (!user || !await user.correctPassword(password, user.password)) return next(new (0, $df0ca311bc71284f$export$a996741116394418)("Incorrect email or password", 401));
    $6e76cd689757a637$var$createSendToken(user, 200, res);
});
const $6e76cd689757a637$export$a0973bcfe11b05c9 = (req, res)=>{
    res.cookie("jwt", "null", {
        expires: new Date(Date.now() + 10000),
        httpOnly: true
    });
    res.status(200).json({
        status: "success"
    });
};
const $6e76cd689757a637$export$eda7ca9e36571553 = (0, $5b9d14016737472f$export$2e2bcd8739ae039)(async (req, res, next)=>{
    let token;
    /* This is checking if the user is logged in. If the user is not logged in, it will throw an error. */ if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) token = req.headers.authorization.split(" ")[1];
    else if (req.cookies.jwt) token = req.cookies.jwt;
    if (!token) return next(new (0, $df0ca311bc71284f$export$a996741116394418)("You are not logged in! Please log in to get access.", 401));
    /* Verifying the token. */ const decodedToken = await (0, $17arc$promisify)((0, $17arc$jsonwebtoken).verify)(token, process.env.JWT_SECRET);
    /* This is checking if the user still exists. If the user does not exist, it will throw an error. */ const currentUser = await (0, $8b44e0ee1b8898f4$export$2e2bcd8739ae039).findById(decodedToken.id);
    if (!currentUser) return next(new (0, $df0ca311bc71284f$export$a996741116394418)("The user belonging to this token does no longer exist.", 401));
    /* This is checking if the user has changed their password after the token was issued. If the user
  has changed their password after the token was issued, it will throw an error. */ if (currentUser.changedPasswordAfter(decodedToken.iat)) return next(new (0, $df0ca311bc71284f$export$a996741116394418)("Password has been changed recently. Please log in again.", 401));
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
});
const $6e76cd689757a637$export$e1bac762c84d3b0c = (...roles)=>(req, res, next)=>{
        if (!roles.includes(req.user.role)) return next(new (0, $df0ca311bc71284f$export$a996741116394418)("You do not have permission to preform this action.", 403));
        next();
    };
const $6e76cd689757a637$export$66791fb2cfeec3e = (0, $5b9d14016737472f$export$2e2bcd8739ae039)(async (req, res, next)=>{
    /* This is checking if the user exists. If the user does not exist, it will throw an error. */ const user = await (0, $8b44e0ee1b8898f4$export$2e2bcd8739ae039).findOne({
        email: req.body.email
    });
    if (!user) return next(new (0, $df0ca311bc71284f$export$a996741116394418)("There in no user with that email address.", 404));
    /* This is creating a reset token and saving it to the database. It is also creating a reset URL and
  a message. */ const resetToken = user.createPasswordResetToken();
    await user.save({
        validateBeforeSave: false
    });
    /* Sending an email to the user. If the email is not sent, it will set the passwordResetToken and
  passwordResetExpires to undefined and save it to the database. It will then throw an error. */ try {
        const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/reset-password/${resetToken}`;
        await new (0, $45c2f3e687f920e9$export$2e2bcd8739ae039)(user, resetURL).sendPasswordReset();
        res.status(200).json({
            status: "success",
            message: "Token sent to email"
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({
            validateBeforeSave: false
        });
        return next(new (0, $df0ca311bc71284f$export$a996741116394418)("There was an error sending the email. Please try again!", 500));
    }
});
const $6e76cd689757a637$export$dc726c8e334dd814 = (0, $5b9d14016737472f$export$2e2bcd8739ae039)(async (req, res, next)=>{
    const hashedToken = (0, $17arc$crypto).createHash("sha256").update(req.params.token).digest("hex");
    const user = await (0, $8b44e0ee1b8898f4$export$2e2bcd8739ae039).findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {
            $gt: Date.now()
        }
    });
    if (!user) return next(new (0, $df0ca311bc71284f$export$a996741116394418)("Token is invalid or has expired", 400));
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    $6e76cd689757a637$var$createSendToken(user, 200, res);
});
const $6e76cd689757a637$export$e2853351e15b7895 = (0, $5b9d14016737472f$export$2e2bcd8739ae039)(async (req, res, next)=>{
    const user = await (0, $8b44e0ee1b8898f4$export$2e2bcd8739ae039).findById(req.user.id).select("+password");
    if (!await user.correctPassword(req.body.passwordCurrent, user.password)) return next(new (0, $df0ca311bc71284f$export$a996741116394418)("Your current password is wrong.", 401));
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    $6e76cd689757a637$var$createSendToken(user, 200, res);
});
const $6e76cd689757a637$export$256a5a3564694cfc = async (req, res, next)=>{
    if (req.cookies.jwt) try {
        /* Verifying the token. */ const decodedToken = await (0, $17arc$promisify)((0, $17arc$jsonwebtoken).verify)(req.cookies.jwt, process.env.JWT_SECRET);
        /* Checking if the user still exists. If the user does not exist, it will throw an error. */ const currentUser = await (0, $8b44e0ee1b8898f4$export$2e2bcd8739ae039).findById(decodedToken.id);
        if (!currentUser) return next();
        /* Checking if the user has changed their password after the token was issued. If the user
  has changed their password after the token was issued, it will throw an error. */ if (currentUser.changedPasswordAfter(decodedToken.iat)) return next();
        res.locals.user = currentUser;
        return next();
    } catch (error) {
        return next();
    }
    next();
};






const $2fc4c82ee5859497$var$tourSchema = new (0, $17arc$mongoose).Schema({
    name: {
        type: String,
        required: [
            true,
            "A tour must have a name"
        ],
        unique: true,
        trim: true,
        maxlength: [
            40,
            "Tour name mast have less than 40 characters"
        ],
        minlength: [
            10,
            "Tour name mast have more than 10 characters"
        ]
    },
    slug: String,
    duration: {
        type: Number,
        required: [
            true,
            "A tour must have a duration"
        ]
    },
    maxGroupSize: {
        type: Number,
        required: [
            true,
            "A tour must have a group size"
        ]
    },
    difficulty: {
        type: String,
        required: [
            true,
            "A tour must have a difficulty"
        ],
        enum: {
            values: [
                "easy",
                "medium",
                "difficult"
            ],
            message: "Difficulty is either: easy, medium, difficult"
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        set: (val)=>Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [
            true,
            "A tour must have a price "
        ]
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(val) {
                return val < this.price;
            },
            message: "Discount price ({VALUE}) should be below regular price"
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [
            true,
            "A tour must have a summary "
        ]
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [
            true,
            "A tour must have a cover image "
        ]
    },
    images: [
        String
    ],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [
        Date
    ],
    vipTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        type: {
            type: String,
            default: "Point",
            enum: [
                "Point"
            ]
        },
        coordinates: [
            Number
        ],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: "Point",
                enum: [
                    "Point"
                ]
            },
            coordinates: [
                Number
            ],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: (0, $17arc$mongoose).Schema.ObjectId,
            ref: "User"
        }
    ]
}, {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});
$2fc4c82ee5859497$var$tourSchema.index({
    price: 1,
    ratingsAverage: -1
});
$2fc4c82ee5859497$var$tourSchema.index({
    slug: 1
});
$2fc4c82ee5859497$var$tourSchema.index({
    startLocation: "2dsphere"
});
$2fc4c82ee5859497$var$tourSchema.virtual("durationWeeks").get(function() {
    return this.duration / 7;
});
$2fc4c82ee5859497$var$tourSchema.virtual("reviews", {
    ref: "Review",
    foreignField: "tour",
    localField: "_id"
});
// DOC MIDDLEWARE
$2fc4c82ee5859497$var$tourSchema.pre("save", function(next) {
    this.slug = (0, $17arc$slugify)(this.name, {
        lower: true
    });
    next();
});
// QUERY MIDDLEWARE
$2fc4c82ee5859497$var$tourSchema.pre(/^find/, function(next) {
    this.find({
        vipTour: {
            $ne: true
        }
    });
    next();
});
// // AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { vipTour: { $ne: true } } });
//   next();
// });
const $2fc4c82ee5859497$var$Tour = (0, $17arc$mongoose).model("Tour", $2fc4c82ee5859497$var$tourSchema);
var $2fc4c82ee5859497$export$2e2bcd8739ae039 = $2fc4c82ee5859497$var$Tour;




class $c3628672c6ac4530$export$3a22b8314f1937c0 {
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }
    filter() {
        /* Deleting the page, sort, limit, and fields from the query string. */ const queryObj = {
            ...this.queryString
        };
        const excludedFields = [
            "page",
            "sort",
            "limit",
            "fields"
        ];
        excludedFields.forEach((el)=>delete queryObj[el]);
        /* This is a way to convert the query string into a mongoose query. */ let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match)=>`$${match}`);
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }
    /**
   * If the queryString has a sort property, then sort the query by the sort property, otherwise sort
   * the query by name.
   */ sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(",").join(" ");
            this.query = this.query.sort(sortBy);
        } else this.query = this.query.sort("createdAt");
        return this;
    }
    limitFields() {
        /* This is a way to select the fields that you want to be returned in the response. */ if (this.queryString.fields) {
            const fields = this.queryString.fields.split(",").join(" ");
            this.query = this.query.select(fields);
        } else this.query = this.query.select("-__v");
        return this;
    }
    /* This is a way to paginate the results. */ paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);
        return this;
    }
}




const $7baf6aa1cf2e45c1$export$36a479340da3c347 = (Model)=>(0, $5b9d14016737472f$export$2e2bcd8739ae039)(async (req, res, next)=>{
        const doc = await Model.findByIdAndDelete(req.params.id);
        if (!doc) return next(new (0, $df0ca311bc71284f$export$a996741116394418)("No document found with that ID", 404));
        res.status(204).json({
            status: "success",
            data: null
        });
    });
const $7baf6aa1cf2e45c1$export$3220ead45e537228 = (Model)=>(0, $5b9d14016737472f$export$2e2bcd8739ae039)(async (req, res, next)=>{
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
            returnDocument: "after"
        });
        if (!doc) return next(new (0, $df0ca311bc71284f$export$a996741116394418)("No document found with that ID", 404));
        res.status(200).json({
            status: "success",
            data: {
                doc: doc
            }
        });
    });
const $7baf6aa1cf2e45c1$export$5d49599920443c31 = (Model)=>(0, $5b9d14016737472f$export$2e2bcd8739ae039)(async (req, res, next)=>{
        const newDoc = await Model.create(req.body);
        res.status(201).json({
            status: "success",
            data: {
                newDoc: newDoc
            }
        });
    });
const $7baf6aa1cf2e45c1$export$2eb5ba9a66e42816 = (Model, popOptions)=>(0, $5b9d14016737472f$export$2e2bcd8739ae039)(async (req, res, next)=>{
        let query = Model.findById(req.params.id);
        if (popOptions) popOptions.forEach((element)=>{
            query = query.populate(element);
        });
        const doc = await query;
        if (!doc) return next(new (0, $df0ca311bc71284f$export$a996741116394418)("No document found with that ID", 404));
        res.status(200).json({
            status: "success",
            data: {
                doc: doc
            }
        });
    });
const $7baf6aa1cf2e45c1$export$2774c37398bee8b2 = (Model, popOptions)=>(0, $5b9d14016737472f$export$2e2bcd8739ae039)(async (req, res, next)=>{
        /* Checking if the request has a tourId in the params, and if it does, it sets the filter to be the
    tourId.  JUST FOR GETTING REVIEWS*/ let filter = {};
        if (req.params.tourId) filter = {
            tour: req.params.tourId
        };
        const features = new (0, $c3628672c6ac4530$export$3a22b8314f1937c0)(Model.find(filter), req.query).filter().sort().limitFields().paginate();
        if (popOptions) popOptions.forEach((element)=>{
            features.query = features.query.populate(element);
        });
        const doc = await features.query;
        res.status(200).json({
            status: "success",
            results: doc.length,
            data: {
                doc: doc
            }
        });
    });


const $db2c20450e00b0f4$var$multerStorage = (0, $17arc$multer).memoryStorage();
const $db2c20450e00b0f4$var$multerFilter = (req, file, cb)=>{
    if (file.mimetype.startsWith("image")) cb(null, true);
    else cb(new (0, $df0ca311bc71284f$export$a996741116394418)("Please upload only images ", 400), false);
};
const $db2c20450e00b0f4$var$upload = (0, $17arc$multer)({
    storage: $db2c20450e00b0f4$var$multerStorage,
    fileFilter: $db2c20450e00b0f4$var$multerFilter
});
const $db2c20450e00b0f4$export$b4cc9a7f549f80be = $db2c20450e00b0f4$var$upload.fields([
    {
        name: "imageCover",
        maxCount: 1
    },
    {
        name: "images",
        maxCount: 3
    }
]);
const $db2c20450e00b0f4$export$3f01106131746282 = (0, $5b9d14016737472f$export$2e2bcd8739ae039)(async (req, res, next)=>{
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await (0, $17arc$sharp)(req.files.imageCover[0].buffer).resize(2000, 1333).toFormat("jpeg").jpeg({
        quality: 90
    }).toFile(`public/img/tours/${req.body.imageCover}`);
    req.body.images = [];
    await Promise.all(req.files.images.map(async (file, idx)=>{
        const filename = `tour-${req.params.id}-${Date.now()}-${idx + 1}.jpeg`;
        await (0, $17arc$sharp)(file.buffer).resize(2000, 1333).toFormat("jpeg").jpeg({
            quality: 90
        }).toFile(`public/img/tours/${filename}`);
        req.body.images.push(filename);
    }));
    next();
});
const $db2c20450e00b0f4$export$bef7f5b87ecd4e05 = (req, res, next)=>{
    req.query.limit = "5";
    req.query.sort = "-ratingsAverage, price";
    req.query.fields = "name,price,ratingsAverage,summary,difficulty";
    next();
};
const $db2c20450e00b0f4$export$1b246d2f2efdafde = (0, $7baf6aa1cf2e45c1$export$2774c37398bee8b2)((0, $2fc4c82ee5859497$export$2e2bcd8739ae039), [
    {
        path: "guides",
        select: "-__v -passwordChangedAt"
    }
]);
const $db2c20450e00b0f4$export$95c4b71b6433cd9b = (0, $7baf6aa1cf2e45c1$export$2eb5ba9a66e42816)((0, $2fc4c82ee5859497$export$2e2bcd8739ae039), [
    {
        path: "guides",
        select: "-__v -passwordChangedAt"
    },
    {
        path: "reviews"
    }
]);
const $db2c20450e00b0f4$export$a491843cc088839f = (0, $7baf6aa1cf2e45c1$export$5d49599920443c31)((0, $2fc4c82ee5859497$export$2e2bcd8739ae039));
const $db2c20450e00b0f4$export$e99ebfc19ac06f62 = (0, $7baf6aa1cf2e45c1$export$3220ead45e537228)((0, $2fc4c82ee5859497$export$2e2bcd8739ae039));
const $db2c20450e00b0f4$export$50e56048083c79d4 = (0, $7baf6aa1cf2e45c1$export$36a479340da3c347)((0, $2fc4c82ee5859497$export$2e2bcd8739ae039));
const $db2c20450e00b0f4$export$a2d3e092b567a307 = (0, $5b9d14016737472f$export$2e2bcd8739ae039)(async (req, res, next)=>{
    const stats = await (0, $2fc4c82ee5859497$export$2e2bcd8739ae039).aggregate([
        {
            $match: {
                ratingsAverage: {
                    $gte: 4.5
                }
            }
        },
        {
            $group: {
                _id: {
                    $toUpper: "$difficulty"
                },
                numTours: {
                    $sum: 1
                },
                numRatings: {
                    $sum: "$ratingsQuantity"
                },
                avgRating: {
                    $avg: "$ratingsAverage"
                },
                avgPrice: {
                    $avg: "$price"
                },
                minPrice: {
                    $min: "$price"
                },
                maxPrice: {
                    $max: "$price"
                }
            }
        },
        {
            $sort: {
                avgPrice: 1
            }
        }
    ]);
    res.status(200).json({
        status: "success",
        data: {
            stats: stats
        }
    });
});
const $db2c20450e00b0f4$export$9f2360ce38e60765 = (0, $5b9d14016737472f$export$2e2bcd8739ae039)(async (req, res, next)=>{
    const year = req.params.year * 1;
    const plan = await (0, $2fc4c82ee5859497$export$2e2bcd8739ae039).aggregate([
        {
            $unwind: "$startDates"
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: {
                    $month: "$startDates"
                },
                numTourStarts: {
                    $sum: 1
                },
                tours: {
                    $push: "$name"
                }
            }
        },
        {
            $addFields: {
                month: "$_id"
            }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: {
                numTourStarts: -1
            }
        }
    ]);
    res.status(200).json({
        status: "success",
        data: {
            plan: plan
        }
    });
});
const $db2c20450e00b0f4$export$f0bf44055fab1ca8 = (0, $5b9d14016737472f$export$2e2bcd8739ae039)(async (req, res, next)=>{
    const { distance: distance , latlng: latlng , unit: unit  } = req.params;
    const [lat, lng] = latlng.split(",");
    /* Converting the distance from miles to kilometers. */ const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;
    if (!lat || !lng) next(new (0, $df0ca311bc71284f$export$a996741116394418)("Please provide latitude and longtitude in the format lat,lng", 400));
    /* Using the  operator to find all the tours that are within the radius of the center
  sphere. */ const tours = await (0, $2fc4c82ee5859497$export$2e2bcd8739ae039).find({
        startLocation: {
            $geoWithin: {
                $centerSphere: [
                    [
                        lng,
                        lat
                    ],
                    radius
                ]
            }
        }
    });
    res.status(200).json({
        status: "success",
        results: tours.length,
        data: {
            tours: tours
        }
    });
});
const $db2c20450e00b0f4$export$c76b58cfe053f228 = (0, $5b9d14016737472f$export$2e2bcd8739ae039)(async (req, res, next)=>{
    const { latlng: latlng , unit: unit  } = req.params;
    const [lat, lng] = latlng.split(",");
    /* Converting the distance from miles to kilometers. */ const multiplier = unit === "mi" ? 0.000621371 : 0.001;
    if (!lat || !lng) next(new (0, $df0ca311bc71284f$export$a996741116394418)("Please provide latitude and longtitude in the format lat,lng", 400));
    /* Using the  operator to calculate the distance between the center point and the tours. */ const distances = await (0, $2fc4c82ee5859497$export$2e2bcd8739ae039).aggregate([
        {
            $geoNear: {
                near: {
                    type: "Point",
                    coordinates: [
                        lng * 1,
                        lat * 1
                    ]
                },
                distanceField: "distance",
                distanceMultiplier: multiplier
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ]);
    res.status(200).json({
        status: "success",
        data: distances
    });
});




// import { AppError } from '../utils/appError.js';


const $95695884c4c03ce2$var$reviewSchema = new (0, $17arc$mongoose).Schema({
    review: {
        type: String,
        required: [
            true,
            "Review can not be empty!"
        ]
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: (0, $17arc$mongoose).Schema.ObjectId,
        ref: "Tour",
        required: [
            true,
            "Must select a tour for the review."
        ]
    },
    user: {
        type: (0, $17arc$mongoose).Schema.ObjectId,
        ref: "User",
        required: [
            true,
            "Must be logged in to write a review."
        ]
    }
}, {
    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    }
});
$95695884c4c03ce2$var$reviewSchema.index({
    user: 1,
    tour: 1
}, {
    unique: true
});
$95695884c4c03ce2$var$reviewSchema.pre(/^find/, function(next) {
    this.populate({
        path: "user",
        select: "name photo"
    }).sort("-createdAt");
    next();
});
/* A static method that is used to calculate the average rating of a tour. */ $95695884c4c03ce2$var$reviewSchema.statics.calcAverageRating = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: {
                tour: tourId
            }
        },
        {
            $group: {
                _id: "$tour",
                numRatings: {
                    $sum: 1
                },
                avgRating: {
                    $avg: "$rating"
                }
            }
        }
    ]);
    /* Updating the tour with the new average rating and the number of ratings. */ if (stats.length > 0) await (0, $2fc4c82ee5859497$export$2e2bcd8739ae039).findByIdAndUpdate(tourId, {
        ratingsQuantity: stats[0].numRatings,
        ratingsAverage: stats[0].avgRating
    });
    else await (0, $2fc4c82ee5859497$export$2e2bcd8739ae039).findByIdAndUpdate(tourId, {
        ratingsQuantity: 0,
        ratingsAverage: 4.5
    });
};
/* This is a post middleware that is used to calculate the average rating of a tour after a review is
saved. */ $95695884c4c03ce2$var$reviewSchema.post("save", function() {
    this.constructor.calcAverageRating(this.tour);
});
// /* This is a post middleware that is used to calculate the average rating of a tour after a review is
// updated or deleted. */
$95695884c4c03ce2$var$reviewSchema.post(/^findOneAnd/, async (document)=>{
    await document.constructor.calcAverageRating(document.tour);
});
const $95695884c4c03ce2$var$Review = (0, $17arc$mongoose).model("Review", $95695884c4c03ce2$var$reviewSchema);
var $95695884c4c03ce2$export$2e2bcd8739ae039 = $95695884c4c03ce2$var$Review;



const $70626d93bb1f2022$export$98596c466f7b9045 = (0, $7baf6aa1cf2e45c1$export$2774c37398bee8b2)((0, $95695884c4c03ce2$export$2e2bcd8739ae039), [
    {
        path: "tour",
        select: "name"
    }
]);
const $70626d93bb1f2022$export$c3d3086f9027c35a = (0, $7baf6aa1cf2e45c1$export$2eb5ba9a66e42816)((0, $95695884c4c03ce2$export$2e2bcd8739ae039), [
    {
        path: "tour",
        select: "name"
    }
]);
const $70626d93bb1f2022$export$e42a3d813dd6123f = (0, $7baf6aa1cf2e45c1$export$5d49599920443c31)((0, $95695884c4c03ce2$export$2e2bcd8739ae039));
const $70626d93bb1f2022$export$7019c694ef9e681d = (0, $7baf6aa1cf2e45c1$export$3220ead45e537228)((0, $95695884c4c03ce2$export$2e2bcd8739ae039));
const $70626d93bb1f2022$export$189a68d831f3e4ec = (0, $7baf6aa1cf2e45c1$export$36a479340da3c347)((0, $95695884c4c03ce2$export$2e2bcd8739ae039));
const $70626d93bb1f2022$export$308e5d29efcbb921 = (req, res, next)=>{
    req.body.user = req.user.id;
    req.body.tour = req.params.tourId;
    next();
};


const $5ddccb7a930f5df6$export$c60f46c8c7e1c711 = (0, $17arc$express).Router({
    mergeParams: true
});
$5ddccb7a930f5df6$export$c60f46c8c7e1c711.route("/").get((0, $70626d93bb1f2022$export$98596c466f7b9045)).post((0, $6e76cd689757a637$export$eda7ca9e36571553), (0, $6e76cd689757a637$export$e1bac762c84d3b0c)("user"), (0, $70626d93bb1f2022$export$308e5d29efcbb921), (0, $70626d93bb1f2022$export$e42a3d813dd6123f));
$5ddccb7a930f5df6$export$c60f46c8c7e1c711.route("/:id").get((0, $70626d93bb1f2022$export$c3d3086f9027c35a)).patch((0, $6e76cd689757a637$export$eda7ca9e36571553), (0, $6e76cd689757a637$export$e1bac762c84d3b0c)("admin", "user"), (0, $70626d93bb1f2022$export$7019c694ef9e681d)).delete((0, $6e76cd689757a637$export$eda7ca9e36571553), (0, $6e76cd689757a637$export$e1bac762c84d3b0c)("admin", "user"), (0, $70626d93bb1f2022$export$189a68d831f3e4ec));


const $030732a3fb024f28$export$9fadbfe42ed6150e = (0, $17arc$express).Router();
$030732a3fb024f28$export$9fadbfe42ed6150e.use("/:tourId/reviews", (0, $5ddccb7a930f5df6$export$c60f46c8c7e1c711));
$030732a3fb024f28$export$9fadbfe42ed6150e.route("/top-5-tours").get((0, $db2c20450e00b0f4$export$bef7f5b87ecd4e05), (0, $db2c20450e00b0f4$export$1b246d2f2efdafde));
$030732a3fb024f28$export$9fadbfe42ed6150e.route("/tour-stats").get((0, $db2c20450e00b0f4$export$a2d3e092b567a307));
$030732a3fb024f28$export$9fadbfe42ed6150e.route("/monthly-plan/:year").get((0, $6e76cd689757a637$export$eda7ca9e36571553), (0, $6e76cd689757a637$export$e1bac762c84d3b0c)("admin", "lead-guide", "guide"), (0, $db2c20450e00b0f4$export$9f2360ce38e60765));
$030732a3fb024f28$export$9fadbfe42ed6150e.route("/tours-within/:distance/center/:latlng/unit/:unit").get((0, $db2c20450e00b0f4$export$f0bf44055fab1ca8));
$030732a3fb024f28$export$9fadbfe42ed6150e.route("/distances/:latlng/unit/:unit").get((0, $db2c20450e00b0f4$export$c76b58cfe053f228));
$030732a3fb024f28$export$9fadbfe42ed6150e.route("/").get((0, $db2c20450e00b0f4$export$1b246d2f2efdafde)).post((0, $6e76cd689757a637$export$eda7ca9e36571553), (0, $6e76cd689757a637$export$e1bac762c84d3b0c)("admin", "lead-guide"), (0, $db2c20450e00b0f4$export$a491843cc088839f));
$030732a3fb024f28$export$9fadbfe42ed6150e.route("/:id").get((0, $db2c20450e00b0f4$export$95c4b71b6433cd9b)).patch((0, $6e76cd689757a637$export$eda7ca9e36571553), (0, $6e76cd689757a637$export$e1bac762c84d3b0c)("admin", "lead-guide"), (0, $db2c20450e00b0f4$export$b4cc9a7f549f80be), (0, $db2c20450e00b0f4$export$3f01106131746282), (0, $db2c20450e00b0f4$export$e99ebfc19ac06f62)).delete((0, $6e76cd689757a637$export$eda7ca9e36571553), (0, $6e76cd689757a637$export$e1bac762c84d3b0c)("admin", "lead-guide"), (0, $db2c20450e00b0f4$export$50e56048083c79d4));









const $ceff93128267a391$var$multerStorage = (0, $17arc$multer).memoryStorage();
const $ceff93128267a391$var$multerFilter = (req, file, cb)=>{
    if (file.mimetype.startsWith("image")) cb(null, true);
    else cb(new (0, $df0ca311bc71284f$export$a996741116394418)("Please upload only images ", 400), false);
};
const $ceff93128267a391$var$upload = (0, $17arc$multer)({
    storage: $ceff93128267a391$var$multerStorage,
    fileFilter: $ceff93128267a391$var$multerFilter
});
const $ceff93128267a391$export$6dfd280b9fe74301 = $ceff93128267a391$var$upload.single("photo");
const $ceff93128267a391$export$9308575f5c1b4b50 = (0, $5b9d14016737472f$export$2e2bcd8739ae039)(async (req, res, next)=>{
    if (!req.file) return next();
    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    await (0, $17arc$sharp)(req.file.buffer).resize(500, 500).toFormat("jpeg").jpeg({
        quality: 90
    }).toFile(`public/img/users/${req.file.filename}`);
    next();
});
const $ceff93128267a391$export$69093b9c569a5b5b = (0, $7baf6aa1cf2e45c1$export$2774c37398bee8b2)((0, $8b44e0ee1b8898f4$export$2e2bcd8739ae039));
const $ceff93128267a391$export$7cbf767827cd68ba = (0, $7baf6aa1cf2e45c1$export$2eb5ba9a66e42816)((0, $8b44e0ee1b8898f4$export$2e2bcd8739ae039));
const $ceff93128267a391$export$f308367615b27b0 = (0, $7baf6aa1cf2e45c1$export$3220ead45e537228)((0, $8b44e0ee1b8898f4$export$2e2bcd8739ae039));
const $ceff93128267a391$export$7d0f10f273c0438a = (0, $7baf6aa1cf2e45c1$export$36a479340da3c347)((0, $8b44e0ee1b8898f4$export$2e2bcd8739ae039));
const $ceff93128267a391$export$dd7946daa6163e94 = (req, res, next)=>{
    req.params.id = req.user.id;
    next();
};
/**
 * It takes an object and an array of allowed fields, and returns a new object with only those allowed
 * fields.
 * @param obj - the object to filter
 * @param allowedFields - an array of strings that are allowed to be in the new object
 */ const $ceff93128267a391$var$filterObj = (obj, ...allowedFields)=>{
    const newObj = {};
    Object.keys(obj).forEach((el)=>{
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
};
const $ceff93128267a391$export$60a4a42788db9a49 = (0, $5b9d14016737472f$export$2e2bcd8739ae039)(async (req, res, next)=>{
    /* Checking if the user is trying to update the password or passwordConfirm fields. If they are, it
  will throw an error. */ if (req.body.password || req.body.passwordConfirm) return next(new (0, $df0ca311bc71284f$export$a996741116394418)("This route is not for password updates. Please use the correct route.", 400));
    /* Filtering the body of the request to only allow the name and email fields to be updated. */ const filteredBody = $ceff93128267a391$var$filterObj(req.body, "name", "email");
    if (req.file) filteredBody.photo = req.file.filename;
    /* Updating the user with the id of the logged user. It is using the filteredBody object to update
  the user. */ const updatedUser = await (0, $8b44e0ee1b8898f4$export$2e2bcd8739ae039).findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true,
        returnDocument: "after"
    });
    res.status(200).json({
        status: "success",
        data: {
            user: updatedUser
        }
    });
});
const $ceff93128267a391$export$3667cddbf6d29ade = (0, $5b9d14016737472f$export$2e2bcd8739ae039)(async (req, res, next)=>{
    await (0, $8b44e0ee1b8898f4$export$2e2bcd8739ae039).findByIdAndUpdate(req.user.id, {
        active: false
    });
    res.status(204).json({
        status: "success",
        data: null
    });
});



const $7e06a87e3f3ea8c1$export$5375cda95f0b0eb4 = (0, $17arc$express).Router();
$7e06a87e3f3ea8c1$export$5375cda95f0b0eb4.post("/signup", (0, $6e76cd689757a637$export$7200a869094fec36));
$7e06a87e3f3ea8c1$export$5375cda95f0b0eb4.post("/login", (0, $6e76cd689757a637$export$596d806903d1f59e));
$7e06a87e3f3ea8c1$export$5375cda95f0b0eb4.get("/logout", (0, $6e76cd689757a637$export$a0973bcfe11b05c9));
$7e06a87e3f3ea8c1$export$5375cda95f0b0eb4.post("/forgot-password", (0, $6e76cd689757a637$export$66791fb2cfeec3e));
$7e06a87e3f3ea8c1$export$5375cda95f0b0eb4.patch("/reset-password/:token", (0, $6e76cd689757a637$export$dc726c8e334dd814));
$7e06a87e3f3ea8c1$export$5375cda95f0b0eb4.use((0, $6e76cd689757a637$export$eda7ca9e36571553)); //From this point all of the routes require authentication
$7e06a87e3f3ea8c1$export$5375cda95f0b0eb4.get("/me", (0, $ceff93128267a391$export$dd7946daa6163e94), (0, $ceff93128267a391$export$7cbf767827cd68ba));
$7e06a87e3f3ea8c1$export$5375cda95f0b0eb4.patch("/update-my-password", (0, $6e76cd689757a637$export$e2853351e15b7895));
$7e06a87e3f3ea8c1$export$5375cda95f0b0eb4.patch("/update-my-profile", (0, $ceff93128267a391$export$6dfd280b9fe74301), (0, $ceff93128267a391$export$9308575f5c1b4b50), (0, $ceff93128267a391$export$60a4a42788db9a49));
$7e06a87e3f3ea8c1$export$5375cda95f0b0eb4.delete("/deactivate-my-account", (0, $ceff93128267a391$export$3667cddbf6d29ade));
$7e06a87e3f3ea8c1$export$5375cda95f0b0eb4.use((0, $6e76cd689757a637$export$e1bac762c84d3b0c)("admin"));
$7e06a87e3f3ea8c1$export$5375cda95f0b0eb4.route("/").get((0, $ceff93128267a391$export$69093b9c569a5b5b));
$7e06a87e3f3ea8c1$export$5375cda95f0b0eb4.route("/:id").get((0, $ceff93128267a391$export$7cbf767827cd68ba)).patch((0, $ceff93128267a391$export$f308367615b27b0)).delete((0, $ceff93128267a391$export$7d0f10f273c0438a));



const $a609897e5b20e3d8$var$handleCastErrorDB = (err)=>{
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new (0, $df0ca311bc71284f$export$a996741116394418)(message, 400);
};
const $a609897e5b20e3d8$var$handleDuplicateFieldsDB = (err)=>{
    const message = `Duplicate field value: "${err.keyValue.name}", Please use another value!`;
    return new (0, $df0ca311bc71284f$export$a996741116394418)(message, 400);
};
const $a609897e5b20e3d8$var$handleValidationErrorDB = (err)=>{
    const errors = Object.values(err.errors).map((el)=>el.message);
    const message = `Invalid input data. ${errors.join(". ")}`;
    return new (0, $df0ca311bc71284f$export$a996741116394418)(message, 400);
};
const $a609897e5b20e3d8$var$handleJWTError = ()=>new (0, $df0ca311bc71284f$export$a996741116394418)("Invalid token. Please log in again!", 404);
const $a609897e5b20e3d8$var$handleJWTExpiredError = ()=>new (0, $df0ca311bc71284f$export$a996741116394418)("Session expired. Please log in again!", 401);
const $a609897e5b20e3d8$var$sendErrorDev = (err, req, res)=>{
    if (req.originalUrl.startsWith("/api")) return res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
    console.log("ERROR", err);
    return res.status(err.statusCode).render("error", {
        title: "Something went wrong!",
        msg: err.message
    });
};
const $a609897e5b20e3d8$var$sendErrorProd = (err, req, res)=>{
    // API ERRORS
    if (req.originalUrl.startsWith("/api")) {
        // Operational (known) error, send msg to client
        if (err.isOperational) return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
        console.log("ERROR", err);
        return res.status(500).json({
            status: "error",
            message: "Something went very wrong!"
        });
    }
    // RENDERED WEBSITE ERRORS
    if (err.isOperational) return res.status(err.statusCode).render("error", {
        title: "Something went wrong!",
        msg: err.message
    });
    return res.status(err.statusCode).render("error", {
        title: "Something went wrong!",
        msg: "Please try again later."
    });
};
const $a609897e5b20e3d8$export$54c6946fc34b7cc2 = (err, req, res, next)=>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    if (process.env.NODE_ENV === "development") $a609897e5b20e3d8$var$sendErrorDev(err, req, res);
    else if (process.env.NODE_ENV === "production") {
        let error = {
            ...err
        };
        error.message = err.message;
        if (error.name === "CastError") error = $a609897e5b20e3d8$var$handleCastErrorDB(error);
        if (error.code === 11000) error = $a609897e5b20e3d8$var$handleDuplicateFieldsDB(error);
        if (error.name === "ValidationError") error = $a609897e5b20e3d8$var$handleValidationErrorDB(error);
        if (error.name === "JsonWebTokenError") error = $a609897e5b20e3d8$var$handleJWTError();
        if (error.name === "TokenExpiredError") error = $a609897e5b20e3d8$var$handleJWTExpiredError();
        $a609897e5b20e3d8$var$sendErrorProd(error, req, res);
    }
};






const $e9f7cbced7277ee9$var$bookingSchema = new (0, $17arc$mongoose).Schema({
    tour: {
        type: (0, $17arc$mongoose).Schema.ObjectId,
        ref: "Tour",
        required: [
            true,
            "Booking must belong to a tour."
        ]
    },
    user: {
        type: (0, $17arc$mongoose).Schema.ObjectId,
        ref: "User",
        required: [
            true,
            "Must be logged in book a tour."
        ]
    },
    price: {
        type: Number,
        required: [
            true,
            "Booking must have a price."
        ]
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: true
    }
});
$e9f7cbced7277ee9$var$bookingSchema.pre(/^find/, function(next) {
    this.populate("user").populate({
        path: "tour",
        select: "name"
    });
    next();
});
const $e9f7cbced7277ee9$var$Booking = (0, $17arc$mongoose).model("Booking", $e9f7cbced7277ee9$var$bookingSchema);
var $e9f7cbced7277ee9$export$2e2bcd8739ae039 = $e9f7cbced7277ee9$var$Booking;





const $006c0d0c3f9173c4$export$96591984f736b067 = (0, $5b9d14016737472f$export$2e2bcd8739ae039)(async (req, res, next)=>{
    const tours = await (0, $2fc4c82ee5859497$export$2e2bcd8739ae039).find();
    res.status(200).render("overview", {
        title: "All Tours",
        tours: tours
    });
});
const $006c0d0c3f9173c4$export$95c4b71b6433cd9b = (0, $5b9d14016737472f$export$2e2bcd8739ae039)(async (req, res, next)=>{
    const tour = await (0, $2fc4c82ee5859497$export$2e2bcd8739ae039).findOne({
        slug: req.params.slug
    }).populate({
        path: "guides",
        select: "-__v -passwordChangedAt"
    }).populate({
        path: "reviews",
        select: "review rating user"
    });
    if (!tour) return next(new (0, $df0ca311bc71284f$export$a996741116394418)("There is no such tour.", 404));
    res.status(200).render("tour", {
        title: tour.name,
        tour: tour
    });
});
const $006c0d0c3f9173c4$export$754050d979e640b3 = (req, res)=>{
    res.status(200).render("login", {
        title: "Login"
    });
};
const $006c0d0c3f9173c4$export$4f9234baf34abd0 = (req, res)=>{
    res.status(200).render("account", {
        title: "Your account"
    });
};
const $006c0d0c3f9173c4$export$9a88358588b815c9 = (0, $5b9d14016737472f$export$2e2bcd8739ae039)(async (req, res, next)=>{
    const bookings = await (0, $e9f7cbced7277ee9$export$2e2bcd8739ae039).find({
        user: req.user.id
    });
    const tourIDs = bookings.map((el)=>el.tour);
    const tours = await (0, $2fc4c82ee5859497$export$2e2bcd8739ae039).find({
        _id: {
            $in: tourIDs
        }
    });
    res.status(200).render("overview", {
        title: "My Tours",
        tours: tours
    });
});







const $58bc46fa2bdcc89d$var$stripe = new (0, $17arc$stripe)(process.env.STRIPE_SECRET_KEY);
const $58bc46fa2bdcc89d$export$f1c4cda49673848c = (0, $5b9d14016737472f$export$2e2bcd8739ae039)(async (req, res, next)=>{
    const tour = await (0, $2fc4c82ee5859497$export$2e2bcd8739ae039).findById(req.params.tourId);
    const session = await $58bc46fa2bdcc89d$var$stripe.checkout.sessions.create({
        success_url: `http://localhost:3000/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `http://localhost:3000/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        mode: "payment",
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    unit_amount: tour.price * 100,
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [
                            `https://www.natours.dev/img/tours/${tour.imageCover}`
                        ]
                    }
                },
                quantity: 1
            }
        ]
    });
    res.status(200).json({
        status: "success",
        session: session,
        url: session.url
    });
});
const $58bc46fa2bdcc89d$export$397675b10323feca = (0, $5b9d14016737472f$export$2e2bcd8739ae039)(async (req, res, next)=>{
    const { tour: tour , user: user , price: price  } = req.query;
    if (!tour && !user && !price) return next();
    await (0, $e9f7cbced7277ee9$export$2e2bcd8739ae039).create({
        tour: tour,
        user: user,
        price: price
    });
    res.redirect(req.originalUrl.split("?")[0]);
});
const $58bc46fa2bdcc89d$export$feb18e3d1b2f382c = (0, $7baf6aa1cf2e45c1$export$2774c37398bee8b2)((0, $e9f7cbced7277ee9$export$2e2bcd8739ae039));
const $58bc46fa2bdcc89d$export$98a8f978e5e12ae4 = (0, $7baf6aa1cf2e45c1$export$2eb5ba9a66e42816)((0, $e9f7cbced7277ee9$export$2e2bcd8739ae039));
const $58bc46fa2bdcc89d$export$3877e99530b0c773 = (0, $7baf6aa1cf2e45c1$export$5d49599920443c31)((0, $e9f7cbced7277ee9$export$2e2bcd8739ae039));
const $58bc46fa2bdcc89d$export$3c5ddba2c6c4ec6f = (0, $7baf6aa1cf2e45c1$export$3220ead45e537228)((0, $e9f7cbced7277ee9$export$2e2bcd8739ae039));
const $58bc46fa2bdcc89d$export$b7b1ce5fabd1b486 = (0, $7baf6aa1cf2e45c1$export$36a479340da3c347)((0, $e9f7cbced7277ee9$export$2e2bcd8739ae039));


const $1a8bf5c7a3824624$export$e76b544a93dff53 = (0, $17arc$express).Router();
$1a8bf5c7a3824624$export$e76b544a93dff53.get("/me", (0, $6e76cd689757a637$export$eda7ca9e36571553), (0, $006c0d0c3f9173c4$export$4f9234baf34abd0));
$1a8bf5c7a3824624$export$e76b544a93dff53.get("/my-bookings", (0, $6e76cd689757a637$export$eda7ca9e36571553), (0, $006c0d0c3f9173c4$export$9a88358588b815c9));
$1a8bf5c7a3824624$export$e76b544a93dff53.get("/", (0, $58bc46fa2bdcc89d$export$397675b10323feca), (0, $6e76cd689757a637$export$256a5a3564694cfc), (0, $006c0d0c3f9173c4$export$96591984f736b067));
$1a8bf5c7a3824624$export$e76b544a93dff53.get("/tour/:slug", (0, $6e76cd689757a637$export$256a5a3564694cfc), (0, $006c0d0c3f9173c4$export$95c4b71b6433cd9b));
$1a8bf5c7a3824624$export$e76b544a93dff53.get("/login", (0, $6e76cd689757a637$export$256a5a3564694cfc), (0, $006c0d0c3f9173c4$export$754050d979e640b3));





const $b77b1e5587e03a4c$export$729d9f7015fbd491 = (0, $17arc$express).Router();
$b77b1e5587e03a4c$export$729d9f7015fbd491.use((0, $6e76cd689757a637$export$eda7ca9e36571553));
$b77b1e5587e03a4c$export$729d9f7015fbd491.get("/checkout-session/:tourId", (0, $58bc46fa2bdcc89d$export$f1c4cda49673848c));
$b77b1e5587e03a4c$export$729d9f7015fbd491.use((0, $6e76cd689757a637$export$e1bac762c84d3b0c)("admin", "lead-guide"));
$b77b1e5587e03a4c$export$729d9f7015fbd491.route("/").get((0, $58bc46fa2bdcc89d$export$feb18e3d1b2f382c)).post((0, $58bc46fa2bdcc89d$export$3877e99530b0c773));
$b77b1e5587e03a4c$export$729d9f7015fbd491.route("/:id").get((0, $58bc46fa2bdcc89d$export$98a8f978e5e12ae4)).patch((0, $58bc46fa2bdcc89d$export$3c5ddba2c6c4ec6f)).delete((0, $58bc46fa2bdcc89d$export$b7b1ce5fabd1b486));


const $a9a7ab57a06c005a$var$__filename = (0, $17arc$fileURLToPath)("file:///app.js");
const $a9a7ab57a06c005a$var$__dirname = (0, $17arc$path).dirname($a9a7ab57a06c005a$var$__filename);
const $a9a7ab57a06c005a$var$app = (0, $17arc$express)();
/* Setting the view engine to pug and the views to the views folder. */ $a9a7ab57a06c005a$var$app.set("view engine", "pug");
$a9a7ab57a06c005a$var$app.set("views", (0, $17arc$path).join($a9a7ab57a06c005a$var$__dirname, "views"));
/* Serving the static files in the public folder. */ $a9a7ab57a06c005a$var$app.use((0, $17arc$express).static((0, $17arc$path).join($a9a7ab57a06c005a$var$__dirname, "public")));
/* A security package that sets some HTTP headers. */ $a9a7ab57a06c005a$var$app.use((0, $17arc$helmet)({
    crossOriginResourcePolicy: {
        policy: "cross-origin"
    },
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false
}));
/* Checking if the environment is development, if it is, it will use morgan to log the requests. */ if (process.env.NODE_ENV === "development") $a9a7ab57a06c005a$var$app.use((0, $17arc$morgan)("dev"));
/* Limiting the number of requests to 100 per hour. */ const $a9a7ab57a06c005a$var$limiter = (0, $17arc$expressratelimit)({
    max: 100,
    windowMs: 3600000,
    message: "Too many requests, Please try again later."
});
$a9a7ab57a06c005a$var$app.use("/api", $a9a7ab57a06c005a$var$limiter);
/* A middleware that will parse the body of the request and make it available in the request object. */ $a9a7ab57a06c005a$var$app.use((0, $17arc$express).json({
    limit: "10kb"
}));
$a9a7ab57a06c005a$var$app.use((0, $17arc$cookieparser)());
/* A middleware that will sanitize the request body, query string, and parameters. It will remove the $
and . characters from the request. */ $a9a7ab57a06c005a$var$app.use((0, $17arc$expressmongosanitize)());
/* A middleware that will prevent the parameter pollution. */ $a9a7ab57a06c005a$var$app.use((0, $17arc$hpp)({
    whitelist: [
        "duration",
        "ratingsQuantity",
        "ratingsAverage",
        "maxGroupSize",
        "difficulty",
        "price"
    ]
}));
$a9a7ab57a06c005a$var$app.use((0, $17arc$compression)());
// ROUTES
$a9a7ab57a06c005a$var$app.use("/", (0, $1a8bf5c7a3824624$export$e76b544a93dff53));
$a9a7ab57a06c005a$var$app.use("/api/v1/tours", (0, $030732a3fb024f28$export$9fadbfe42ed6150e));
$a9a7ab57a06c005a$var$app.use("/api/v1/users", (0, $7e06a87e3f3ea8c1$export$5375cda95f0b0eb4));
$a9a7ab57a06c005a$var$app.use("/api/v1/reviews", (0, $5ddccb7a930f5df6$export$c60f46c8c7e1c711));
$a9a7ab57a06c005a$var$app.use("/api/v1/booking", (0, $b77b1e5587e03a4c$export$729d9f7015fbd491));
/* A middleware that will catch all the errors that are not caught by the other middlewares. */ $a9a7ab57a06c005a$var$app.use((0, $a609897e5b20e3d8$export$54c6946fc34b7cc2));
var $a9a7ab57a06c005a$export$2e2bcd8739ae039 = $a9a7ab57a06c005a$var$app;


process.on("uncaughtException", (err)=>{
    console.error("UNHANDLED EXCEPTION! Shutting down...");
    console.log(err.name, err.message);
    process.exit(1);
});
const $af64b696d3b0f2ed$var$DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);
(0, $17arc$mongoose).connect($af64b696d3b0f2ed$var$DB).then(()=>{
    console.log("DB connection ACTIVE");
});
const $af64b696d3b0f2ed$var$port = process.env.PORT;
const $af64b696d3b0f2ed$var$server = (0, $a9a7ab57a06c005a$export$2e2bcd8739ae039).listen($af64b696d3b0f2ed$var$port, ()=>{
    console.log("http://localhost:3000");
    console.log(`Server is running on port ${$af64b696d3b0f2ed$var$port}`);
});
process.on("unhandledRejection", (err)=>{
    console.error("UNHANDLED REJECTION! Shutting down...");
    console.log(err.name, err.message);
    $af64b696d3b0f2ed$var$server.close(()=>{
        process.exit(1);
    });
});


//# sourceMappingURL=main.js.map
