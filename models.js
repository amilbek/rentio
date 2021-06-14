const sequelize = require('./db');
const {DataTypes} = require('sequelize');

const CarOwner = sequelize.define('acc_car_owner', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    first_name: {type: DataTypes.STRING},
    second_name: {type: DataTypes.STRING},
    date_of_birth: {type: DataTypes.DATE},
    address: {type: DataTypes.STRING},
    phone_number: {type: DataTypes.STRING, unique: true,},
    email: {type: DataTypes.STRING, unique: true,},
    password: {type: DataTypes.STRING},
    is_deleted: {type: DataTypes.STRING},
});

const CarRenter = sequelize.define('acc_car_renter', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    first_name: {type: DataTypes.STRING},
    second_name: {type: DataTypes.STRING},
    date_of_birth: {type: DataTypes.DATE},
    address: {type: DataTypes.STRING},
    phone_number: {type: DataTypes.STRING, unique: true,},
    email: {type: DataTypes.STRING, unique: true,},
    password: {type: DataTypes.STRING},
    is_deleted: {type: DataTypes.STRING},
});

const RentalPrice = sequelize.define('prices', {
    price_id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    car_type: {type: DataTypes.STRING},
    price: {type: DataTypes.FLOAT},
});

const DrivingLicense = sequelize.define('driver_license', {
    driver_license_id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    driving_license_number: {type: DataTypes.STRING, unique: true},
    date_of_issue: {type: DataTypes.DATE},
    exp_date: {type: DataTypes.DATE},
    name_of_issuing_authority: {type: DataTypes.STRING},
    IIN: {type: DataTypes.STRING, unique: true},
    perm_categories: {type: DataTypes.STRING},
    add_information: {type: DataTypes.STRING},
    car_renter_id: {type: DataTypes.INTEGER, references: {model: 'acc_car_renters', key: 'id'}},
});

const Car = sequelize.define('car', {
    car_id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    car_brand: {type: DataTypes.STRING},
    car_type: {type: DataTypes.STRING},
    registration_number: {type: DataTypes.STRING, unique: true},
    model: {type: DataTypes.STRING},
    category: {type: DataTypes.STRING},
    certificate_date: {type: DataTypes.DATE},
    vin: {type: DataTypes.STRING},
    release_year: {type: DataTypes.INTEGER},
    engine_capacity: {type: DataTypes.INTEGER},
    color: {type: DataTypes.STRING},
    mass_without_load: {type: DataTypes.INTEGER},
    max_mass_perm: {type: DataTypes.INTEGER},
    series_certificate: {type: DataTypes.STRING, unique: true},
    img_name: { type: DataTypes.STRING },
    costing: { type: DataTypes.FLOAT},
    car_owner_id: {type: DataTypes.INTEGER, references: { model: 'acc_car_owners', key: 'id'}},
    is_deleted: {type: DataTypes.STRING}
});

const Order = sequelize.define('order', {
    order_id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    start_date: {type: DataTypes.DATE},
    end_date: {type: DataTypes.DATE},
    start_location: {type: DataTypes.STRING},
    end_location: {type: DataTypes.STRING},
    price: {type: DataTypes.FLOAT},
    reservation_status: {type: DataTypes.STRING},
    card_type: {type: DataTypes.STRING},
    name_on_card: {type: DataTypes.STRING},
    card_number: {type: DataTypes.STRING},
    exp_date: {type: DataTypes.DATE},
    cvv_cvc: {type: DataTypes.STRING},
    car_renter_id: {type: DataTypes.INTEGER, references: {model: 'acc_car_renters', key: 'id'}},
    car_id: {type: DataTypes.INTEGER, references: { model: 'cars', key: 'car_id'}},
});

// CarRenter.hasOne(DrivingLicense);
//
// CarOwner.hasMany(Car);
//
// CarRenter.hasOne(Order);
//
// Car.hasOne(Order);
module.exports = {
    CarRenter,
    CarOwner,
    DrivingLicense,
    Car,
    RentalPrice,
    Order
};