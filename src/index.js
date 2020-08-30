const express = require('express');
const mongoose = require('mongoose');
const fawn = require('fawn');
const config = require('./config.js');
const groupRoute = require('./routes/group.js');
const { userRoute } = require('./routes/user.js');
const { usersRoute } = require('./routes/user.js');
const tournamentRoute = require('./routes/tournament.js');
const fixtureRoute = require('./routes/fixture.js');
const leagueRoute = require('./routes/league.js');
const authRoute = require('./routes/auth');
const Authentication = require('./auth/auth.js');
const logger = require('./utils/logger.js');

const app = express();

app.use(express.json({
  limit: config.bodyLimit,
}));

app.use(Authentication.filter());

mongoose.set('useUnifiedTopology', true);
mongoose.connect(config.mongoUrl, { useNewUrlParser: true, useFindAndModify: false });
mongoose.set('useCreateIndex', true);

fawn.init(mongoose);

app.use('/', authRoute);

app.use('/groups', groupRoute);
app.use('/users', usersRoute);
app.use('/user', userRoute);
app.use('/tournaments', tournamentRoute);
app.use('/fixtures', fixtureRoute);
app.use('/leagues', leagueRoute);

app.use('*', (req, res) => {
  res.status(404).send('No api found!');
});

const roller = fawn.Roller();
roller.roll()
  .then(() => {
    app.listen(config.port);
    logger.info(`Started on port ${config.port} and env ${app.get('env')}`);
    module.exports = app;
  });
