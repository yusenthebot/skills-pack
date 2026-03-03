---
name: "passport"
version: "0.7.0"
downloads: 25.2M/month
description: >
  Simple, unobtrusive authentication for Node.js.. Use when: building REST API servers; middleware-based request handling; route management. NOT for: client-side browser applications; static file serving without a server.
---

# passport

## Overview
Simple, unobtrusive authentication for Node.js.. # Passport Passport is Express-compatible authentication middleware for Node.js.

## Installation
```bash
npm install passport
```

## Core API / Usage
```js
$ npm install passport
```

```js
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (!user.verifyPassword(password)) { return done(null, false); }
      return done(null, user);
    });
  }
));
```

## Common Patterns
### Pattern 1

```js
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});
```

## Configuration
```js
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (!user.verifyPassword(password)) { return done(null, false); }
      return done(null, user);
    });
  }
));
```

## Tips & Gotchas
- Current version: 0.7.0. Check the changelog when upgrading across major versions.
- Refer to the official npm page for edge cases and advanced configuration.
