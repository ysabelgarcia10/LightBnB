SELECT properties.id, properties.title, properties.cost_per_night, properties.city, AVG(property_reviews.rating) as avg_rating
FROM properties
JOIN property_reviews ON property_reviews.property_id = properties.id
WHERE properties.city LIKE '%ancouv%'
GROUP BY properties.id
HAVING AVG(property_reviews.rating) >= 4
ORDER BY cost_per_night
LIMIT 10
;
