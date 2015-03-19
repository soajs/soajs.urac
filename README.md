# soajs.urac
[![Build Status](https://travis-ci.org/soajs/soajs.urac.svg?branch=master)](https://travis-ci.org/soajs/soajs.urac)
[![Coverage Status](https://coveralls.io/repos/soajs/soajs.urac/badge.png)](https://coveralls.io/r/soajs/soajs.urac)

SOAJS URAC is a service that manages all users accounts for all tenants.

This service is also equipped with an optional mail notification system that is configurable.

The URAC offers the ability to override the service access level as well as configuration for specific users.

The service is Multitenant and provides the:

* ability for administrators to control user accounts, groups and access levels.
* ability to update profile and preferences for logged in members.
* ability to register and login for anonymous users.


##Installation

```sh
$ npm install soajs.urac
$ cd soajs.urac
$ node.
```

---

##Features
Once Installed and running, the URAC service offers different APIs to manage users:

**Public APIs:**

Login
```bash
$ CURL -X POST http://localhost:4000/urac/login -d 'username=john&password=johnpassword'
```
Logout
```bash
$ CURL -X GET http://localhost:4000/urac/logout -d 'username=john'
```
Forgot Password
```bash
$ CURL -X GET http://localhost:4000/urac/forgotPassword -d 'username=john&email=johndoe@domain.com'
```
Register
```bash
$ CURL -X POST http://localhost:4000/urac/join -d 'username=john&password=johnpassword&firstName=John&lastName=Doe&email=johndoe@domain.com'
```

---

**Members APIs:**

Edit Profile
```bash
$ CURL -X POST http://localhost:4000/urac/account/editProfile -d 'uId=123&username=john&firstName=John&lastName=Doe&profile={'gender':'male'}'
```
Change Password
```bash
$ CURL -X POST http://localhost:4000/urac/account/changePassword -d 'uId=123&oldPassword=johnoldpassword&password=johnpassword&confirmation=johnpassword'
```
Change Email
```bash
$ CURL -X POST http://localhost:4000/urac/account/changeEmail -d 'uId=123&email=newemail@domain.com'
```

---

**Administrator APIs:**

List Users
```bash
$ CURL -X GET http://localhost:4000/urac/admin/listUsers
```
Add User
```bash
$ CURL -X POST http://localhost:4000/urac/admin/addUser -d 'username=john&firstName=John&lastName=Doe&email=johndoe@domain.com'
```
Edit User
```bash
$ CURL -X POST http://localhost:4000/urac/admin/editUser -d 'uId=123&username=john&firstName=John&lastName=Doe&email=johndoe@domain.com&status=active'
```
Change User Status
```bash
$ CURL -X GET http://localhost:4000/urac/admin/changeUserStatus -d 'uId=123&status=active'
```

---

##Templates
The URAC is also equipped with templates used by SOAJS notification system.
These templates are configurable, can be themed and are rendered using [SWIG](http://www.swig.org) and contain data from URAC service.

Templates are located in the [registry](http://www.soajs.org/#/documentation/registry) of SOAJS.

---

More information is available on SOAJS website section for [URAC](http://www.soajs.org/#/documentation/urac).