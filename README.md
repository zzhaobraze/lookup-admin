# Growth Shares Connected Content Lookup - Admin Page
This is a simple Rails page to manage the lookup data from [Braze Lookup](https://github.com/zzhaobraze/lookup-test) which can be deployed to Heroku. **This requires installing [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) to attach the DATABASE_URL.**

### Deploying to Heroku
Deploying of this repo can be done manually by cloning this repo and using the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) or by using the Heroku Deploy button to easily deploy this to Heroku.

### Heroku Deplooy
[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://www.heroku.com/deploy/?template=https://github.com/zzhaobraze/lookup-admin)


#### App name
Enter a globally unique app name.

#### Environment Variables

Required Variables:
* LOCKUP_CODEWORD - Codeword for access
* LOCKUP_HINT - Codeword hint
* DATABASE_URL - Postgres connection string. For Heroku deploy, this will be set afterwards via the CLI.

Optional Variables:
* DB_SCHEMA - Database Schema, default `public`.
* DB_TABLE - Database Table, default `lookup`.
* DB_KEY_FIELD - Table Lookup field, default `id`.  Default max size is `200` characters.
* DB_VALUE_FIELD - Table Lookup value from key, default `value`.

### Attached Postgres Addon to App
Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) and [attach the PG add-on](https://devcenter.heroku.com/articles/managing-add-ons#using-the-command-line-interface-attaching-an-add-on-to-another-app).

Find the deployed postgres qualified name from your lookup Heroku Deploy in the format of `postgres-[string]-[number]`.
* This can be found under `Overview` under `Addons`, or `Resources->Heroku Postgres`

Run the following commands to attached the add-on:
```
heroku addons:attach postgres-[string]-[number] -a [Lookup Admin App Name]
```

This should return a response with `HEROKU_POSTGRESQL_[COLOR]`

```
Setting HEROKU_POSTGRESQL_[COLOR] config vars and restarting ⬢ .....
```

Run this command to set the DATABASE_URL as primary
```
heroku pg:promote HEROKU_POSTGRESQL_[COLOR] -a [Lookup Admin App Name]
```

#### Example
* App Name - lookupadmin
* postgres qualified name - postgres-square-123
* postgres response url - HEROKU_POSTGRESQL_BLUE

Attach Add-on:
```
heroku addons:attach postgres-square-123 -a lookupadmin
```

Response:
```
Setting HEROKU_POSTGRESQL_BLUE config vars and restarting ⬢ lookupadmin... done
```

Promoting URL:
```
heroku pg:promote HEROKU_POSTGRESQL_BLUE -a lookupadmin
```

Reponse:
```
Ensuring an alternate alias for existing DATABASE_URL... HEROKU_POSTGRESQL_YELLOW_URL
Promoting square to DATABASE_URL on ⬢ lookupadmin... done
```





