module.exports = {
  selectSpecificUserQuery: 'SELECT * FROM "user" WHERE username = $1',
  selectAllHousesQuery: "SELECT * FROM house",
  createUserQuery:
    'INSERT INTO "user"(username, housename, earned_points, role) VALUES($1, $2, $3, $4)',
  addPointsToUserQuery:
    'UPDATE "user" SET earned_points = earned_points + $1 where username = $2',
  addPointsToHouseQuery:
    "UPDATE house SET score = score + $1 where housename = $2",
  selectRoleFromSpecificUserQuery:
    'SELECT "role" FROM "user" WHERE username = $1',
  removePointsToUserQuery:
    'UPDATE "user" SET earned_points = earned_points - $1 where username = $2',
  removePointsToHouseQuery:
    "UPDATE house SET score = score - $1 where housename = $2"
};
