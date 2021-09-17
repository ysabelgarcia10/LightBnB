const properties = require('./json/properties.json');
const users = require('./json/users.json');

const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */

const getUserWithEmail = function(email) {
  return pool.query(`
    SELECT * 
    FROM users 
    WHERE email = $1;
    `,[email])
  .then((result) => {
    if (result.rows.length === 0) {
      return Promise.resolve(null)
    } else {
    return Promise.resolve(result.rows[0])
    }
  })
  .catch((err) => {
    return (err.message)
  });
}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */

const getUserWithId = function(id) {
  return pool.query(`
    SELECT * 
    FROM users 
    WHERE id = $1;
    `,[id])
  .then((result) => {
    if (result.rows.length === 0) {
      return Promise.resolve(null)
    } else {
    return Promise.resolve(result.rows[0])}})
  .catch((err) => {
    return (err.message)
  });
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */

const addUser =  function(user) {
  return pool.query(`
    INSERT INTO users (name, email, password)
    VALUES ($1, $2, $3)
    RETURNING *;
    `, [user.name, user.email, user.password])
  .then((result) => {
    return Promise.resolve(result.rows[0])})
  .catch((err) => {
    return (err.message)
  });
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  return pool.query(`
    SELECT reservations.*, properties.*, avg(property_reviews.rating) as average_rating
    FROM reservations
    JOIN properties ON properties.id = reservations.property_id
    JOIN property_reviews ON properties.id = property_reviews.property_id
    WHERE reservations.guest_id = $1 AND reservations.end_date < NOW()
    GROUP BY reservations.id, properties.id
    ORDER BY reservations.start_date DESC
    LIMIT $2;
    `, [guest_id, limit])
  .then((result) => {
    console.log(`RESULT FOUND ON ${guest_id}`)
    return Promise.resolve(result.rows)})
  .catch((err) => {
    return (err.message)
  });
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function(options, limit = 10) {
  
  // 1
  const queryParams = [];
  // 2
  let queryString = `
  SELECT properties.*, avg(property_reviews.rating) as average_rating
  FROM properties
  JOIN property_reviews ON properties.id = property_id
  `;

  // 3
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  };
  
  //OPTIONAL
  if (options.minimum_price_per_night) {
    const minPriceCents = options.minimum_price_per_night * 100
    queryParams.push(`${minPriceCents}`);
    queryString += `AND cost_per_night >= $${queryParams.length} `;
  };
  
  //OPTIONAL
  if (options.maximum_price_per_night) {
    const maxPriceCents = options.maximum_price_per_night * 100
    queryParams.push(`${maxPriceCents}`);
    queryString += `AND cost_per_night <= $${queryParams.length} `;
  };
  
  
  // 4
  queryString += `
  GROUP BY properties.id`
  
  //OPTIONAL
  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
    queryString += `
    HAVING avg(property_reviews.rating) >= $${queryParams.length} `;
  };

  //5
  queryParams.push(limit);
  queryString +=`
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;

  // 5
  console.log(options);
  console.log("query string", queryString, "query params", queryParams);

  // 6
  return pool.query(queryString, queryParams).then((res) => res.rows);
}
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {

  return pool.query(`
    INSERT INTO properties (owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    RETURNING *;
    `, [property.owner_id, property.title, property.description, property.thumbnail_photo_url, property.cover_photo_url, property.cost_per_night, property.street, property.city, property.province, property.post_code, property.country, property.parking_spaces, property.number_of_bathrooms, property.number_of_bedrooms])
  .then((result) => {
    return Promise.resolve(result.rows[0])})
  .catch((err) => {
    return (err.message)
  });
}
exports.addProperty = addProperty;
