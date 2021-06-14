require('dotenv').config();
const express = require('express');
const sequelize = require('./db');
const cors = require('cors');
const bcrypt = require('bcrypt');
const flash = require('express-flash');
const session = require('express-session');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const bodyParser = require('body-parser');
const {QueryTypes} = require("sequelize");
const fileUpload = require('express-fileupload');
const FileType = require('file-type');
const {CarOwner, CarRenter, DrivingLicense, Car, RentalPrice, Order} = require('./models');

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());
app.use(session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false
    }));
app.use(flash());

app.use(bodyParser.json());
app.use(fileUpload());

const urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use("/img", express.static(__dirname + "public/img"));
app.use("/js", express.static(__dirname + "public/js"));

app.get('/main', function(req, res) {
    res.render('main.ejs');
});

app.get('/categories', function(req, res) {
    res.render('categories');
});

app.get('/users/main', function(req, res) {
    res.render('main');
});

app.get('/users/owner/:id/main', function(req, res) {
    res.render('main');
});

app.get('/users/registration', function(req, res) {
    res.render('registration.ejs');
});

app.get('/users/login', function(req, res) {
    res.render('login.ejs');
});

app.get("/users/logout", function (req, res) {
    res.render('main', { message: "You have logged out successfully" });
});

app.get('/users/categories', function (req, res) {
    res.render('categories');
})

app.get('/users/owner/:id', async (req, res) => {
    const id = req.params.id;
    const data = await CarOwner.findOne({where: {id}});
    res.render('ownerProfile', {data});
});

app.get('/users/renter/:id', async (req, res) => {
    const id = req.params.id;
    const data = await CarRenter.findOne({where: {id}});
    res.render('renterProfile', {id, data});
});

app.get('/users/owner/:id/edit', async (req, res) => {
    const id = req.params.id;
    const data = await CarOwner.findOne({where: {id}});
    res.render('ownerEdit', {data});
});

app.get('/users/renter/:id/edit', async (req, res) => {
    const id = req.params.id;
    const data = await CarRenter.findOne({where: {id}});
    res.render('renterEdit', {data});
});

app.get('/users/renter/:id/license', async (req, res) => {
    const data = req.params;
    res.render('license.ejs', {data});
});

app.get('/users/renter/:id/view', async (req, res) => {
    const id = req.params.id;
    const data = await CarRenter.findOne({where: {id}});
    const license = await DrivingLicense.findOne({where: { car_renter_id: id }});
    if (license) {
        res.render('viewLicense', {id, data, license});
    } else {
        req.flash("error_msg", "You have not added Your Driving License");
        res.render('viewNotLicense', {data});
    }
})

app.get('/users/owner/:id/car', async (req, res) => {
    const data = req.params;
    res.render('car', {data});
});

app.get('/users/owner/:id/cars', async (req,res) => {
    const owner = req.params;
    const data = await Car.findAll({where: {is_deleted: 'false'}});
    res.render('carsOwner', {data, owner});
});

app.get('/users/renter/:id/cars', async (req,res) => {
    const renter = req.params;
    const data = await Car.findAll({where: {is_deleted: 'false'}});
    res.render('carsRenter', {data, renter});
});

app.get('/users/renter/:id/license/edit', async (req, res) => {
    const id = req.params.id;
    const data = await CarRenter.findOne({where: {id: id}});
    const license = await DrivingLicense.findOne({where: {car_renter_id: id }});
    res.render('licenseEdit', {id, data, license});
});

app.get('/users/renter/:id/order', async (req, res) => {
    const data = req.params;
    res.render('order', {data});
});

app.get('/users/renter/:id/orders', async (req, res) => {
    const id = req.params.id;
    const data = req.params;
    const orders = await Order.findAll({where: {car_renter_id: id}});
    res.render('myOrders', {data, orders});
});

app.get('/users/renter/:id/orders/:order_id', async (req, res) => {
    const id = req.params.id;
    const order_id = req.params.order_id;
    const renter = await CarRenter.findOne({where: {id: id}});
    const order = await Order.findOne({where: {order_id: order_id}});
    const car = await Car.findOne({where: {car_id: order.car_id}});
    res.render('myOrderDetails', {renter, order, car});
});

app.get('/users/owner/:id/cars/:car_id', async (req, res) => {
    const owner = req.params.id;
    const car_id = req.params.car_id;
    const car = await Car.findOne({where: {car_id: car_id}});
    res.render('carDetailsOwner', {owner, car});
});

app.get('/users/renter/:id/cars/:car_id', async (req, res) => {
    const renter = req.params;
    const car_id = req.params.car_id;
    const car = await Car.findOne({where: {car_id: car_id}});
    res.render('carDetailsRenter', {renter, car, car_id});
});

app.get('/users/owner/:id/view', async (req, res) => {
    const id = req.params.id;
    const data = req.params;
    const cars = await Car.findAll({where: {car_owner_id: id, is_deleted: 'false'}});
    console.log(cars);
    res.render('myCars', {data, cars});
});

app.get('/users/owner/:id/view/:car_id', async (req, res) => {
    const owner = req.params.id;
    const car_id = req.params.car_id;
    const car = await Car.findOne({where: {car_id: car_id}});
    res.render('myCarDetails', {owner, car});
});

app.get('/users/owner/:id/view/:car_id/edit', async (req, res) => {
    const id = req.params.id;
    const car_id = req.params.car_id;
    const owner = await CarOwner.findOne({where: {id: id}});
    const car = await Car.findOne({where: {car_id: car_id }});
    res.render('carEdit', {owner, car});
});

app.post('/users/registration', async (req, res) => {
    const { first_name, second_name, date_of_birth, address, phone_number, email, password, confirmPassword,
        role } = req.body;

    const is_deleted = 'false';

    console.log({
        first_name,
        second_name,
        date_of_birth,
        address,
        phone_number,
        email,
        password,
        confirmPassword,
        role,
        is_deleted
    });

    let errors = [];

    if (!first_name || !second_name || !date_of_birth || !address || !phone_number || !email || !password ||
    !confirmPassword) {
        errors.push({message: "Please, enter all fields"});
    }
    if(password.length < 8) {
        errors.push({message: 'Password should contain at least 8 characters!'});
    }
    const digits = /[0-9]/;
    if(!digits.test(password)) {
        errors.push({message: "Password should be at least 8 characters"});
    }
    const lowerCase = /[a-z]/;
    if(!lowerCase.test(password)) {
        errors.push({message: 'Password should contain at least one lowercase(a-z)!'});
    }
    const upperCase = /[A-Z]/;
    if(!upperCase.test(password)) {
        errors.push({message: 'Password should contain at least one uppercase(A-Z)!'});
    }
    const specialCharacters = /[!@#$%^&*]/;
    if(!specialCharacters.test(password)) {
        errors.push({message: 'Password should contain at least one special character(!@#$%^&*)!'});
    }
    if (password !== confirmPassword) {
        errors.push({message: "Passwords do not match"});
    }
    if (role === "Car Owner") {
        const candidate = await CarOwner.findOne({where: {email}});
        const telephone = await CarOwner.findOne({where: {phone_number}});
        const status = await CarOwner.findOne({where: {email, phone_number}})
        if (candidate) {
            errors.push({message:'User with this email is already exists!'});
        }
        if (telephone) {
            errors.push({message:'User with this phone number is already exists!'});
        }
        const hashPassword = await bcrypt.hash(password, 10);
        if (errors.length > 0) {
            if (status) {
                await CarOwner.update({
                    is_deleted: 'false'
                }, {
                    where: {
                        email: email,
                        phone_number: phone_number
                    }
                });
            } else {
                res.render("registration", {errors});
            }
        } else {
            await CarOwner.create({
                first_name, second_name, date_of_birth, address, phone_number, email,
                password: hashPassword, is_deleted
            });
        }
    } else if (role === "Car Renter") {
        const candidate = await CarRenter.findOne({where: {email}});
        const telephone = await CarRenter.findOne({where: {phone_number}});
        const status = await CarRenter.findOne({where: {email, phone_number}});
        if (candidate) {
            errors.push({message: 'User with this email is already exists!'});
        }
        if (telephone) {
            errors.push({message: 'User with this phone number is already exists!'});
        }
        const hashPassword = await bcrypt.hash(password, 10);
        if (errors.length > 0) {
            if (status) {
                await CarRenter.update({
                    is_deleted: 'false'
                }, {
                    where: {
                        email: email,
                        phone_number: phone_number
                    }
                });
            } else {
                res.render("registration", {errors});
            }
        } else {
            await CarRenter.create({
                first_name, second_name, date_of_birth, address, phone_number, email,
                password: hashPassword, is_deleted
            });
        }
    } else {
        let errors = [];
        errors.push({message: "You did not choose your role!"});
        res.render("registration", {errors});
    }
    req.flash("success_msg", "You are now registered. Please log in");
    res.redirect("/users/login");
});

app.post('/users/login', async (req, res) => {
    const {email, password, role} = req.body;

    let errors = [];
    console.log({
        email, 
        password, 
        role
    });

    if (!email || !password) {
        errors.push({message: "Please, enter all fields"});
    }
    if (role === "Car Owner") {
        const owner = await CarOwner.findOne({
            where: {
                email
            }});
        if (!owner) {
            errors.push({message: 'User does not exist!'});
            res.render("login", {errors});
        }
        if (owner.is_deleted === 'true') {
            errors.push({message: 'User does not exist!'});
            res.render("login", {errors});
        }
        let comparePassword = bcrypt.compareSync(password, owner.password);
        if (!comparePassword) {
            errors.push({message: 'Password is incorrect!'});
        }
        if (errors.length > 0) {
            res.render("login", {errors});
        } else {
            res.redirect(`/users/owner/${owner.id}`);
        }
    } else if (role === "Car Renter") {
        const renter = await CarRenter.findOne({where: {email}});
        if (!renter) {
            errors.push({message: 'User does not exist!'});
            res.render("login", {errors});
        }
        if (renter.is_deleted === 'true') {
            errors.push({message: 'User does not exist!'});
            res.render("login", {errors});
        }
        let comparePassword = bcrypt.compareSync(password, renter.password);
        if (!comparePassword) {
            errors.push({message: 'Password is incorrect!'});
        }
        if (errors.length > 0) {
            res.render("login", {errors});
        } else {
            res.redirect(`/users/renter/${renter.id}`);
        }
    } else {
        let errors = [];
        errors.push({message: "You did not choose your role!"});
        res.render("login", {errors});
    }
});

app.post('/users/owner/:id/edit', async (req, res) => {
    const id = req.params.id;
    const { first_name, second_name, date_of_birth, address, phone_number, email } = req.body;
    await CarOwner.update({
            first_name: first_name,
            second_name: second_name,
            date_of_birth: date_of_birth,
            address: address,
            phone_number: phone_number,
            email: email
        },
        {
            where: {
                id: id
            }
        });
    res.redirect(`/users/owner/${id}`);
});

app.post('/users/renter/:id/edit', async (req, res) => {
    const id = req.params.id;
    const { first_name, second_name, date_of_birth, address, phone_number, email } = req.body;
    await CarRenter.update({
            first_name: first_name,
            second_name: second_name,
            date_of_birth: date_of_birth,
            address: address,
            phone_number: phone_number,
            email: email
        },
        {
            where: {
                id: id
            }
        });
    res.redirect(`/users/renter/${id}/`);
});

app.post('/users/owner/:id/delete', async (req, res) => {
    const id = req.params.id;
    await Car.update({
        is_deleted: 'true'
        }, {
        where: {
            car_owner_id: id
        }
    });
    await CarOwner.update({
            is_deleted: 'true'
        },
        {
            where: {
                id: id
            }
        });
    res.redirect(`/main`);
});

app.post('/users/renter/:id/delete', async (req, res) => {
    const id = req.params.id;
    await DrivingLicense.update({
            is_deleted: 'true'
        }, {
            where: {
                car_renter_id: id
            }
        });
    await CarRenter.update({
            is_deleted: 'true'
        },
        {
            where: {
                id: id
            }
        });
    res.redirect(`/main`);
});

app.post('/users/renter/:id/license', async (req, res) => {
    const data = req.params;
    const { driving_license_number, date_of_issue, exp_date, name_of_issuing_authority, IIN, perm_categories,
        add_information, car_renter_id } = req.body;

    let errors = [];
    console.log({
        driving_license_number,
        date_of_issue,
        exp_date,
        name_of_issuing_authority,
        IIN,
        perm_categories,
        add_information,
        car_renter_id
    });

    if (!driving_license_number || !date_of_issue || !exp_date || !name_of_issuing_authority || !IIN ||
        !perm_categories || !add_information || !car_renter_id) {
        errors.push({message: "Please, enter all fields"});
    }
    const checkLicenseNumber = await DrivingLicense.findOne({where: {driving_license_number}});
    if (!checkLicenseNumber) {
        errors.push({message: 'Driver with this Driving License Number already registered'});
    }
    const checkIIN = await DrivingLicense.findOne({where: {IIN}});
    if (checkIIN) {
        errors.push({message: 'Driver with this Individual Identification Number already registered!'});
    }
    const checkAccCarRenterId = await DrivingLicense.findOne({where: {car_renter_id}});
    if (checkAccCarRenterId) {
        errors.push({message: 'Driver have already registered his/her Driving License Card!'});
    }
    if (errors.length > 0) {
        res.render(`license`, {errors, data});
    } else {
        await DrivingLicense.create({driving_license_number, date_of_issue, exp_date,
            name_of_issuing_authority, IIN, perm_categories, add_information, car_renter_id });
    }
    req.flash("success_msg", "You added Your Driving License Number");
    res.redirect(`/users/renter/${data.id}`);
});

app.post('/users/renter/:id/license/edit', async (req, res) => {
    const id = req.params.id;
    console.log(id);
    const { driving_license_number, date_of_issue, exp_date, name_of_issuing_authority, IIN, perm_categories,
        add_information } = req.body;
    await DrivingLicense.update({
            driving_license_number: driving_license_number,
            date_of_issue: date_of_issue,
            exp_date: exp_date,
            name_of_issuing_authority: name_of_issuing_authority,
            IIN: IIN,
            perm_categories: perm_categories,
            add_information: add_information
        }, {
            where: {
                car_renter_id: id
            }
        });
    res.redirect(`/users/renter/${id}/view`);
});

app.post('/users/owner/:id/car', async (req, res) => {
    const data = req.params;
    const { car_brand, car_type, registration_number, model, category, certificate_date, vin, release_year,
        engine_capacity, color, mass_without_load, max_mass_perm, special_routs, series_certificate,
        car_owner_id } = req.body;

    const img = req.files.img;
    const img_name = img.name;

    await img.mv('public/img/upload_images/' + img.name);

    const is_deleted = 'false';

    console.log({
        car_brand,
        car_type,
        registration_number,
        model,
        category,
        certificate_date,
        vin,
        release_year,
        engine_capacity,
        color,
        mass_without_load,
        max_mass_perm,
        special_routs,
        series_certificate,
        img,
        car_owner_id,
        is_deleted
    });

    let errors = [];

    if (!car_type || !car_brand || !registration_number || !model || !category || !certificate_date || !vin ||
        !release_year || !engine_capacity || !color || !mass_without_load || !max_mass_perm ||
        !series_certificate || !img || !car_owner_id) {
        errors.push({message: "Please, enter all fields"});
    }

    const checkNumber = await Car.findOne({where: {registration_number}});
    if (checkNumber) {
        errors.push({message: 'Car with this Registration Number already registered'});
    }
    const checkVIN = await Car.findOne({where: {vin}});
    if (checkVIN) {
        errors.push({message: 'Car with this VIN already registered!'});
    }
    if (color === '*') {
        errors.push({message: 'Choose a Color of Your Car'});
    }
    if (car_type === '*') {
        errors.push({message: 'Choose a Class of Your Car'});
    }
    if (car_brand === '*') {
        errors.push({message: 'Choose a Brand of Your Car'});
    }
    let costing;
    if (car_type === 'Economy') {
        costing = 8000;
    } else if (car_type === 'Comfort') {
        costing = 9500;
    } else if (car_type === 'Business') {
        costing = 11000;
    } else if (car_type === 'Minivan') {
        costing = 12000;
    } else if (car_type === 'Cargo') {
        costing = 15000;
    }
    const checkCertificate = await Car.findOne({where: {series_certificate}});
    if (checkCertificate) {
        errors.push({message: 'Car with this Series Certificate already registered!'});
    }
    if (errors.length > 0) {
        res.render(`car`, {errors, data});
    } else {
        await Car.create({car_brand, car_type, registration_number, model, category, certificate_date,
            vin, release_year, engine_capacity, color, mass_without_load, max_mass_perm,
            series_certificate, img_name, costing, car_owner_id, is_deleted});
    }
    req.flash("success_msg", "You added a Car");
    res.redirect(`/users/owner/${data.id}`);
});

app.post('/users/owner/:id/view/:car_id/edit', async (req, res) => {
    const id = req.params.id;
    const car_id = req.params.car_id;
    const { car_brand, registration_number, model, category, certificate_date, vin, release_year,
        engine_capacity, color, mass_without_load, max_mass_perm, special_routs, series_certificate } = req.body;

    await Car.update({
        car_brand,
        registration_number,
        model,
        category,
        certificate_date,
        vin,
        release_year,
        engine_capacity,
        color,
        mass_without_load,
        max_mass_perm,
        series_certificate
    }, {
        where: {
            car_id: car_id
        }
    });
    req.flash("success_msg", "You updated a Car successfully");
    res.redirect(`/users/owner/${id}/view/${car_id}`);
});

app.post('/users/owner/:id/view/:car_id/delete', async (req, res) => {
    const owner = req.params.id;
    const car_id = req.params.car_id;
    await Car.update({
        is_deleted: true
    }, {
        where: {
            car_id: car_id
        }
    });
    req.flash("success_msg", "You deleted a Car successfully");
    res.redirect(`/users/owner/${owner}/view`);
});

app.get('/prices', function(req, res) {
    res.render('prices');
})

app.post('/prices', async (req, res) => {
    const {car_type, price} = req.body;

    await RentalPrice.create({car_type, price});
});

app.post('/users/renter/:id/order', async (req, res) => {
    const data = req.params;
    const id = req.params.id;
    const { start_date, end_date, start_location, end_location, card_type, name_on_card, card_number, exp_date, cvv_cvc,
        car_renter_id, car_id } = req.body;

    console.log({
        start_date,
        end_date,
        start_location,
        end_location,
        card_type,
        name_on_card,
        card_number,
        exp_date,
        cvv_cvc,
        car_renter_id,
        car_id
    });

    const reservation_status = 'reserved';

    let errors = [];

    if (!start_date || !end_date || !start_location || !end_location || !card_type || !name_on_card ||
        !card_number || !exp_date || !cvv_cvc || !car_renter_id || !car_id) {
        errors.push('Please, enter all fields!');
    }

    const status = await Order.findOne({where: {car_id: car_id} });

    const hashData = await bcrypt.hash(cvv_cvc, 10);
    const costing = await Car.findOne({where: {car_id: car_id}});
    let daysNumber, aDay = 86400000
    daysNumber = Math.floor((Date.parse(end_date) - Date.parse(start_date)) / aDay);
    const price = daysNumber * costing.costing;
    console.log(daysNumber);
    console.log(price);
    console.log(costing.costing);

    if (daysNumber <= 0) {
        errors.push('You entered incorrect dates');
    }
    if (daysNumber > 10) {
        errors.push('You can not rent a car more than 10 days');
    }
    if (status) {
        if (status.reservation_status === "reserved" || status.reservation_status === "started" &&
            (status.start_date >= start_date && status.end_date <= end_date)) {
            errors.push('Car is already ordered, please, choose another car');
        }
        if (errors.length > 0) {
            res.render(`order`, { errors, data, id });
        } else {
            await Order.create({
                start_date,
                end_date,
                start_location,
                end_location,
                price,
                reservation_status,
                card_type,
                name_on_card,
                card_number,
                exp_date,
                cvv_cvc: hashData,
                car_renter_id,
                car_id
            });
        }
        req.flash("success_msg", "You ordered the car successfully!");
        res.redirect(`/users/renter/${data.id}`);
    }
    else {
        if (errors.length > 0) {
            res.render(`order`, { errors, data, id });
        } else {
            await Order.create({
                start_date,
                end_date,
                start_location,
                end_location,
                price,
                reservation_status,
                card_type,
                name_on_card,
                card_number,
                exp_date,
                cvv_cvc: hashData,
                car_renter_id,
                car_id
            });
        }
        req.flash("success_msg", "You ordered the car successfully!");
        res.redirect(`/users/renter/${id}`);
    }
});

app.post('/users/renter/:id/orders/:order_id/started', async( req, res) => {
    const id = req.params.id;
    const order_id = req.params.order_id;
    const status = await Order.findOne({where: {order_id: order_id}});
    if (status.reservation_status !== 'reserved') {
        req.flash("error_msg", "You can not start the rental because the car rental has been canceled or completed");
    } else if (status.reservation_status === 'started') {
        req.flash("error_msg", "You have already started the car rental");
    } else {
        await Order.update({
                reservation_status: 'started'
            },
            {
                where: {
                    order_id: order_id
                }
            });
    }
    res.redirect(`/users/renter/${id}/orders/${order_id}`);
});

app.post('/users/renter/:id/orders/:order_id/completed', async( req, res) => {
    const id = req.params.id;
    const order_id = req.params.order_id;
    const status = await Order.findOne({where: {order_id: order_id}});
    if (status.reservation_status !== 'started') {
        req.flash("error_msg", "You can not complete the rental because the car rental has not been started");
    } else if (status.reservation_status === 'completed') {
        req.flash("error_msg", "You have already completed the car rental");
    } else {
        await Order.update({
                reservation_status: 'completed'
            },
            {
                where: {
                    order_id: order_id
                }
            });
    }
    res.redirect(`/users/renter/${id}/orders/${order_id}`);
});

app.post('/users/renter/:id/orders/:order_id/canceled', async( req, res) => {
    const id = req.params.id;
    const order_id = req.params.order_id;
    const status = await Order.findOne({where: {order_id: order_id}});
    if (status.reservation_status !== 'reserved') {
        req.flash("error_msg", "You can not cancel the rental because the car rental has been started or completed");
    } else if (status.reservation_status === 'canceled') {
        req.flash("error_msg", "You have already canceled the car rental");
    } else {
        await Order.update({
                reservation_status: 'canceled'
            },
            {
                where: {
                    order_id: order_id
                }
            });
    }
    res.redirect(`/users/renter/${id}/orders/${order_id}`);
});

app.post('/users/renter/:id/cars', async (req, res) => {
    const renter = req.params;
    const { car_type, car_brand, color } = req.body;

    const is_deleted = 'false';

    console.log({
        car_type,
        car_brand,
        color
    });

    let data;

    if (car_type === '*' && car_brand === '*' && color === '*') {
        data = await Car.findAll();
    }
    if (car_type !== '*' && car_brand === '*' && color === '*') {
        data = await Car.findAll({where: {car_type: car_type, is_deleted: is_deleted}});
    }
    if (car_type === '*' && car_brand !== '*' && color === '*') {
        data = await Car.findAll({where: {car_brand: car_brand, is_deleted: is_deleted}});
    }
    if (car_type === '*' && car_brand === '*' && color !== '*') {
        data = await Car.findAll({where: {color: color, is_deleted: is_deleted}});
    }
    if (car_type !== '*' && car_brand !== '*' && color === '*') {
        data = await Car.findAll({where: {car_type: car_type, car_brand: car_brand, is_deleted: is_deleted}});
    }
    if (car_type !== '*' && car_brand === '*' && color !== '*') {
        data = await Car.findAll({where: {car_type: car_type, color: color, is_deleted: is_deleted}});
    }
    if (car_type === '*' && car_brand !== '*' && color !== '*') {
        data = await Car.findAll({where: {car_brand: car_brand, color: color, is_deleted: is_deleted}});
    }
    if (car_type !== '*' && car_brand !== '*' && color !== '*') {
        data = await Car.findAll({where: {car_type: car_type, car_brand: car_brand, color: color, is_deleted: is_deleted}});
    }
    if (!data) {
        req.flash("error_msg", "No car with these options");
        res.redirect(`/users/renter/${renter.id}/cars`);
        console.log('No car with these options');
    } else {
        console.log(data);
    }
    res.render('carsRenter', {renter, data});
});

app.post('/users/owner/:id/cars', async (req, res) => {
    const owner = req.params;
    const { car_type, car_brand, color } = req.body;

    const is_deleted = 'false';

    console.log({
        car_type,
        car_brand,
        color
    });

    let data;

    if (car_type === '*' && car_brand === '*' && color === '*') {
        data = await Car.findAll({where: {is_deleted: is_deleted}});
    }
    if (car_type !== '*' && car_brand === '*' && color === '*') {
        data = await Car.findAll({where: {car_type: car_type, is_deleted: is_deleted}});
    }
    if (car_type === '*' && car_brand !== '*' && color === '*') {
        data = await Car.findAll({where: {car_brand: car_brand, is_deleted: is_deleted}});
    }
    if (car_type === '*' && car_brand === '*' && color !== '*') {
        data = await Car.findAll({where: {color: color, is_deleted: is_deleted}});
    }
    if (car_type !== '*' && car_brand !== '*' && color === '*') {
        data = await Car.findAll({where: {car_type: car_type, car_brand: car_brand, is_deleted: is_deleted}});
    }
    if (car_type !== '*' && car_brand === '*' && color !== '*') {
        data = await Car.findAll({where: {car_type: car_type, color: color, is_deleted: is_deleted}});
    }
    if (car_type === '*' && car_brand !== '*' && color !== '*') {
        data = await Car.findAll({where: {car_brand: car_brand, color: color, is_deleted: is_deleted}});
    }
    if (car_type !== '*' && car_brand !== '*' && color !== '*') {
        data = await Car.findAll({where: {car_type: car_type, car_brand: car_brand, color: color, is_deleted: is_deleted}});
    }
    if (!data) {
        req.flash("error_msg", "No car with these options");
        res.redirect(`/users/owner/${owner.id}/cars`);
        console.log('No car with these options');
    } else {
        console.log(data);
    }
    res.render('carsOwner', {owner, data});
});

const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        app.listen(PORT, () => console.log(`server started on port ${PORT}`));
    } catch (e) {
        console.log(e);
    }
}

start();