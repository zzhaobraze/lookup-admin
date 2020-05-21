# Growth Shares Connected Content Lookup - Admin Page
This is a simple Rails page to manage the lookup data from [Braze Lookup](https://github.com/zzhaobraze/lookup-test) which can be deployed to Heroku.

### Deploying to Heroku
Deploying of this repo can be done manually by using cloning this repo and using the [Heroku cli](https://devcenter.heroku.com/articles/heroku-cli) or by using the Heroku Deploy button to easily deploy this to Heroku.

### Heroku Deplooy
[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://www.heroku.com/deploy/?template=https://github.com/zzhaobraze/lookup-admin)

#### App name
Enter a globally unique app name.

#### Environment Variables
* LOCKUP_CODEWORD - Codeword for access
* LOCKUP_HINT - Codeword hint
* LOOKUP_DB_URL - Postgres connection string.

