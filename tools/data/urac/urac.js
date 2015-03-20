var ddb = db.getSiblingDB('test_urac');
//provDb.dropDatabase();

/* Tenants */
var files = listFiles('./users');
for(var i = 0; i < files.length; i++) {
	load(files[i].name);
}

ddb.users.drop();

var records = [];
records.push(antoine);
records.push(user3);
records.push(user2);
records.push(user1);
ddb.users.insert(records);


/* Indexes for users */
ddb.users.ensureIndex({username: 1}, {unique: true});
ddb.users.ensureIndex({email: 1}, {unique: true});


/* new tenant db*/
var ddbT = db.getSiblingDB('TN1_urac');
//provDb.dropDatabase();

/* Tenants */
var files = listFiles('./users');
for(var i = 0; i < files.length; i++) {
	load(files[i].name);
}

ddbT.users.drop();

var records = [];
records.push(user1);
records.push(user3);
records.push(user2);

ddbT.users.insert(records);


/* Indexes for users */
ddbT.users.ensureIndex({username: 1}, {unique: true});
ddbT.users.ensureIndex({email: 1}, {unique: true});